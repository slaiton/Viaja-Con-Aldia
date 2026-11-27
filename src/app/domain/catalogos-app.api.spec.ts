import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_CONFIG, ApiConfig } from '@core/config/api.config';
import { CatalogoItem } from '@core/models/tramite-registro.model';
import { CoreLoggerService } from '@core/services/core-logger.service';
import { CatalogosAppApi } from './catalogos-app.api';

describe('CatalogosAppApi', () => {
  let api: CatalogosAppApi;
  let httpMock: HttpTestingController;
  let loggerSpy: jasmine.SpyObj<CoreLoggerService>;

  const mockConfig: ApiConfig = {
    baseUrlAldia: 'https://api.aldialogistica.com/api',
    baseUrl3SL: 'https://api.3slogistica.com/api',
    urlCapacitaciones: 'https://www.3slogistica.com/tr_panel/process/capacitaciones/'
  };

  beforeEach(() => {
    loggerSpy = jasmine.createSpyObj<CoreLoggerService>('CoreLoggerService', ['logSafeError', 'log', 'info']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CatalogosAppApi,
        { provide: API_CONFIG, useValue: mockConfig },
        { provide: CoreLoggerService, useValue: loggerSpy }
      ]
    });

    api = TestBed.inject(CatalogosAppApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe compartir una única petición HTTP concurrente mediante shareReplay(1)', () => {
    let respuestaA: CatalogoItem[] | undefined;
    let respuestaB: CatalogoItem[] | undefined;

    api.obtenerCatalogo('marcavehiculo').subscribe((items) => {
      respuestaA = items;
    });
    api.obtenerCatalogo('marcavehiculo').subscribe((items) => {
      respuestaB = items;
    });

    const req = httpMock.expectOne('https://api.aldialogistica.com/api/app/catalogos/marcavehiculo');
    expect(req.request.method).toBe('GET');

    const payload: CatalogoItem[] = [
      { id: 1, nombre: 'KENWORTH' },
      { id: 2, nombre: 'FREIGHTLINER' }
    ];
    req.flush({ success: true, data: payload });

    expect(respuestaA).toEqual(payload);
    expect(respuestaB).toEqual(payload);

    let respuestaPosterior: CatalogoItem[] | undefined;
    api.obtenerCatalogo('marcavehiculo').subscribe((items) => {
      respuestaPosterior = items;
    });
    expect(respuestaPosterior).toEqual(payload);
    httpMock.expectNone('https://api.aldialogistica.com/api/app/catalogos/marcavehiculo');
  });

  it('debe enviar query param marca=12 al consultar claselinea con marcaId', () => {
    let lineas: CatalogoItem[] | undefined;

    api.obtenerCatalogo('claselinea', 12).subscribe((items) => {
      lineas = items;
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'https://api.aldialogistica.com/api/app/catalogos/claselinea' &&
        r.params.get('marca') === '12'
    );
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 100, nombre: 'T800' }]);

    expect(lineas).toEqual([{ id: 100, nombre: 'T800' }]);
  });

  it('debe degradar a [] ante errores 404 y 500, registrar en logger y mantener caché', () => {
    let res404: CatalogoItem[] | undefined;
    let errorPropagado = false;

    api.obtenerCatalogo('color').subscribe({
      next: (items) => {
        res404 = items;
      },
      error: () => {
        errorPropagado = true;
      }
    });

    const req404 = httpMock.expectOne('https://api.aldialogistica.com/api/app/catalogos/color');
    req404.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });

    expect(errorPropagado).toBeFalse();
    expect(res404).toEqual([]);
    expect(loggerSpy.logSafeError).toHaveBeenCalled();

    let resCacheado: CatalogoItem[] | undefined;
    api.obtenerCatalogo('color').subscribe((items) => {
      resCacheado = items;
    });
    expect(resCacheado).toEqual([]);
    httpMock.expectNone('https://api.aldialogistica.com/api/app/catalogos/color');

    let res500: CatalogoItem[] | undefined;
    api.obtenerCatalogo('carroceria').subscribe((items) => {
      res500 = items;
    });
    const req500 = httpMock.expectOne('https://api.aldialogistica.com/api/app/catalogos/carroceria');
    req500.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });

    expect(res500).toEqual([]);
  });

  it('clearCache() debe invalidar el caché y permitir una nueva petición HTTP', () => {
    api.obtenerCatalogo('ciudad').subscribe();
    const req1 = httpMock.expectOne('https://api.aldialogistica.com/api/app/catalogos/ciudad');
    req1.flush({ success: true, data: [{ id: 1, nombre: 'BOGOTA' }] });

    api.clearCache();

    let recargado: CatalogoItem[] | undefined;
    api.obtenerCatalogo('ciudad').subscribe((items) => {
      recargado = items;
    });
    const req2 = httpMock.expectOne('https://api.aldialogistica.com/api/app/catalogos/ciudad');
    req2.flush({ success: true, data: [{ id: 1, nombre: 'MEDELLIN' }] });

    expect(recargado).toEqual([{ id: 1, nombre: 'MEDELLIN' }]);
  });
});
