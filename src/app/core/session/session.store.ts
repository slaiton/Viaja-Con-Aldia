import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '@core/services/storage.service';
import { AldiaSessionState, VerificarCodigoData } from '@core/models/auth-conductor.model';

@Injectable({
  providedIn: 'root'
})
export class SessionStore {
  private static readonly KEY_ALDIA_ACCESS_TOKEN = 'aldia_access_token';
  private static readonly KEY_ALDIA_REFRESH_TOKEN = 'aldia_refresh_token';
  private static readonly KEY_ALDIA_EXPIRA_AT = 'aldia_expira_at';
  private static readonly KEY_ALDIA_REFRESH_EXPIRA_AT = 'aldia_refresh_expira_at';
  private static readonly KEY_ALDIA_SESION_ID = 'aldia_sesion_id';
  private static readonly KEY_ALDIA_NOMBRE = 'aldia_conductor_nombre';

  // Claves legacy para compatibilidad con home, app.component, preform, turnos
  private static readonly KEY_LEGACY_TOKEN = 'token';
  private static readonly KEY_LEGACY_CONDUCTOR = 'conductor';
  private static readonly KEY_LEGACY_PLACA = 'placa';
  private static readonly KEY_LEGACY_TOKEN_3SL = 'token_3sl';

  private readonly stateSubject = new BehaviorSubject<AldiaSessionState>(this.loadInitialState());
  public readonly state$: Observable<AldiaSessionState> = this.stateSubject.asObservable();

  constructor(private readonly storage: StorageService) {}

  public get snapshot(): AldiaSessionState {
    return this.stateSubject.getValue();
  }

