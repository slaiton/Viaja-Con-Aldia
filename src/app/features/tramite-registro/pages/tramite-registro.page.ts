import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import {
  DatosConductorTramite,
  DatosTerceroOpcionalTramite,
  DatosTrailerTramite,
  DatosVehiculoTramite,
  EntidadTramiteSlug,
  EntidadTramiteUpper,
  IniciarRegistroData,
  PasoRegistro
} from '@core/models/tramite-registro.model';
import { CoreLoggerService } from '@core/services/core-logger.service';
import { SessionStore } from '@core/session/session.store';
import { EntidadOpcionalSlug } from '../components/paso-opcionales/paso-opcionales.component';
import {
  OtpRegistroActionResult,
  TramiteRegistroFacade,
  TramiteRegistroState
} from '../services/tramite-registro.facade';

export type EtapaBorrador = 'conductor' | 'vehiculo' | 'opcionales' | 'documentos';

@Component({
  selector: 'app-tramite-registro',
  templateUrl: './tramite-registro.page.html',
  styleUrls: ['./tramite-registro.page.scss'],
  providers: [TramiteRegistroFacade]
})
export class TramiteRegistroPage implements OnInit {
  @ViewChild(IonContent) content?: IonContent;
  public readonly state$: Observable<TramiteRegistroState>;
  public etapaActual: EtapaBorrador = 'conductor';

  public readonly iniciarOtpFn: (
    cedula: string,
    placa: string,
    celular: string
  ) => Promise<OtpRegistroActionResult<IniciarRegistroData>>;

  public readonly verificarOtpFn: (
    cedula: string,
    placa: string,
    celular: string,
    codigo: string
  ) => Promise<OtpRegistroActionResult<void>>;

  constructor(
    private readonly facade: TramiteRegistroFacade,
    private readonly sessionStore: SessionStore,
    private readonly toastCtrl: ToastController,
    private readonly coreLogger: CoreLoggerService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.state$ = this.facade.state$;
    this.iniciarOtpFn = (c, p, cel) => this.facade.iniciarSolicitudOtp(c, p, cel);
    this.verificarOtpFn = (c, p, cel, cod) => this.facade.verificarSolicitudOtp(c, p, cel, cod);
  }

  get cedulaSesion(): string | null {
    return this.sessionStore.snapshot.cedula;
  }

  get numeroEtapa(): number {
    const mapa: Record<EtapaBorrador, number> = {
      conductor: 1,
      vehiculo: 2,
      opcionales: 3,
      documentos: 4
    };
    return mapa[this.etapaActual];
  }

  get tituloEtapa(): string {
    const titulos: Record<EtapaBorrador, string> = {
      conductor: 'Tus datos personales',
      vehiculo: 'Datos del vehículo',
      opcionales: 'Tráiler y terceros (opcional)',
      documentos: 'Fotos de documentos'
    };
    return titulos[this.etapaActual];
  }

  ngOnInit(): void {
    void this.facade.inicializarFlujo();
  }

  ionViewWillEnter(): void {
    void this.facade.inicializarFlujo();
  }

  limpiarMensajes(): void {
    this.facade.limpiarMensajes();
  }

  seleccionarEtapa(etapa: EtapaBorrador): void {
    const snap = this.facade.snapshot;
    this.coreLogger.info('PAGE_SELECCIONAR_ETAPA', {
      desde: this.etapaActual,
      hacia: etapa,
      cargando: snap.cargando,
      guardando: snap.guardando,
      estadoRegistro: snap.estadoRegistro
    });
    this.etapaActual = etapa;
    if (etapa === 'documentos') {
      this.facade.avanzarADocumentosDesdeOpcionales();
    } else {
      this.facade.limpiarMensajes();
    }
    this.cdr.markForCheck();
    void this.content?.scrollToTop(250);
  }

  pasoCompleto(pasos: PasoRegistro[], entidad: EntidadTramiteUpper): boolean {
    return Boolean(pasos.find((p) => p.entidad === entidad)?.con_datos);
  }

