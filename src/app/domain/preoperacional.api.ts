import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { timeout, retry } from 'rxjs/operators';
import { Network } from '@capacitor/network';
import { environment } from '@env/environment';
import { AldiaDatabase } from '@core/offline/database';
import {
  PreguntaPreoperacional,
  PreguntaPreoperacionalRaw,
  PreoperacionalPayload,
  PreoperacionalSubmitResult
} from '@core/models/preoperacional.model';

@Injectable({
  providedIn: 'root'
})
export class PreoperacionalApi {
  private readonly baseUrl: string;
  private readonly cacheKey = 'preoperacional_preguntas_activo';

  constructor(
    private http: HttpClient,
    private db: AldiaDatabase
  ) {
    const rawUri = environment.aldia?.uri || 'https://api.aldialogistica.com/api/';
    this.baseUrl = rawUri.replace(/\/+$/, '');
  }

  /**
   * Genera los encabezados requeridos por Aldia aislando el client_id y client_secret.
   */
  private getAldiaHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'X-Client-Id': environment.aldia?.client_id || '',
      'X-Client-Secret': environment.aldia?.client_secret || ''
    });
  }

  /**
   * Obtiene la lista de preguntas activas.
   * Utiliza primero la red con caché en Dexie (TTL 24h), o fallback local si no hay conexión.
   */
  async getPreguntas(): Promise<PreguntaPreoperacional[]> {
    try {
      const netStatus = await Network.getStatus();

      if (netStatus.connected) {
        const url = `${this.baseUrl}/tercero/preoperacional/preguntas?estado=ACTIVO`;
        const response: any = await firstValueFrom(
          this.http.get<any>(url, { headers: this.getAldiaHeaders() }).pipe(
            timeout(10000),
            retry(1)
          )
        );

        if (response && response.data && Array.isArray(response.data)) {
          const ordenadas = [...response.data].sort(
            (a: PreguntaPreoperacionalRaw, b: PreguntaPreoperacionalRaw) =>
              (a.subpreope_orden || 0) - (b.subpreope_orden || 0)
          );

          const normalizadas: PreguntaPreoperacional[] = ordenadas.map((item: PreguntaPreoperacionalRaw) => ({
            id: item.subpreope_codigo,
            texto: item.subpreope_nombre,
            descripcion: item.subpreope_descripcion || '',
            categoria: item.subpreope_categoria || 'General',
            opcional: String(item.subpreope_restrictivo).toUpperCase() === 'SI',
            orden: item.subpreope_orden || 0
          }));

          // Guardar en Dexie con TTL de 24 horas
          await this.db.setCache(this.cacheKey, normalizadas, 24 * 60 * 60 * 1000);
          return normalizadas;
        }
      }
    } catch (error) {
      console.warn('[PreoperacionalApi] Falló consulta de preguntas por red. Buscando respaldo en Dexie...', error);
    }

    // Fallback: Recuperar preguntas cacheadas en Dexie
    const cached = await this.db.getCache<PreguntaPreoperacional[]>(this.cacheKey);
    if (cached && cached.length > 0) {
      console.info('[PreoperacionalApi] Preguntas recuperadas de la caché local offline.');
      return cached;
    }

    return [];
  }

  /**
   * Envía el formulario de preoperacional.
   * Si no hay red o si la petición falla por timeout, encola la transacción en outbox_queue.
   */
  async enviarPreoperacional(payload: PreoperacionalPayload): Promise<PreoperacionalSubmitResult> {
    const endpoint = `${this.baseUrl}/tercero/preoperacional`;
    const headersMap: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Client-Id': environment.aldia?.client_id || '',
      'X-Client-Secret': environment.aldia?.client_secret || ''
    };

    try {
      const netStatus = await Network.getStatus();

      if (netStatus.connected) {
        const response: any = await firstValueFrom(
          this.http.post<any>(endpoint, payload, { headers: this.getAldiaHeaders() }).pipe(
            timeout(15000),
            retry(1)
          )
        );

        return {
          success: true,
          offline: false,
          message: typeof response?.data === 'string' ? response.data : 'Inspección enviada exitosamente a Aldía.',
          data: response
        };
      }
    } catch (networkError: any) {
      console.warn('[PreoperacionalApi] Error de red o timeout al enviar. Procediendo a encolar en Outbox:', networkError);
    }

    // Modo Offline o Falla de Red: Encolar en Dexie outbox_queue
    try {
      await this.db.outbox_queue.add({
        endpoint,
        method: 'POST',
        payload,
        headers: headersMap,
        createdAt: Date.now(),
        status: 'PENDING',
        retryCount: 0,
        lastError: 'Guardado offline por interrupción de señal'
      });

      return {
        success: true,
        offline: true,
        message: 'Inspección guardada localmente en tu dispositivo. Se enviará de forma automática al recuperar señal.'
      };
    } catch (dbError) {
      console.error('[PreoperacionalApi] Error crítico guardando en outbox_queue:', dbError);
      return {
        success: false,
        offline: true,
        message: 'No fue posible guardar la inspección localmente. Por favor reintenta.'
      };
    }
  }
}

