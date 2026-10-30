import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { StorageService } from '@core/services/storage.service';
import { AldiaDatabase } from '@core/offline/database';
import { DocumentoItem, DocumentoValidacionResponse } from '@core/models/documento.model';

@Injectable({
  providedIn: 'root'
})
export class VehiculoApi {
  private readonly baseUrl3SL = 'https://api.3slogistica.com/api';
  private readonly baseUrlAldia = 'https://api.aldialogistica.com/api';

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private db: AldiaDatabase
  ) {}

  private getCedula(): string {
    const c = this.storage.get<string>('conductor') || localStorage.getItem('conductor') || '';
    return String(c).replace(/^["']|["']$/g, '').trim();
  }

  private getPlaca(): string {
    const p = this.storage.get<string>('placa') || localStorage.getItem('placa') || '';
    return String(p).replace(/^["']|["']$/g, '').trim();
  }

  private getToken(): string {
    const t = this.storage.get<string>('token') || localStorage.getItem('token') || '';
    return String(t).replace(/^["']|["']$/g, '').trim();
  }

  /**
   * Consulta el estado de vigencia de los documentos del vehículo y conductor ante 3SL.
   * Utiliza firstValueFrom y caché offline en Dexie.js.
   */
  async validateFechasDocumentos(
    cedulaParam?: string,
    placaParam?: string,
    tokenParam?: string
  ): Promise<DocumentoValidacionResponse> {
    const cedula = (cedulaParam || this.getCedula()).trim();
    const placa = (placaParam || this.getPlaca()).trim();
    const token = (tokenParam || this.getToken()).trim();

    const cacheKey = `docs_fechas_${cedula}_${placa}`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = new HttpParams({
      fromString: `cedula=${encodeURIComponent(cedula)}&placa=${encodeURIComponent(placa)}`
    });

    try {
      const resp: any = await firstValueFrom(
        this.http.get<any>(`${this.baseUrl3SL}/document/validate`, { headers, params }).pipe(
          timeout(10000),
          retry(1),
          catchError(async (err) => {
            console.warn('[VehiculoApi] Error consultando /document/validate en 3SL. Buscando en Dexie...', err);
            const cached = await this.db.getCache<DocumentoValidacionResponse>(cacheKey);
            if (cached) {
              return cached;
            }
            throw err;
          })
        )
      );

      // Normalizar estructura de documentos
      const docsVencidos: DocumentoItem[] = [];
      let statusDoc = true;

      if (resp && resp.status === false && resp.data) {
        statusDoc = false;
        if (Array.isArray(resp.data.vehiculo)) {
          for (const item of resp.data.vehiculo) {
            docsVencidos.push({
              nombre: item.nombre,
              fecha: item.fecha,
              vencido: true
            });
          }
        }
        if (Array.isArray(resp.data.conductor)) {
          for (const item of resp.data.conductor) {
            docsVencidos.push({
              nombre: item.nombre,
              fecha: item.fecha,
              vencido: true
            });
          }
        }
      }

      const resultado: DocumentoValidacionResponse = {
        status: statusDoc,
        docs: docsVencidos,
        data: resp.data
      };

      // Guardar en Dexie con TTL de 12 horas
      await this.db.setCache(cacheKey, resultado, 12 * 60 * 60 * 1000);

      return resultado;
    } catch (error) {
      console.warn('[VehiculoApi] No se pudo verificar fechas de documentos en red ni en caché:', error);
      // Retornar estado neutro tolerante para no romper la navegación si está offline
      return { status: true, docs: [] };
    }
  }

  /**
   * Consulta capacitaciones pendientes del conductor en 3SL.
   */
  async getCapacitacionesPendientes(cedulaParam?: string, tokenParam?: string): Promise<any[]> {
    const cedula = (cedulaParam || this.getCedula()).trim();
    const token = (tokenParam || this.getToken()).trim();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = new HttpParams({
      fromString: `lecturas=1&cedula=${encodeURIComponent(cedula)}`
    });

    try {
      const resp: any = await firstValueFrom(
        this.http.get<any[]>(`${this.baseUrl3SL}/capacitaciones`, { headers, params }).pipe(
          timeout(8000),
          catchError(() => throwError(() => new Error('Error consultando capacitaciones')))
        )
      );
      return Array.isArray(resp) ? resp : [];
    } catch {
      return [];
    }
  }

  /**
   * Envía el formulario preoperacional al backend de Aldia con soporte de encolamiento offline si falla la conexión.
   */
  async postPreoperacional(payload: any): Promise<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'user': 'USUSEGINT',
      'password': '12249'
    });

    const url = `${this.baseUrlAldia}/tercero/preoperacional`;

    try {
      return await firstValueFrom(
        this.http.post(url, payload, { headers }).pipe(
          timeout(10000),
          retry(1)
        )
      );
    } catch (err: any) {
      console.warn('[VehiculoApi] Falla al enviar preoperacional. Encolando en outbox_queue...', err);
      await this.db.outbox_queue.add({
        endpoint: url,
        method: 'POST',
        payload,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'user': 'USUSEGINT',
          'password': '12249'
        },
        createdAt: Date.now(),
        status: 'PENDING',
        retryCount: 0,
        lastError: err?.message || 'Error de conexión'
      });
      throw err;
    }
  }
}
