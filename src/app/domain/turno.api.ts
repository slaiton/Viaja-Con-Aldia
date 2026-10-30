import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { StorageService } from '@core/services/storage.service';
import { AldiaDatabase } from '@core/offline/database';
import { Turno, TurnoResponse } from '@core/models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnoApi {
  private readonly baseUrlAldia = 'https://api.aldialogistica.com/api';
  private readonly baseUrl3SL = 'https://api.3slogistica.com/api';

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private db: AldiaDatabase
  ) {}

  private getPlaca(): string {
    const p = this.storage.get<string>('placa') || localStorage.getItem('placa') || '';
    return String(p).replace(/^["']|["']$/g, '').trim();
  }

  private getToken(): string {
    const t = this.storage.get<string>('token') || localStorage.getItem('token') || '';
    return String(t).replace(/^["']|["']$/g, '').trim();
  }

  /**
   * Consulta el turno actual del vehículo en el backend de Aldia.
   * Utiliza firstValueFrom y persistencia local en Dexie.js.
   */
  async getTurnoActual(placaParam?: string): Promise<TurnoResponse> {
    const placa = (placaParam || this.getPlaca()).trim();
    const cacheKey = `turno_actual_${placa}`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'user': 'USUSEGINT',
      'password': '12249'
    });

    const params = new HttpParams({
      fromString: `placa=${encodeURIComponent(placa)}`
    });

    try {
      const resp: any = await firstValueFrom(
        this.http.get<any>(`${this.baseUrlAldia}/enturnamiento`, { headers, params }).pipe(
          timeout(10000),
          retry(1),
          catchError(async (err) => {
            console.warn('[TurnoApi] Error al consultar /enturnamiento. Buscando respaldo en Dexie...', err);
            const cached = await this.db.getCache<TurnoResponse>(cacheKey);
            if (cached) {
              return cached;
            }
            throw err;
          })
        )
      );

      const response: TurnoResponse = {
        code: String(resp?.code || '204'),
        data: resp?.data || null,
        message: resp?.message
      };

      if (response.code === '200') {
        // Guardar turno en Dexie con TTL de 6 horas
        await this.db.setCache(cacheKey, response, 6 * 60 * 60 * 1000);
      }

      return response;
    } catch (error) {
      console.warn('[TurnoApi] Sin respuesta de red ni respaldo local para turno:', error);
      return { code: '204', data: null, message: 'Sin conexión para verificar turno' };
    }
  }

  /**
   * Crea un nuevo enturnamiento. Si no hay conexión o falla la petición, encola la acción en outbox_queue.
   */
  async crearTurno(turnoData: Turno): Promise<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'user': 'USUSEGINT',
      'password': '12249'
    });

    const url = `${this.baseUrlAldia}/enturnamiento`;

    try {
      const resp = await firstValueFrom(
        this.http.post(url, turnoData, { headers }).pipe(
          timeout(10000),
          retry(1)
        )
      );

      // Invalida caché de turno para forzar lectura del nuevo estado
      await this.db.deleteCache(`turno_actual_${turnoData.placa}`);
      return resp;
    } catch (err: any) {
      console.warn('[TurnoApi] Error creando turno. Encolando en outbox_queue...', err);
      await this.db.outbox_queue.add({
        endpoint: url,
        method: 'POST',
        payload: turnoData,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'user': 'USUSEGINT',
          'password': '12249'
        },
        createdAt: Date.now(),
        status: 'PENDING',
        retryCount: 0,
        lastError: err?.message || 'Error de red'
      });
      throw err;
    }
  }

  /**
   * Consulta zonas de enturnamiento disponibles en 3SL.
   */
  async getZonas(nombreOrigen: string, tokenParam?: string): Promise<any> {
    const token = (tokenParam || this.getToken()).trim();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = new HttpParams({
      fromString: `nombreOrigen=${encodeURIComponent(nombreOrigen)}`
    });

    return firstValueFrom(
      this.http.get(`${this.baseUrl3SL}/zonas`, { headers, params }).pipe(
        timeout(10000),
        retry(1)
      )
    );
  }

  /**
   * Determina la zona geográfica a partir de coordenadas GPS mediante 3SL.
   */
  async getZonaGps(lat: number, lon: number, tokenParam?: string): Promise<any> {
    const token = (tokenParam || this.getToken()).trim();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = new HttpParams({
      fromString: `latitud=${lat}&longitud=${lon}`
    });

    return firstValueFrom(
      this.http.get(`${this.baseUrl3SL}/zonas/gps`, { headers, params }).pipe(
        timeout(10000),
        retry(1)
      )
    );
  }
}
