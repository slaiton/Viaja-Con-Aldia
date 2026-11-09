import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { timeout, retry } from 'rxjs/operators';
import { AldiaDatabase } from '@core/offline/database';
import { API_CONFIG, ApiConfig } from '@core/config/api.config';
import { PlatformNetworkService } from '@core/platform/network-platform.service';
import { ViajeMapper } from './viaje.mapper';
import {
  PODSubmitResult,
  PODUploadPayload,
  ViajeActivo
} from '@core/models/viaje.model';

@Injectable({
  providedIn: 'root'
})
export class ViajeApi {
  private readonly TTL_7_DIAS = 7 * 24 * 60 * 60 * 1000;

  constructor(
    private readonly http: HttpClient,
    private readonly db: AldiaDatabase,
    private readonly network: PlatformNetworkService,
    @Inject(API_CONFIG) private readonly apiConfig: ApiConfig
  ) {}

  private getCleanHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json'
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
      const net = await this.network.getStatus();

      if (net.connected) {
        const url = `${this.apiConfig.baseUrlAldia}/manifiestos?placa=${encodeURIComponent(placa)}`;
        const resp: unknown = await firstValueFrom(
          this.http.get<unknown>(url, { headers: this.getCleanHeaders() }).pipe(
            timeout(6000),
            retry(1)
          )
        ).catch(() => null);

        const viaje = ViajeMapper.mapToViajeActivo(resp, placa);

        if (viaje) {
          await this.db.setCache(cacheKey, viaje, this.TTL_7_DIAS);
          return viaje;
        } else {
          await this.db.cache_store.delete(cacheKey).catch(() => null);
          return null;
        }
      } else {
        const cached = await this.db.getCache<ViajeActivo>(cacheKey);
        if (cached && !cached.idViaje?.includes('DEMO') && cached.estado === 'EN_VIAJE_RNDC') {
          return cached;
        }
      }
    } catch {
      // Manejo silencioso de red sin fugas en consola
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
   * Operación POST estricta sin retry. En caso de desconexión, se encola en outbox_queue.
   */
  async subirCumplidoPOD(payload: PODUploadPayload): Promise<PODSubmitResult> {
    const endpoint = `${this.apiConfig.baseUrlAldia}/documento`;
    const headersMap: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json'
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
      const net = await this.network.getStatus();

      if (net.connected) {
        const resp: any = await firstValueFrom(
          this.http.post<any>(endpoint, bodyEnvio, { headers: this.getCleanHeaders() }).pipe(
            timeout(15000)
            // Regla DevSentinel: retry(1) removido en POST no idempotente
          )
        );

        return {
          success: true,
          offline: false,
          message: typeof resp?.data === 'string' ? resp.data : 'Cumplido (POD) cargado exitosamente a Aldía.',
          data: resp
        };
      }
    } catch {
      // Conexión fallida: el flujo continúa hacia el almacenamiento offline
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
    } catch {
      return {
        success: false,
        offline: true,
        message: 'No fue posible guardar el cumplido en el dispositivo. Por favor reintente.'
      };
    }
  }
}
