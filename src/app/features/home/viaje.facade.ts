import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlatformCameraService, CameraResultType, CameraSource } from '@core/platform/camera-platform.service';
import { ViajeApi } from '@domain/viaje.api';
import { ImageCompressionService } from '@core/services/image-compression.service';
import { OutboxSyncService } from '@core/offline/outbox-sync.service';
import {
  EstadoOperativoCabina,
  PODSubmitResult,
  PODUploadPayload,
  RemesaPOD,
  ViajeActivo
} from '@core/models/viaje.model';

@Injectable({
  providedIn: 'root'
})
export class ViajeFacade {
  private viajeActivoSubject = new BehaviorSubject<ViajeActivo | null>(null);
  private estadoOperativoSubject = new BehaviorSubject<EstadoOperativoCabina>('SIN_TURNO');
  private modalQROpenSubject = new BehaviorSubject<boolean>(false);
  private modalPODOpenSubject = new BehaviorSubject<boolean>(false);
  private remesaSeleccionadaSubject = new BehaviorSubject<RemesaPOD | null>(null);
  private fotoPODSubject = new BehaviorSubject<{ base64: string; webviewPath: string; sizeKb: number } | null>(null);
  private isUploadingSubject = new BehaviorSubject<boolean>(false);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  public readonly viajeActivo$: Observable<ViajeActivo | null> = this.viajeActivoSubject.asObservable();
  public readonly estadoOperativo$: Observable<EstadoOperativoCabina> = this.estadoOperativoSubject.asObservable();
  public readonly modalQROpen$: Observable<boolean> = this.modalQROpenSubject.asObservable();
  public readonly modalPODOpen$: Observable<boolean> = this.modalPODOpenSubject.asObservable();
  public readonly remesaSeleccionada$: Observable<RemesaPOD | null> = this.remesaSeleccionadaSubject.asObservable();
  public readonly fotoPOD$: Observable<{ base64: string; webviewPath: string; sizeKb: number } | null> = this.fotoPODSubject.asObservable();
  public readonly isUploading$: Observable<boolean> = this.isUploadingSubject.asObservable();
  public readonly isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();
  public readonly isOnline$: Observable<boolean> = this.outboxSync.isOnline$;

  constructor(
    private viajeApi: ViajeApi,
    private compressionService: ImageCompressionService,
    private outboxSync: OutboxSyncService,
    private cameraPlatform: PlatformCameraService
  ) {}