  async onGuardarConductor(datos: DatosConductorTramite): Promise<void> {
    const ok = await this.facade.guardarEntidad('conductor', datos);
    if (ok) {
      await this.mostrarToast('Datos del conductor guardados');
      this.etapaActual = 'vehiculo';
      void this.content?.scrollToTop(250);
    }
  }

  async onGuardarVehiculo(datos: DatosVehiculoTramite): Promise<void> {
    const ok = await this.facade.guardarEntidad('vehiculo', datos);
    if (ok) {
      await this.mostrarToast('Datos del vehículo guardados');
      this.etapaActual = 'opcionales';
      void this.content?.scrollToTop(250);
    }
  }

  async onGuardarOpcional(event: {
    entidad: EntidadOpcionalSlug;
    datos: DatosTrailerTramite | DatosTerceroOpcionalTramite;
  }): Promise<void> {
    const ok = await this.facade.guardarEntidad(event.entidad, event.datos);
    if (ok) {
      await this.mostrarToast(`Datos de ${event.entidad} guardados`);
    }
  }

  async onEliminarOpcional(entidad: EntidadOpcionalSlug): Promise<void> {
    const ok = await this.facade.eliminarEntidadOpcional(entidad);
    if (ok) {
      await this.mostrarToast(`Sección ${entidad} retirada`);
    }
  }

  async onSubirArchivo(event: {
    entidad: EntidadTramiteSlug;
    tipo: string;
    data64: string;
  }): Promise<void> {
    const ok = await this.facade.subirSoporte(event.entidad, event.tipo, event.data64);
    if (ok) {
      await this.mostrarToast('Documento cargado correctamente');
    }
  }

  async onEliminarArchivo(archivoId: number): Promise<void> {
    const ok = await this.facade.eliminarSoporte(archivoId);
    if (ok) {
      await this.mostrarToast('Documento eliminado');
    }
  }

  async onEnviarTramite(): Promise<void> {
    const ok = await this.facade.enviarTramiteARevision();
    if (ok) {
      await this.mostrarToast('Registro enviado a revisión por operaciones ALDÍA');
    }
  }

  onIrAPasoDesdeError(paso: string): void {
    if (paso === 'conductor' || paso === 'vehiculo' || paso === 'opcionales' || paso === 'documentos') {
      this.etapaActual = paso;
    } else {
      this.etapaActual = 'opcionales';
    }
  }

  onContinuarOpcionales(): void {
    const snap = this.facade.snapshot;
    const pasos = snap.pasos || [];
    this.coreLogger.info('PAGE_PASO3_ON_CONTINUAR_OPCIONALES', {
      etapaPrevia: this.etapaActual,
      cargando: snap.cargando,
      guardando: snap.guardando,
      estadoRegistro: snap.estadoRegistro,
      tramiteId: snap.tramite?.id ?? null,
      conductorCompleto: this.pasoCompleto(pasos, 'CONDUCTOR'),
      vehiculoCompleto: this.pasoCompleto(pasos, 'VEHICULO'),
      tieneTrailer: this.facade.tieneEntidad('TRAILER'),
      tienePropietario: this.facade.tieneEntidad('PROPIETARIO'),
      tieneTenedor: this.facade.tieneEntidad('TENEDOR')
    });

    // Transición inmediata y sin condiciones bloqueantes al Paso 4 (Soporte Fotográfico).
    this.etapaActual = 'documentos';
    this.facade.avanzarADocumentosDesdeOpcionales();
    this.cdr.markForCheck();
    this.coreLogger.info('PAGE_PASO3_TRANSICION_DOCUMENTOS_OK', { etapaActual: this.etapaActual });
    void this.content?.scrollToTop(250);
  }

  private async mostrarToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      position: 'top',
      color: 'success'
    });
    await toast.present();
  }

  async onReabrir(): Promise<void> {
    await this.facade.reabrirTramiteRechazado();
  }

  async onActualizarEstado(): Promise<void> {
    await this.facade.inicializarFlujo();
  }

  async onCerrarSesion(): Promise<void> {
    await this.facade.cerrarSesionRegistro();
  }
}
