import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { API_CONFIG, ApiConfig } from '@core/config/api.config';
import { CoreLoggerService } from '@core/services/core-logger.service';
import { SessionStore } from '@core/session/session.store';
import { AuthConductorApi } from '@domain/auth-conductor.api';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let sessionStoreSpy: jasmine.SpyObj<SessionStore>;

  const mockConfig: ApiConfig = {
    baseUrlAldia: 'https://api.aldialogistica.com/api',
    baseUrl3SL: 'https://api.3slogistica.com/api',
    urlCapacitaciones: 'https://www.3slogistica.com/tr_panel/process/capacitaciones/'
  };

  beforeEach(() => {
    sessionStoreSpy = jasmine.createSpyObj<SessionStore>('SessionStore', [
      'getAldiaAccessToken',
      'getAldiaRefreshToken',
      'isRefreshTokenValid',
      'clearSession',
      'updateRotatedTokens'
    ]);
    sessionStoreSpy.getAldiaAccessToken.and.returnValue('tok-123');

    const authConductorSpy = jasmine.createSpyObj<AuthConductorApi>('AuthConductorApi', ['renovarToken']);
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const loggerSpy = jasmine.createSpyObj<CoreLoggerService>('CoreLoggerService', ['log', 'logSafeError', 'info']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: API_CONFIG, useValue: mockConfig },
        { provide: SessionStore, useValue: sessionStoreSpy },
        { provide: AuthConductorApi, useValue: authConductorSpy },
        { provide: Router, useValue: routerSpy },
        { provide: CoreLoggerService, useValue: loggerSpy }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe adjuntar Bearer en /app/registro, /app/tramites/1 y /app/catalogos/ciudad', () => {
    http.get('https://api.aldialogistica.com/api/app/registro').subscribe();
    http.get('https://api.aldialogistica.com/api/app/tramites/1').subscribe();
    http.get('https://api.aldialogistica.com/api/app/catalogos/ciudad').subscribe();

    const r1 = httpMock.expectOne('https://api.aldialogistica.com/api/app/registro');
    const r2 = httpMock.expectOne('https://api.aldialogistica.com/api/app/tramites/1');
    const r3 = httpMock.expectOne('https://api.aldialogistica.com/api/app/catalogos/ciudad');

    expect(r1.request.headers.get('Authorization')).toBe('Bearer tok-123');
    expect(r2.request.headers.get('Authorization')).toBe('Bearer tok-123');
    expect(r3.request.headers.get('Authorization')).toBe('Bearer tok-123');

    r1.flush({});
    r2.flush({});
    r3.flush({});
  });

  it('no debe adjuntar Bearer en rutas públicas OTP ni en ruta engañosa /app/registro-malicioso', () => {
    http.post('https://api.aldialogistica.com/api/app/registro/iniciar', {}).subscribe();
    http.post('https://api.aldialogistica.com/api/app/registro/verificar', {}).subscribe();
    http.get('https://api.aldialogistica.com/api/app/registro-malicioso').subscribe();

    const r1 = httpMock.expectOne('https://api.aldialogistica.com/api/app/registro/iniciar');
    const r2 = httpMock.expectOne('https://api.aldialogistica.com/api/app/registro/verificar');
    const r3 = httpMock.expectOne('https://api.aldialogistica.com/api/app/registro-malicioso');

    expect(r1.request.headers.has('Authorization')).toBeFalse();
    expect(r2.request.headers.has('Authorization')).toBeFalse();
    expect(r3.request.headers.has('Authorization')).toBeFalse();

    r1.flush({});
    r2.flush({});
    r3.flush({});
  });

  it('no debe tratar como pública una ruta protegida que incluya querystring ?next=/app/registro/verificar', () => {
    const protectedWithQuery = 'https://api.aldialogistica.com/api/app/tramites/1?next=/app/registro/verificar';
    http.get(protectedWithQuery).subscribe();

    const req = httpMock.expectOne(protectedWithQuery);
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok-123');
    req.flush({});
  });
});
