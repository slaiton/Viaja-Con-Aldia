import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom, throwError } from 'rxjs';
import { catchError, retry, shareReplay, tap, timeout } from 'rxjs/operators';
import { StorageService } from '@core/services/storage.service';
import { AldiaDatabase } from '@core/offline/database';
import { Conductor, Conductor3SL, RespuestaIngresos3SL, mapearConductor3SL } from '@core/models/conductor.model';

@Injectable({
  providedIn: 'root'
})
export class ConductorApi {
  private readonly baseUrl3SL = 'https://api.3slogistica.com/api';
  private readonly baseUrlAldia = 'https://api.aldialogistica.com/api';

  // Caché en memoria y deduplicación de peticiones concurrentes
  private inFlightRequest$: Observable<Conductor> | null = null;
  private inFlightCredentialsKey: string | null = null;
  private cachedConductor: Conductor | null = null;

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private db: AldiaDatabase
  ) {}

  /**
   * Obtiene la cédula activa desde StorageService o localStorage.
   */
  private getCedulaActiva(): string {
    const cedula = this.storage.get<string>('conductor') || localStorage.getItem('conductor') || '';
    return String(cedula).replace(/^["']|["']$/g, '').trim();
  }

  /**
   * Obtiene la placa activa desde StorageService o localStorage.
   */
  private getPlacaActiva(): string {
    const placa = this.storage.get<string>('placa') || localStorage.getItem('placa') || '';
    return String(placa).replace(/^["']|["']$/g, '').trim();
  }

  /**
   * Obtiene el token activo de autenticación 3SL.
   */
  private getTokenActivo(): string {
    const token = this.storage.get<string>('token') || localStorage.getItem('token') || '';
    return String(token).replace(/^["']|["']$/g, '').trim();
  }

  /**
   * Obtiene el perfil completo del Conductor.
   * Implementa:
   * 1. Deduplicación concurrente (si AppComponent y HomePage llaman a la vez, solo sale 1 HTTP request).
   * 2. Timeout ajustado a 10s con 1 retry (ideal para redes móviles).
   * 3. Respaldo y caché persistente en Dexie.js (cache_store).
   */
  async getPerfilConductor(
    cedulaParam?: string,
    placaParam?: string,
    tokenParam?: string,
    forceRefresh: boolean = false
  ): Promise<Conductor> {
    const cedula = (cedulaParam || this.getCedulaActiva()).trim();
    const placa = (placaParam || this.getPlacaActiva()).trim();
    const token = (tokenParam || this.getTokenActivo()).trim();

    const cacheKey = `conductor_perfil_${cedula}_${placa}`;

    // Si ya tenemos en memoria y no se fuerza refresco
    if (!forceRefresh && this.cachedConductor && this.inFlightCredentialsKey === cacheKey) {
      return this.cachedConductor;
    }

    // Si ya hay una petición HTTP en curso para las mismas credenciales, reutilizamos el Observable
    if (!forceRefresh && this.inFlightRequest$ && this.inFlightCredentialsKey === cacheKey) {
      return firstValueFrom(this.inFlightRequest$);
    }

    const params = new HttpParams({
      fromString: `cedula=${encodeURIComponent(cedula)}&placa=${encodeURIComponent(placa)}`
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.inFlightCredentialsKey = cacheKey;

    this.inFlightRequest$ = this.http.get<RespuestaIngresos3SL>(`${this.baseUrl3SL}/ingresos`, { headers, params }).pipe(
      timeout(10000),
      retry(1),
      tap(async (resp) => {
        if (resp && resp.data && resp.data.length > 0) {
          const raw = resp.data[0];
          const conductor = mapearConductor3SL(raw);
          this.cachedConductor = conductor;
          // Guardar en Dexie con TTL de 24 horas (86,400,000 ms)
          await this.db.setCache(cacheKey, conductor, 24 * 60 * 60 * 1000);
        }
      }),
      catchError(async (err) => {
        console.warn('[ConductorApi] Fallo en conexión con 3SL /api/ingresos. Verificando caché local...', err);
        // Si la red falla o hace timeout, intentamos rescatar la última información en Dexie
        const cached = await this.db.getCache<Conductor>(cacheKey);
        if (cached) {
          console.info('[ConductorApi] Perfil recuperado exitosamente desde Dexie IndexedDB');
          this.cachedConductor = cached;
          return { status: true, data: [cached.raw3sl as Conductor3SL] } as RespuestaIngresos3SL;
        }
        throw err;
      }),
      shareReplay(1)
    ) as unknown as Observable<Conductor>;

    try {
      const response: any = await firstValueFrom(this.inFlightRequest$);
      if (response && response.data && response.data.length > 0) {
        return mapearConductor3SL(response.data[0]);
      }
      if (this.cachedConductor) {
        return this.cachedConductor;
      }
      throw new Error('No se encontraron datos del conductor en 3SL ni en la base local.');
    } finally {
      // Liberar la petición en vuelo una vez resuelta
      this.inFlightRequest$ = null;
    }
  }

  /**
   * Retorna el sobre crudo { data: [Conductor3SL] } requerido por el código legado
   * de HomePage y AppComponent, beneficiándose de la deduplicación y la caché Dexie.
   */
  async getEnvelope3SL(
    cedulaParam?: string,
    placaParam?: string,
    tokenParam?: string,
    forceRefresh: boolean = false
  ): Promise<{ data: Conductor3SL[] }> {
    const conductor = await this.getPerfilConductor(cedulaParam, placaParam, tokenParam, forceRefresh);
    const raw = conductor.raw3sl || {
      codigoTercerox: conductor.cedula,
      nombreTercerox: conductor.nombres,
      apell1Tercerox: conductor.apellidos.split(' ')[0] || '',
      apell2Tercerox: conductor.apellidos.split(' ')[1] || '',
      emailxTercerox: conductor.correo,
      movilxTercerox: conductor.celular,
      direccTercerox: conductor.direccion,
      fechaxNacimien: conductor.fechaNacimiento,
      ciudadCreacion: conductor.ciudad,
      numeroPlacaxxx: conductor.placa,
      numeroEstadoxx: conductor.estado
    };
    return { data: [raw] };
  }

  /**
   * Obtiene la foto de perfil del conductor desde el backend de Aldia con respaldo en Dexie.
   */
  async getFotoPerfil(cedulaParam?: string): Promise<string | null> {
    const cedula = (cedulaParam || this.getCedulaActiva()).trim();
    if (!cedula) return null;

    const cacheKey = `foto_conductor_${cedula}`;
    const fotoCache = await this.db.getCache<string>(cacheKey);
    if (fotoCache) {
      return fotoCache;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'user': 'USUSEGINT',
      'password': '12249'
    });

    const params = new HttpParams({
      fromString: `codigo=${encodeURIComponent(cedula)}&tipo=fotoperfil&tipoRegistro=conductor`
    });

    try {
      const resp: any = await firstValueFrom(
        this.http.get<any>(`${this.baseUrlAldia}/documento`, { headers, params }).pipe(
          timeout(8000),
          retry(1),
          catchError(() => throwError(() => new Error('Error consultando foto de perfil')))
        )
      );

      if (resp && resp.code !== '204' && resp.data && resp.data.fotoperfil) {
        const foto = resp.data.fotoperfil;
        await this.db.setCache(cacheKey, foto, 7 * 24 * 60 * 60 * 1000); // 7 días TTL
        return foto;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Limpia la caché en memoria para forzar actualización fresca del conductor.
   */
  clearMemoryCache(): void {
    this.cachedConductor = null;
    this.inFlightRequest$ = null;
    this.inFlightCredentialsKey = null;
  }
}