  /**
   * Guarda la sesión completa emitida por POST /api/app/conductor/login/verificar.
   */
  public setAldiaSession(data: VerificarCodigoData, cedula: string, placa: string): void {
    const cleanCedula = cedula.trim().replace(/^["']|["']$/g, '');
    const cleanPlaca = placa.trim().replace(/\s+/g, '').toUpperCase();
    const cleanAccessToken = (data.access_token || '').trim();
    const cleanRefreshToken = (data.refresh_token || '').trim();
    const cleanExpiraAt = (data.expira_at || '').trim();
    const cleanRefreshExpiraAt = (data.refresh_expira_at || '').trim();
    const nombre = (data.conductor?.nombre || '').trim();
    const sesionId = data.sesion_id ?? null;

    // Persistir claves de Aldia
    this.storage.set(SessionStore.KEY_ALDIA_ACCESS_TOKEN, cleanAccessToken);
    this.storage.set(SessionStore.KEY_ALDIA_REFRESH_TOKEN, cleanRefreshToken);
    this.storage.set(SessionStore.KEY_ALDIA_EXPIRA_AT, cleanExpiraAt);
    this.storage.set(SessionStore.KEY_ALDIA_REFRESH_EXPIRA_AT, cleanRefreshExpiraAt);
    this.storage.set(SessionStore.KEY_ALDIA_SESION_ID, sesionId);
    this.storage.set(SessionStore.KEY_ALDIA_NOMBRE, nombre);

    // Sincronizar compatibilidad con pantallas legadas (home, app.component, preoperacional, turnos)
    this.storage.set(SessionStore.KEY_LEGACY_TOKEN, cleanAccessToken);
    this.storage.set(SessionStore.KEY_LEGACY_CONDUCTOR, cleanCedula);
    this.storage.set(SessionStore.KEY_LEGACY_PLACA, cleanPlaca);

    localStorage.setItem(SessionStore.KEY_LEGACY_TOKEN, cleanAccessToken);
    localStorage.setItem(SessionStore.KEY_LEGACY_CONDUCTOR, cleanCedula);
    localStorage.setItem(SessionStore.KEY_LEGACY_PLACA, cleanPlaca);

    const newState: AldiaSessionState = {
      accessToken: cleanAccessToken,
      refreshToken: cleanRefreshToken,
      expiraAt: cleanExpiraAt,
      refreshExpiraAt: cleanRefreshExpiraAt,
      sesionId,
      cedula: cleanCedula,
      placa: cleanPlaca,
      nombreConductor: nombre
    };

    this.stateSubject.next(newState);
  }

  /**
   * Actualiza el par de tokens tras rotación atómica por /api/app/conductor/token/renovar.
   */
  public updateRotatedTokens(
    accessToken: string,
    expiraAt: string,
    refreshToken: string,
    refreshExpiraAt: string
  ): void {
    const cleanAccess = accessToken.trim();
    const cleanRefresh = refreshToken.trim();
    const cleanExp = expiraAt.trim();
    const cleanRefExp = refreshExpiraAt.trim();

    this.storage.set(SessionStore.KEY_ALDIA_ACCESS_TOKEN, cleanAccess);
    this.storage.set(SessionStore.KEY_ALDIA_REFRESH_TOKEN, cleanRefresh);
    this.storage.set(SessionStore.KEY_ALDIA_EXPIRA_AT, cleanExp);
    this.storage.set(SessionStore.KEY_ALDIA_REFRESH_EXPIRA_AT, cleanRefExp);

    this.storage.set(SessionStore.KEY_LEGACY_TOKEN, cleanAccess);
    localStorage.setItem(SessionStore.KEY_LEGACY_TOKEN, cleanAccess);

    const current = this.snapshot;
    this.stateSubject.next({
      ...current,
      accessToken: cleanAccess,
      refreshToken: cleanRefresh,
      expiraAt: cleanExp,
      refreshExpiraAt: cleanRefExp
    });
  }

  public hasAldiaSession(): boolean {
    const rawAccess = localStorage.getItem(SessionStore.KEY_ALDIA_ACCESS_TOKEN);
    const rawRefresh = localStorage.getItem(SessionStore.KEY_ALDIA_REFRESH_TOKEN);

    // Verificación de sincronización real con localStorage
    if (!rawAccess && !rawRefresh) {
      if (this.stateSubject.getValue().accessToken || this.stateSubject.getValue().refreshToken) {
        this.resetMemoryState();
      }
      return false;
    }

    const state = this.snapshot;
    return Boolean(state.accessToken || state.refreshToken);
  }

  public isAccessTokenValid(): boolean {
    const { accessToken, expiraAt } = this.snapshot;
    if (!accessToken || !expiraAt) {
      return false;
    }
    const expTime = new Date(expiraAt).getTime();
    return !isNaN(expTime) && expTime > Date.now();
  }

  public isRefreshTokenValid(): boolean {
    const { refreshToken, refreshExpiraAt } = this.snapshot;
    if (!refreshToken || !refreshExpiraAt) {
      return false;
    }
    const expTime = new Date(refreshExpiraAt).getTime();
    return !isNaN(expTime) && expTime > Date.now();
  }

  /**
   * La sesión se considera válida si el token de acceso sigue vigente O si el refresh token
   * aún no vence, permitiendo que el interceptor renueve atómicamente antes de expulsar al usuario.
   */
  public isSessionValid(): boolean {
    const rawAccess = localStorage.getItem(SessionStore.KEY_ALDIA_ACCESS_TOKEN);
    const rawRefresh = localStorage.getItem(SessionStore.KEY_ALDIA_REFRESH_TOKEN);

    // Si ya no existen físicamente en localStorage (ej. por un localStorage.clear() externo)
    if (!rawAccess && !rawRefresh) {
      if (this.stateSubject.getValue().accessToken || this.stateSubject.getValue().refreshToken) {
        this.resetMemoryState();
      }
      // Verificar si hay sesión legacy válida
      const legacy = this.getLegacyToken();
      return Boolean(legacy && legacy.trim().length > 0);
    }

    if (this.hasAldiaSession()) {
      return this.isAccessTokenValid() || this.isRefreshTokenValid();
    }

    // Fallback para sesión legacy
    const legacy = this.getLegacyToken();
    return Boolean(legacy && legacy.trim().length > 0);
  }

  public getAldiaAccessToken(): string | null {
    return this.snapshot.accessToken || this.storage.get<string>(SessionStore.KEY_ALDIA_ACCESS_TOKEN);
  }

  public getAldiaRefreshToken(): string | null {
    return this.snapshot.refreshToken || this.storage.get<string>(SessionStore.KEY_ALDIA_REFRESH_TOKEN);
  }

  public getLegacyToken(): string | null {
    return this.storage.get<string>(SessionStore.KEY_LEGACY_TOKEN) || localStorage.getItem(SessionStore.KEY_LEGACY_TOKEN);
  }

  public getLegacy3slToken(): string | null {
    return this.storage.get<string>(SessionStore.KEY_LEGACY_TOKEN_3SL) || localStorage.getItem(SessionStore.KEY_LEGACY_TOKEN_3SL);
  }

  public setLegacy3slToken(token: string): void {
    const clean = token.trim();
    this.storage.set(SessionStore.KEY_LEGACY_TOKEN_3SL, clean);
    localStorage.setItem(SessionStore.KEY_LEGACY_TOKEN_3SL, clean);
  }

  public clearSession(): void {
    this.storage.remove(SessionStore.KEY_ALDIA_ACCESS_TOKEN);
    this.storage.remove(SessionStore.KEY_ALDIA_REFRESH_TOKEN);
    this.storage.remove(SessionStore.KEY_ALDIA_EXPIRA_AT);
    this.storage.remove(SessionStore.KEY_ALDIA_REFRESH_EXPIRA_AT);
    this.storage.remove(SessionStore.KEY_ALDIA_SESION_ID);
    this.storage.remove(SessionStore.KEY_ALDIA_NOMBRE);

    this.storage.remove(SessionStore.KEY_LEGACY_TOKEN);
    this.storage.remove(SessionStore.KEY_LEGACY_CONDUCTOR);
    this.storage.remove(SessionStore.KEY_LEGACY_PLACA);
    this.storage.remove(SessionStore.KEY_LEGACY_TOKEN_3SL);

    localStorage.removeItem(SessionStore.KEY_ALDIA_ACCESS_TOKEN);
    localStorage.removeItem(SessionStore.KEY_ALDIA_REFRESH_TOKEN);
    localStorage.removeItem(SessionStore.KEY_ALDIA_EXPIRA_AT);
    localStorage.removeItem(SessionStore.KEY_ALDIA_REFRESH_EXPIRA_AT);
    localStorage.removeItem(SessionStore.KEY_ALDIA_SESION_ID);
    localStorage.removeItem(SessionStore.KEY_ALDIA_NOMBRE);

    localStorage.removeItem(SessionStore.KEY_LEGACY_TOKEN);
    localStorage.removeItem(SessionStore.KEY_LEGACY_CONDUCTOR);
    localStorage.removeItem(SessionStore.KEY_LEGACY_PLACA);
    localStorage.removeItem(SessionStore.KEY_LEGACY_TOKEN_3SL);

    this.resetMemoryState();
  }

  private resetMemoryState(): void {
    this.stateSubject.next({
      accessToken: null,
      refreshToken: null,
      expiraAt: null,
      refreshExpiraAt: null,
      sesionId: null,
      cedula: null,
      placa: null,
      nombreConductor: null
    });
  }

  private loadInitialState(): AldiaSessionState {
    const accessToken = localStorage.getItem(SessionStore.KEY_ALDIA_ACCESS_TOKEN) || null;
    const refreshToken = localStorage.getItem(SessionStore.KEY_ALDIA_REFRESH_TOKEN) || null;
    const expiraAt = localStorage.getItem(SessionStore.KEY_ALDIA_EXPIRA_AT) || null;
    const refreshExpiraAt = localStorage.getItem(SessionStore.KEY_ALDIA_REFRESH_EXPIRA_AT) || null;
    const sesionIdRaw = localStorage.getItem(SessionStore.KEY_ALDIA_SESION_ID);
    const sesionId = sesionIdRaw ? Number(sesionIdRaw) : null;
    const nombreConductor = localStorage.getItem(SessionStore.KEY_ALDIA_NOMBRE) || null;
    const cedula = localStorage.getItem(SessionStore.KEY_LEGACY_CONDUCTOR) || null;
    const placa = localStorage.getItem(SessionStore.KEY_LEGACY_PLACA) || null;

    return {
      accessToken,
      refreshToken,
      expiraAt,
      refreshExpiraAt,
      sesionId,
      cedula,
      placa,
      nombreConductor
    };
  }
}
