import { TestBed } from '@angular/core/testing';
import { VerificarRegistroResult } from '@core/models/tramite-registro.model';
import { StorageService } from '@core/services/storage.service';
import { SessionStore } from './session.store';

describe('SessionStore (sesión REGISTRO en memoria)', () => {
  let store: SessionStore;
  let storageSpy: jasmine.SpyObj<StorageService>;

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
    storageSpy = jasmine.createSpyObj<StorageService>('StorageService', ['get', 'set', 'remove', 'clear']);
    storageSpy.get.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        SessionStore,
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    store = TestBed.inject(SessionStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('setAldiaRegistroSession debe guardar la sesión únicamente en memoria y limpiar residuos en localStorage', () => {
    localStorage.setItem('token', 'legacy-old');
    localStorage.setItem('conductor', '99999');
    localStorage.setItem('aldia_access_token', 'old-access');

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

    expect(storageSpy.set).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
  });

  it('updateRotatedTokens durante sesión REGISTRO debe actualizar tokens en memoria sin escribir en localStorage', () => {
    store.setAldiaRegistroSession(buildRegistroResult(), '1012345678', 'SXT482');

    const newExp = futureIso(20);
    const newRefExp = futureIso(240);
    store.updateRotatedTokens('reg-access-rotated', newExp, 'reg-refresh-rotated', newRefExp);

    expect(store.accessToken).toBe('reg-access-rotated');
    expect(store.refreshToken).toBe('reg-refresh-rotated');
    expect(store.isRegistroSession()).toBeTrue();
    expect(storageSpy.set).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
  });

  it('promoteRegistroToActiva debe activar sesión inmediata en memoria sin persistir tokens en localStorage', () => {
    store.setAldiaRegistroSession(buildRegistroResult(), '1012345678', 'SXT482');

    store.promoteRegistroToActiva();

    expect(store.snapshot.estado).toBe('ACTIVA');
    expect(store.snapshot.tramiteId).toBeNull();
    expect(store.isActiveConductorSession()).toBeTrue();
    expect(store.isRegistroSession()).toBeFalse();
    expect(store.accessToken).toBe('reg-access-token');
    expect(storageSpy.set).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
  });

  it('clearSession debe restablecer el estado en memoria a sesión vacía', () => {
    store.setAldiaRegistroSession(buildRegistroResult(), '1012345678', 'SXT482');

    store.clearSession();

    expect(store.hasAldiaSession()).toBeFalse();
    expect(store.isSessionValid()).toBeFalse();
    expect(store.isRegistroSession()).toBeFalse();
    expect(store.isActiveConductorSession()).toBeFalse();
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