  /**
   * Carga el estado del viaje activo consultando la API o la caché local offline.
   */
  async cargarViaje(placa: string): Promise<ViajeActivo | null> {
    if (!placa) return null;

    this.isLoadingSubject.next(true);
    try {
      const viaje = await this.viajeApi.getViajeActivo(placa);
      if (viaje && viaje.estado === 'EN_VIAJE_RNDC') {
        this.viajeActivoSubject.next(viaje);
        this.estadoOperativoSubject.next('EN_VIAJE_RNDC');
      } else {
        this.desactivarViaje();
      }
      return viaje;
    } catch {
      this.desactivarViaje();
      return null;
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /**
   * Activa un viaje RNDC simulado en memoria para propósitos de prueba visual / QA.
   * NO se guarda en la base de datos Dexie para asegurar que al reiniciar o iniciar sesión,
   * el conductor vuelva siempre a la pantalla normal de Home.
   */
  async activarViajeDemo(placaParam: string, conductorNombre: string = 'Conductor Aldía'): Promise<ViajeActivo> {
    const placa = (placaParam || 'WMO412').toUpperCase().trim();

    const viajeDemo: ViajeActivo = {
      idViaje: `VIAJE-RNDC-DEMO-${placa}`,
      estado: 'EN_VIAJE_RNDC',
      enRutaNacional: true,
      manifiesto: {
        numeroMEC: 'MEC-2026-98124',
        origen: 'Buenaventura (Valle)',
        destino: 'Bogotá D.C.',
        fechaDespacho: '30 Oct 2026, 06:30 AM',
        placa: placa,
        conductor: conductorNombre,
        cedulaConductor: '1098765432',
        poseedor: 'Aldía Logística S.A.',
        empresaTransporte: 'Aldía Logística S.A.',
        polizaSeguro: 'POL-SEGUROS-ESTADO-9912',
        valorFlete: 4850000,
        qrPayload: `https://rndc.mintransporte.gov.co/consultas/mec?doc=MEC-2026-98124&vhc=${placa}`
      },
      remesas: [
        {
          numeroRemesa: 'REM-88412-A',
          puntoEntrega: 'CEDI Éxito Fontibón, Bogotá',
          destinatario: 'Almacenes Éxito S.A.',
          kilos: 32000,
          unidades: 28,
          estado: 'EN_DESCARGUE',
          observaciones: 'Descargue en muelle #4 con sello de seguridad intacto'
        }
      ],
      updatedAt: Date.now()
    };

    this.viajeActivoSubject.next(viajeDemo);
    this.estadoOperativoSubject.next('EN_VIAJE_RNDC');
    return viajeDemo;
  }

  /**
   * Desactiva el viaje activo y regresa el estado operativo a turno normal.
   */
  desactivarViaje(): void {
    this.viajeActivoSubject.next(null);
    this.estadoOperativoSubject.next('SIN_TURNO');
  }

  abrirQRDITRA(): void {
    this.modalQROpenSubject.next(true);
  }

  cerrarQRDITRA(): void {
    this.modalQROpenSubject.next(false);
  }

  abrirCapturaPOD(remesa: RemesaPOD): void {
    this.remesaSeleccionadaSubject.next(remesa);
    this.fotoPODSubject.next(null);
    this.modalPODOpenSubject.next(true);
  }

  cerrarCapturaPOD(): void {
    this.modalPODOpenSubject.next(false);
    this.fotoPODSubject.next(null);
    this.remesaSeleccionadaSubject.next(null);
  }

  /**
   * Captura la foto de la remesa firmada mediante el wrapper PlatformCameraService
   * y la comprime a WebP (< 150 KB).
   */
  async capturarFotoPOD(source: CameraSource = CameraSource.Camera): Promise<void> {
    try {
      const image = await this.cameraPlatform.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source
      });

      if (!image.dataUrl) return;

      const comprimida = await this.compressionService.compressImage(image.dataUrl, {
        quality: 0.75,
        maxDimension: 1280,
        preferredFormat: 'image/webp'
      });

      const sizeKb = Math.round(comprimida.sizeBytes / 1024);

      this.fotoPODSubject.next({
        base64: comprimida.dataUrl,
        webviewPath: comprimida.dataUrl,
        sizeKb
      });
    } catch {
      // Cancelación de cámara manejada silenciosamente
    }
  }

  /**
   * Envía el cumplido (POD) al backend o lo encola en Dexie si el conductor
   * está en muelle subterráneo sin señal.
   */
  async confirmarEnvioPOD(): Promise<PODSubmitResult> {
    const foto = this.fotoPODSubject.getValue();
    const remesa = this.remesaSeleccionadaSubject.getValue();
    const viaje = this.viajeActivoSubject.getValue();

    if (!foto || !remesa || !viaje) {
      return {
        success: false,
        offline: false,
        message: 'No se ha capturado la foto del cumplido o falta información de la remesa.'
      };
    }

    const payload: PODUploadPayload = {
      numeroRemesa: remesa.numeroRemesa,
      numeroMEC: viaje.manifiesto.numeroMEC,
      placa: viaje.manifiesto.placa,
      imagenWebP: foto.base64,
      sizeBytes: foto.sizeKb * 1024,
      timestamp: new Date().toISOString(),
      observacion: remesa.observaciones
    };

    this.isUploadingSubject.next(true);

    try {
      const result = await this.viajeApi.subirCumplidoPOD(payload);

      // Actualizar el estado local de la remesa a 'ENTREGADO'
      remesa.estado = 'ENTREGADO';
      remesa.cumplidoFotoWebP = foto.base64;
      remesa.cumplidoSizeKb = foto.sizeKb;
      remesa.fechaCumplido = new Date().toLocaleString('es-CO');

      // Actualizar viaje en memoria y en Dexie
      this.viajeActivoSubject.next({ ...viaje });
      await this.viajeApi.guardarViajeEnCache(viaje);

      this.cerrarCapturaPOD();
      return result;
    } finally {
      this.isUploadingSubject.next(false);
    }
  }
}
