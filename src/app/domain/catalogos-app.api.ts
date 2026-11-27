import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap, timeout } from 'rxjs/operators';
import { API_CONFIG, ApiConfig } from '@core/config/api.config';
import { CatalogoItem, CatalogoNombre } from '@core/models/tramite-registro.model';
import { CoreLoggerService } from '@core/services/core-logger.service';

interface CatalogoResponseWrapper {
  success?: boolean;
  data?: CatalogoItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CatalogosAppApi {
  private readonly cache = new Map<string, CatalogoItem[]>();

  constructor(
    private readonly http: HttpClient,
    @Inject(API_CONFIG) private readonly apiConfig: ApiConfig,
    private readonly coreLogger: CoreLoggerService
  ) {}

  private get baseUrl(): string {
    return this.apiConfig.baseUrlAldia.replace(/\/+$/, '');
  }

  clearCache(): void {
    this.cache.clear();
  }

  obtenerCatalogo(nombre: CatalogoNombre, marcaId?: number): Observable<CatalogoItem[]> {
    const cacheKey = `${nombre}:${marcaId ?? ''}`;
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) {
      return of(cached);
    }

    let params = new HttpParams();
    if (nombre === 'claselinea' && marcaId !== undefined && marcaId !== null) {
      params = params.set('marca', String(marcaId));
    }

    return this.http
      .get<CatalogoResponseWrapper | CatalogoItem[]>(`${this.baseUrl}/app/catalogos/${nombre}`, { params })
      .pipe(
        timeout(8000),
        map((res) => {
          if (Array.isArray(res)) {
            return res;
          }
          if (res && Array.isArray(res.data)) {
            return res.data;
          }
          return [];
        }),
        tap((items) => {
          this.cache.set(cacheKey, items);
        }),
        catchError((error: unknown) => {
          this.coreLogger.logSafeError(`CATALOGO_ERROR:${nombre}:${error instanceof Error ? error.message : String(error)}`);
          this.cache.set(cacheKey, []);
          return of([]);
        })
      );
  }
}
