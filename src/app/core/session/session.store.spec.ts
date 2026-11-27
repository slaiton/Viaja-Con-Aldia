import { TestBed } from '@angular/core/testing';
import { VerificarRegistroResult } from '@core/models/tramite-registro.model';
import { StorageService } from '@core/services/storage.service';
import { SessionStore } from './session.store';

describe('SessionStore (sesión REGISTRO en memoria y promoción ACTIVA)', () => {
  let store: SessionStore;
  let storageService: StorageService;
  let setSpy: jasmine.Spy;

  const futureIso = (minutes: number): string => new Date(Date.now() + minutes * 60_000).toISOString();

  const buildRegistroResult = (): VerificarRegistroResult => ({
    accessToken: 'reg-access-token',
    tokenType: 'Bearer',
    expiraAt: futureIso(15),
    refreshToken: 'reg-refresh-token',
    refreshExpiraAt: futureIso(120),
    sesionId: 77,
    estado: 'REGISTRO',
    tramiteId: 45
  });

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [StorageService, SessionStore]
    });

    storageService = TestBed.inject(StorageService);
    setSpy = spyOn(storageService, 'set').and.callThrough();
    store = TestBed.inject(SessionStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('setAldiaRegistroSession debe guardar en memoria, limpiar claves operativas y preservar token_3sl', () => {
    localStorage.setItem('token', 'legacy-old');
    localStorage.setItem('conductor', '99999');
    localStorage.setItem('placa', 'AAA000');
    localStorage.setItem('aldia_access_token', 'old-access');
    localStorage.setItem('aldia_tramite_id', '12');
    localStorage.setItem('token_3sl', '3sl-vigente');

    store.setAldiaRegistroSession(buildRegistroResult(), '1012345678', 'sxt 482');

    expect(store.hasAldiaSession()).toBeTrue();
    expect(store.isSessionValid()).toBeTrue();
    expect(store.isRegistroSession()).toBeTrue();
    expect(store.isActiveConductorSession()).toBeFalse();

    expect(store.snapshot.cedula).toBe('1012345678');
    expect(store.snapshot.placa).toBe('SXT482');
    expect(store.snapshot.tramiteId).toBe(45);
    expect(store.accessToken).toBe('reg-access-token');
    expect(store.refreshToken).toBe('reg-refresh-token');

    expect(setSpy).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('conductor')).toBeNull();
    expect(localStorage.getItem('placa')).toBeNull();
    expect(localStorage.getItem('aldia_access_token')).toBeNull();
    expect(localStorage.getItem('aldia_tramite_id')).toBeNull();
    expect(localStorage.getItem('token_3sl')).toBe('3sl-vigente');
    expect(store.getLegacy3slToken()).toBe('3sl-vigente');
    expect(localStorage.length).toBe(1);
  });

  it('updateRotatedTokens durante sesión REGISTRO debe actualizar tokens en memoria sin escribir en localStorage', () => {
    store.setAldiaRegistroSession(buildRegistroResult(), '1012345678', 'SXT482');

    const newExp = futureIso(20);
    const newRefExp = futureIso(240);
    store.updateRotatedTokens('reg-access-rotated', newExp, 'reg-refresh-rotated', newRefExp);

    expect(store.accessToken).toBe('reg-access-rotated');
    expect(store.refreshToken).toBe('reg-refresh-rotated');
    expect(store.isRegistroSession()).toBeTrue();
    expect(setSpy).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
  });

  it('promoteRegistroToActiva debe persistir claves ACTIVA + legacy, permitir rotación persistente y sobrevivir a recarga', () => {
    store.setAldiaRegistroSession(buildRegistroResult(), '1012345678', 'sxt 482');
    localStorage.setItem('aldia_tramite_id', '45');

    store.promoteRegistroToActiva();

    expect(store.snapshot.estado).toBe('ACTIVA');
    expect(store.snapshot.tramiteId).toBeNull();
    expect(store.isActiveConductorSession()).toBeTrue();
    expect(store.isRegistroSession()).toBeFalse();

    expect(localStorage.getItem('aldia_estado')).toBe('ACTIVA');
    expect(localStorage.getItem('aldia_access_token')).toBe('reg-access-token');
    expect(localStorage.getItem('aldia_refresh_token')).toBe('reg-refresh-token');
    expect(localStorage.getItem('aldia_sesion_id')).toBe('77');
    expect(localStorage.getItem('token')).toBe('reg-access-token');
    expect(localStorage.getItem('conductor')).toBe('1012345678');
    expect(localStorage.getItem('placa')).toBe('SXT482');
    expect(localStorage.getItem('aldia_tramite_id')).toBeNull();

    const rotExp = futureIso(30);
    const rotRefExp = futureIso(300);
    store.updateRotatedTokens('activa-access-rotated', rotExp, 'activa-refresh-rotated', rotRefExp);

    expect(localStorage.getItem('aldia_access_token')).toBe('activa-access-rotated');
    expect(localStorage.getItem('aldia_refresh_token')).toBe('activa-refresh-rotated');
    expect(localStorage.getItem('token')).toBe('activa-access-rotated');

    const reloadedStore = new SessionStore(storageService);

    expect(reloadedStore.isActiveConductorSession()).toBeTrue();
    expect(reloadedStore.isSessionValid()).toBeTrue();
    expect(reloadedStore.isRegistroSession()).toBeFalse();
    expect(reloadedStore.accessToken).toBe('activa-access-rotated');
    expect(reloadedStore.refreshToken).toBe('activa-refresh-rotated');
    expect(reloadedStore.snapshot.cedula).toBe('1012345678');
    expect(reloadedStore.snapshot.placa).toBe('SXT482');
    expect(reloadedStore.snapshot.tramiteId).toBeNull();
  });

  it('clearSession debe limpiar memoria y todas las claves persistidas, incluyendo token_3sl', () => {
    localStorage.setItem('token_3sl', '3sl-vigente');
    store.setAldiaRegistroSession(buildRegistroResult(), '1012345678', 'SXT482');
    store.promoteRegistroToActiva();

    store.clearSession();

    expect(store.hasAldiaSession()).toBeFalse();
    expect(store.isSessionValid()).toBeFalse();
    expect(store.isRegistroSession()).toBeFalse();
    expect(store.isActiveConductorSession()).toBeFalse();
    expect(localStorage.getItem('token_3sl')).toBeNull();
    expect(localStorage.length).toBe(0);
    expect(store.snapshot).toEqual({
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
  });
});
