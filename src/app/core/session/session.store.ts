import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '@core/services/storage.service';
import { AldiaSessionState, EstadoSesionAldia, VerificarCodigoData } from '@core/models/auth-conductor.model';
import { VerificarRegistroResult } from '@core/models/tramite-registro.model';

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
  private static readonly KEY_ALDIA_ESTADO = 'aldia_estado';
  private static readonly KEY_ALDIA_TRAMITE_ID = 'aldia_tramite_id';

  private static readonly KEY_LEGACY_TOKEN = 'token';
  private static readonly KEY_LEGACY_CONDUCTOR = 'conductor';
  private static readonly KEY_LEGACY_PLACA = 'placa';
  private static readonly KEY_LEGACY_TOKEN_3SL = 'token_3sl';

  private static readonly ALL_STORAGE_KEYS: readonly string[] = [
    SessionStore.KEY_ALDIA_ACCESS_TOKEN,
    SessionStore.KEY_ALDIA_REFRESH_TOKEN,
    SessionStore.KEY_ALDIA_EXPIRA_AT,
    SessionStore.KEY_ALDIA_REFRESH_EXPIRA_AT,
    SessionStore.KEY_ALDIA_SESION_ID,
    SessionStore.KEY_ALDIA_NOMBRE,
    SessionStore.KEY_ALDIA_ESTADO,
    SessionStore.KEY_ALDIA_TRAMITE_ID,
    SessionStore.KEY_LEGACY_TOKEN,
    SessionStore.KEY_LEGACY_CONDUCTOR,
    SessionStore.KEY_LEGACY_PLACA,
    SessionStore.KEY_LEGACY_TOKEN_3SL
  ];

  private inMemoryOnly = false;
  private readonly stateSubject = new BehaviorSubject<AldiaSessionState>(this.loadInitialState());
  public readonly state$: Observable<AldiaSessionState> = this.stateSubject.asObservable();

  constructor(private readonly storage: StorageService) {}

  public get snapshot(): AldiaSessionState {
    return this.stateSubject.getValue();
  }

  public get accessToken(): string | null {
    return this.getAldiaAccessToken();
  }

  public get refreshToken(): string | null {
    return this.getAldiaRefreshToken();
  }

  public setAldiaSession(data: VerificarCodigoData, cedula: string, placa: string): void {
    const cleanCedula = cedula.trim().replace(/^["']|["']$/g, '');
    const cleanPlaca = placa.trim().replace(/\s+/g, '').toUpperCase();
    const cleanAccessToken = (data.access_token || '').trim();
    const cleanRefreshToken = (data.refresh_token || '').trim();
    const cleanExpiraAt = (data.expira_at || '').trim();
    const cleanRefreshExpiraAt = (data.refresh_expira_at || '').trim();
    const nombre = (data.conductor?.nombre || '').trim();
    const sesionId = data.sesion_id ?? null;

    this.inMemoryOnly = false;

    this.storage.set(SessionStore.KEY_ALDIA_ACCESS_TOKEN, cleanAccessToken);
    this.storage.set(SessionStore.KEY_ALDIA_REFRESH_TOKEN, cleanRefreshToken);
    this.storage.set(SessionStore.KEY_ALDIA_EXPIRA_AT, cleanExpiraAt);
    this.storage.set(SessionStore.KEY_ALDIA_REFRESH_EXPIRA_AT, cleanRefreshExpiraAt);
    this.storage.set(SessionStore.KEY_ALDIA_SESION_ID, sesionId);
    this.storage.set(SessionStore.KEY_ALDIA_NOMBRE, nombre);
    this.storage.set(SessionStore.KEY_ALDIA_ESTADO, 'ACTIVA');
    this.storage.remove(SessionStore.KEY_ALDIA_TRAMITE_ID);
    localStorage.setItem(SessionStore.KEY_ALDIA_ESTADO, 'ACTIVA');
    localStorage.removeItem(SessionStore.KEY_ALDIA_TRAMITE_ID);

    this.storage.set(SessionStore.KEY_LEGACY_TOKEN, cleanAccessToken);
    this.storage.set(SessionStore.KEY_LEGACY_CONDUCTOR, cleanCedula);
    this.storage.set(SessionStore.KEY_LEGACY_PLACA, cleanPlaca);

    localStorage.setItem(SessionStore.KEY_LEGACY_TOKEN, cleanAccessToken);
    localStorage.setItem(SessionStore.KEY_LEGACY_CONDUCTOR, cleanCedula);
    localStorage.setItem(SessionStore.KEY_LEGACY_PLACA, cleanPlaca);

    this.stateSubject.next({
      accessToken: cleanAccessToken,
      refreshToken: cleanRefreshToken,
      expiraAt: cleanExpiraAt,
      refreshExpiraAt: cleanRefreshExpiraAt,
      sesionId,
      cedula: cleanCedula,
      placa: cleanPlaca,
      nombreConductor: nombre,
      estado: 'ACTIVA',
      tramiteId: null
    });
  }

  public setAldiaRegistroSession(data: VerificarRegistroResult, cedula: string, placa: string): void {
    const cleanCedula = cedula.trim().replace(/^["']|["']$/g, '');
    const cleanPlaca = placa.trim().replace(/\s+/g, '').toUpperCase();

    this.clearPersistedKeys();
    this.inMemoryOnly = true;

    this.stateSubject.next({
      accessToken: (data.accessToken || '').trim(),
      refreshToken: (data.refreshToken || '').trim(),
      expiraAt: (data.expiraAt || '').trim(),
      refreshExpiraAt: (data.refreshExpiraAt || '').trim(),
      sesionId: data.sesionId ?? null,
      cedula: cleanCedula,
      placa: cleanPlaca,
      nombreConductor: null,
      estado: 'REGISTRO',
      tramiteId: data.tramiteId ?? null
    });
  }

  public isRegistroSession(): boolean {
    return this.isSessionValid() && this.snapshot.estado === 'REGISTRO';
  }

  public isActiveConductorSession(): boolean {
    return this.isSessionValid() && (this.snapshot.estado === 'ACTIVA' || this.snapshot.estado === null);
  }

  public promoteRegistroToActiva(): void {
    const current = this.snapshot;
    this.stateSubject.next({
      ...current,
      estado: 'ACTIVA',
      tramiteId: null
    });
  }

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
    const current = this.snapshot;

    if (!this.inMemoryOnly && current.estado !== 'REGISTRO') {
      this.storage.set(SessionStore.KEY_ALDIA_ACCESS_TOKEN, cleanAccess);
      this.storage.set(SessionStore.KEY_ALDIA_REFRESH_TOKEN, cleanRefresh);
      this.storage.set(SessionStore.KEY_ALDIA_EXPIRA_AT, cleanExp);
      this.storage.set(SessionStore.KEY_ALDIA_REFRESH_EXPIRA_AT, cleanRefExp);
      this.storage.set(SessionStore.KEY_LEGACY_TOKEN, cleanAccess);
      localStorage.setItem(SessionStore.KEY_LEGACY_TOKEN, cleanAccess);
    }

    this.stateSubject.next({
      ...current,
      accessToken: cleanAccess,
      refreshToken: cleanRefresh,
      expiraAt: cleanExp,
      refreshExpiraAt: cleanRefExp
    });
  }

  public hasAldiaSession(): boolean {
    const state = this.snapshot;
    const hasMemoryTokens = Boolean(state.accessToken || state.refreshToken);

    if (this.inMemoryOnly || state.estado === 'REGISTRO') {
      return hasMemoryTokens;
    }

    const rawAccess = localStorage.getItem(SessionStore.KEY_ALDIA_ACCESS_TOKEN);
    const rawRefresh = localStorage.getItem(SessionStore.KEY_ALDIA_REFRESH_TOKEN);

    if (!rawAccess && !rawRefresh) {
      if (hasMemoryTokens) {
        this.resetMemoryState();
      }
      return false;
    }

    return hasMemoryTokens;
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

  public isSessionValid(): boolean {
    if (this.hasAldiaSession()) {
      return this.isAccessTokenValid() || this.isRefreshTokenValid();
    }

    const legacy = this.getLegacyToken();
    return Boolean(legacy && legacy.trim().length > 0);
  }

  public getAldiaAccessToken(): string | null {
    const inMemory = this.snapshot.accessToken;
    if (inMemory) {
      return inMemory;
    }
    if (this.inMemoryOnly || this.snapshot.estado === 'REGISTRO') {
      return null;
    }
    return this.storage.get<string>(SessionStore.KEY_ALDIA_ACCESS_TOKEN);
  }

  public getAldiaRefreshToken(): string | null {
    const inMemory = this.snapshot.refreshToken;
    if (inMemory) {
      return inMemory;
    }
    if (this.inMemoryOnly || this.snapshot.estado === 'REGISTRO') {
      return null;
    }
    return this.storage.get<string>(SessionStore.KEY_ALDIA_REFRESH_TOKEN);
  }

  public getLegacyToken(): string | null {
    return this.storage.get<string>(SessionStore.KEY_LEGACY_TOKEN) || localStorage.getItem(SessionStore.KEY_LEGACY_TOKEN);
  }

  public getLegacy3slToken(): string | null {
    return (
      this.storage.get<string>(SessionStore.KEY_LEGACY_TOKEN_3SL) ||
      localStorage.getItem(SessionStore.KEY_LEGACY_TOKEN_3SL)
    );
  }

  public setLegacy3slToken(token: string): void {
    const clean = token.trim();
    this.storage.set(SessionStore.KEY_LEGACY_TOKEN_3SL, clean);
    localStorage.setItem(SessionStore.KEY_LEGACY_TOKEN_3SL, clean);
  }

  public clearSession(): void {
    this.inMemoryOnly = false;
    this.clearPersistedKeys();
    this.resetMemoryState();
  }

  private clearPersistedKeys(): void {
    for (const key of SessionStore.ALL_STORAGE_KEYS) {
      this.storage.remove(key);
      localStorage.removeItem(key);
    }
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
      nombreConductor: null,
      estado: null,
      tramiteId: null
    });
  }

  private loadInitialState(): AldiaSessionState {
    const estadoRaw = localStorage.getItem(SessionStore.KEY_ALDIA_ESTADO);
    if (estadoRaw !== 'ACTIVA') {
      return {
        accessToken: null,
        refreshToken: null,
        expiraAt: null,
        refreshExpiraAt: null,
        sesionId: null,
        cedula: null,
        placa: null,
        nombreConductor: null,
        estado: null,
        tramiteId: null
      };
    }

    const accessToken = localStorage.getItem(SessionStore.KEY_ALDIA_ACCESS_TOKEN) || null;
    const refreshToken = localStorage.getItem(SessionStore.KEY_ALDIA_REFRESH_TOKEN) || null;
    const expiraAt = localStorage.getItem(SessionStore.KEY_ALDIA_EXPIRA_AT) || null;
    const refreshExpiraAt = localStorage.getItem(SessionStore.KEY_ALDIA_REFRESH_EXPIRA_AT) || null;
    const sesionIdRaw = localStorage.getItem(SessionStore.KEY_ALDIA_SESION_ID);
    const sesionId = sesionIdRaw ? Number(sesionIdRaw) : null;
    const nombreConductor = localStorage.getItem(SessionStore.KEY_ALDIA_NOMBRE) || null;
    const cedula = localStorage.getItem(SessionStore.KEY_LEGACY_CONDUCTOR) || null;
    const placa = localStorage.getItem(SessionStore.KEY_LEGACY_PLACA) || null;
    const estado: EstadoSesionAldia | null = estadoRaw === 'ACTIVA' ? 'ACTIVA' : null;

    return {
      accessToken,
      refreshToken,
      expiraAt,
      refreshExpiraAt,
      sesionId,
      cedula,
      placa,
      nombreConductor,
      estado,
      tramiteId: null
    };
  }
}
