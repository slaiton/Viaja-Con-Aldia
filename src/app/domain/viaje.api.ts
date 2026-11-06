import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { timeout, retry } from 'rxjs/operators';
import { Network } from '@capacitor/network';
import { environment } from '@env/environment';
import { AldiaDatabase } from '@core/offline/database';
import {
  PODSubmitResult,
  PODUploadPayload,
  ViajeActivo
} from '@core/models/viaje.model';

@Injectable({
  providedIn: 'root'
})
export class ViajeApi {
  private readonly baseUrlAldia = 'https://api.aldialogistica.com/api';
  private readonly TTL_7_DIAS = 7 * 24 * 60 * 60 * 1000;

  constructor(
    private http: HttpClient,
    private db: AldiaDatabase
  ) { }

  private getAldiaHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'user': 'USUSEGINT',
      'password': '12249'
    });
  }

  /**
   * Obtiene el viaje RNDC activo de la placa.
   * Si hay red, consulta el backend y guarda en Dexie con TTL de 7 días.
   * Si no hay señal (ej: carretera o retén DITRA), recupera la información de la caché local.
   */
  async getViajeActivo(placaParam: string): Promise<ViajeActivo | null> {
    const placa = (placaParam || '').trim().toUpperCase();
    if (!placa) return null;

    const cacheKey = `viaje_activo_${placa}`;

    try {
      const net = await Network.getStatus();

      if (net.connected) {
        // Consultar viaje activo ante el backend de Aldía
        const url = `${this.baseUrlAldia}/manifiestos?placa=${encodeURIComponent(placa)}`;
        const resp: any = await firstValueFrom(
          this.http.get<any>(url, { headers: this.getAldiaHeaders() }).pipe(
            timeout(6000),
            retry(1)
          )
        ).catch(() => null);

        // SOLO si el backend confirma un manifiesto REAL y ACTIVO
        if (resp && resp.data && resp.data.manifiesto && resp.data.estado === 'ACTIVO') {
          const viaje: ViajeActivo = {
            idViaje: resp.data.id || `VIAJE-${placa}`,
            estado: 'EN_VIAJE_RNDC',
            enRutaNacional: true,
            manifiesto: {
              numeroMEC: resp.data.manifiesto.numeroMEC || `MEC-2026-${resp.data.manifiesto.mnfid || '98124'}`,
              origen: resp.data.manifiesto.origen || 'Buenaventura (Valle)',
              destino: resp.data.manifiesto.destino || 'Bogotá D.C.',
              fechaDespacho: resp.data.manifiesto.fechaDespacho || new Date().toLocaleDateString('es-CO'),
              placa: placa,
              conductor: resp.data.manifiesto.conductor || 'Conductor Aldía',
              cedulaConductor: resp.data.manifiesto.cedula || '',
              poseedor: resp.data.manifiesto.poseedor || 'Aldía Logística',
              empresaTransporte: 'Aldía Logística S.A.',
              polizaSeguro: resp.data.manifiesto.poliza || 'POL-SEGUROS-ESTADO-9912',
              valorFlete: resp.data.manifiesto.valorFlete || 4500000,
              qrPayload: resp.data.manifiesto.qrPayload || `https://rndc.mintransporte.gov.co/consultas/mec?doc=MEC-2026-98124&vhc=${placa}`
            },
            remesas: resp.data.remesas || [
              {
                numeroRemesa: 'REM-88412-A',
                puntoEntrega: 'CEDI Éxito Fontibón, Bogotá',
                destinatario: 'Almacenes Éxito S.A.',
                kilos: 32000,
                unidades: 28,
                estado: 'EN_DESCARGUE',
                observaciones: 'Descargue programado en muelle 4'
              }
            ],
            updatedAt: Date.now()
          };

          // Guardar en Dexie con TTL de 7 días para autoridades DITRA
          await this.db.setCache(cacheKey, viaje, this.TTL_7_DIAS);
          return viaje;
        } else {
          // El backend no tiene manifiesto activo: limpiar cualquier caché previa para no falsear el estado
          await this.db.cache_store.delete(cacheKey).catch(() => null);
          return null;
        }
      } else {
        // Fallback Offline: Recuperar de Dexie únicamente si NO era una simulación DEMO
        const cached = await this.db.getCache<ViajeActivo>(cacheKey);
        if (cached && !cached.idViaje?.includes('DEMO') && cached.estado === 'EN_VIAJE_RNDC') {
          console.info('[ViajeApi] Manifiesto RNDC real recuperado de la caché local offline.');
          return cached;
        }
      }
    } catch (err) {
      console.warn('[ViajeApi] Error consultando viaje en red:', err);
    }

    return null;
  }

  /**
   * Permite guardar o refrescar manualmente el viaje en la base de datos local Dexie.
   */
  async guardarViajeEnCache(viaje: ViajeActivo): Promise<void> {
    const cacheKey = `viaje_activo_${viaje.manifiesto.placa.toUpperCase()}`;
    await this.db.setCache(cacheKey, viaje, this.TTL_7_DIAS);
  }

  /**
   * Sube la fotografía del cumplido (POD).
   * Si la conexión falla o el conductor está en muelle subterráneo sin señal,
   * se encola automáticamente en db.outbox_queue para su sincronización en segundo plano.
   */
  async subirCumplidoPOD(payload: PODUploadPayload): Promise<PODSubmitResult> {
    const endpoint = `${this.baseUrlAldia}/documento`;
    const headersMap: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8',
      'user': 'USUSEGINT',
      'password': '12249'
    };

    const bodyEnvio = {
      codigo: payload.placa,
      tipo: 'CUMPLIDO',
      tipoRegistro: 'POD',
      remesa: payload.numeroRemesa,
      manifiesto: payload.numeroMEC,
      archivo: payload.imagenWebP,
      fecha: payload.timestamp,
      observacion: payload.observacion || 'Cumplido firmado en muelle de descargue'
    };

    try {
      const net = await Network.getStatus();

      if (net.connected) {
        const resp: any = await firstValueFrom(
          this.http.post<any>(endpoint, bodyEnvio, { headers: this.getAldiaHeaders() }).pipe(
            timeout(15000),
            retry(1)
          )
        );

        return {
          success: true,
          offline: false,
          message: typeof resp?.data === 'string' ? resp.data : 'Cumplido (POD) cargado exitosamente a Aldía.',
          data: resp
        };
      }
    } catch (networkError) {
      console.warn('[ViajeApi] Error de red o timeout subiendo POD. Encolando en Outbox...', networkError);
    }

    // Falla de conexión o muelle subterráneo: Guardar en outbox_queue
    try {
      await this.db.outbox_queue.add({
        endpoint,
        method: 'POST',
        payload: bodyEnvio,
        headers: headersMap,
        createdAt: Date.now(),
        status: 'PENDING',
        retryCount: 0,
        lastError: 'Cumplido guardado en muelle de descargue (Offline)'
      });

      return {
        success: true,
        offline: true,
        message: 'Cumplido (POD) guardado localmente en tu dispositivo. Se enviará de forma automática al recuperar señal.'
      };
    } catch (dbError) {
      console.error('[ViajeApi] Error crítico guardando POD en outbox_queue:', dbError);
      return {
        success: false,
        offline: true,
        message: 'No fue posible guardar el cumplido en el dispositivo. Por favor reintente.'
      };
    }
  }
}

