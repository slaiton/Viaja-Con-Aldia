import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_CONFIG, ApiConfig } from '@core/config/api.config';
import {
  EstadoRegistroEnCursoData,
  IniciarRegistroResult,
  TramiteDetalle,
  VerificarRegistroResult
} from '@core/models/tramite-registro.model';
import { TramiteRegistroApi } from './tramite-registro.api';

describe('TramiteRegistroApi', () => {
  let api: TramiteRegistroApi;
  let httpMock: HttpTestingController;

  const mockConfig: ApiConfig = {
    baseUrlAldia: 'https://api.aldialogistica.com/api/',
    baseUrl3SL: 'https://api.3slogistica.com/api',
    urlCapacitaciones: 'https://www.3slogistica.com/tr_panel/process/capacitaciones/'
  };

  const wireTramite = {
    id: 77,
    tipo: 'REGISTRO_NUEVO',
    estado: 'BORRADOR',
    placa: 'SXT482',
    enviado_at: null,
    revisado_at: null,
    motivo_rechazo: null,
    items: [],
    archivos: [],
    eventos: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TramiteRegistroApi,
        { provide: API_CONFIG, useValue: mockConfig }
      ]
    });

    api = TestBed.inject(TramiteRegistroApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function assertNoClientSecretHeaders(headers: { has(name: string): boolean }): void {
    expect(headers.has('X-Client-Id')).toBeFalse();
    expect(headers.has('X-Client-Secret')).toBeFalse();
  }

  it('iniciarRegistro debe normalizar baseUrl, enviar POST sin X-Client-* y devolver dominio camelCase', () => {
    let resultado: IniciarRegistroResult | undefined;

    api.iniciarRegistro({ cedula: '1012345678', placa: 'SXT482', celular: '3001234567' }).subscribe((res) => {
      resultado = res;
    });

    const req = httpMock.expectOne('https://api.aldialogistica.com/api/app/registro/iniciar');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ cedula: '1012345678', placa: 'SXT482', celular: '3001234567' });
    assertNoClientSecretHeaders(req.request.headers);

    req.flush({
      success: true,
      data: {
        id: 1,
        celular: '******4567',
        expira_at: '2026-11-27T12:00:00Z',
        expira_en_segundos: 300,
        reenviar_en_segundos: 60
      }
    });

    expect(resultado).toEqual({
      id: 1,
      celular: '******4567',
      expiraAt: '2026-11-27T12:00:00Z',
      expiraEnSegundos: 300,
      reenviarEnSegundos: 60
    });
  });

  it('verificarRegistro debe enviar DTO snake_case y devolver VerificarRegistroResult', () => {
    let resultado: VerificarRegistroResult | undefined;

    api
      .verificarRegistro({
        cedula: '1012345678',
        placa: 'SXT482',
        celular: '3001234567',
        codigo: '123456',
        dispositivoId: 'dev-9',
        plataforma: 'android',
        versionApp: '2.0.0',
        pushToken: 'tok-p'
      })
      .subscribe((res) => {
        resultado = res;
      });

    const req = httpMock.expectOne('https://api.aldialogistica.com/api/app/registro/verificar');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      cedula: '1012345678',
      placa: 'SXT482',
      celular: '3001234567',
      codigo: '123456',
      dispositivo_id: 'dev-9',
      plataforma: 'android',
      version_app: '2.0.0',
      push_token: 'tok-p'
    });
    assertNoClientSecretHeaders(req.request.headers);

    req.flush({
      success: true,
      data: {
        access_token: 'acc-1',
        token_type: 'Bearer',
        expira_at: '2026-11-28T00:00:00Z',
        refresh_token: 'ref-1',
        refresh_expira_at: '2026-12-01T00:00:00Z',
        sesion_id: 55,
        estado: 'REGISTRO',
        tramite_id: 77
      }
    });

    expect(resultado?.accessToken).toBe('acc-1');
    expect(resultado?.tramiteId).toBe(77);
  });

  it('obtenerEstadoRegistro y reabrirRegistro deben consultar /app/registro y devolver modelo sin sobre', () => {
    let estado: EstadoRegistroEnCursoData | undefined;
    api.obtenerEstadoRegistro().subscribe((res) => {
      estado = res as EstadoRegistroEnCursoData;
    });

    const reqGet = httpMock.expectOne('https://api.aldialogistica.com/api/app/registro');
    expect(reqGet.request.method).toBe('GET');
    assertNoClientSecretHeaders(reqGet.request.headers);
    reqGet.flush({
      success: true,
      data: {
        estado: 'BORRADOR',
        tramite: wireTramite,
        pasos: [
          {
            paso: 'conductor',
            entidad: 'CONDUCTOR',
            requerido: true,
            con_datos: true,
            imagenes: 0,
            imagenes_permitidas: ['cedula1']
          }
        ]
      }
    });

    expect(estado?.tramite.id).toBe(77);
    expect(estado?.pasos[0].conDatos).toBeTrue();

    let reabiertoEstado = '';
    api.reabrirRegistro().subscribe((res) => {
      reabiertoEstado = res.estado;
    });

    const reqReabrir = httpMock.expectOne('https://api.aldialogistica.com/api/app/registro/reabrir');
    expect(reqReabrir.request.method).toBe('POST');
    expect(reqReabrir.request.body).toEqual({});
    assertNoClientSecretHeaders(reqReabrir.request.headers);
    reqReabrir.flush({
      success: true,
      data: {
        estado: 'BORRADOR',
        tramite: wireTramite,
        pasos: [],
        reabierto_id: 77
      }
    });
    expect(reabiertoEstado).toBe('BORRADOR');
  });

  it('guardarItemTramite y eliminarItemTramite deben operar sobre /items/{entidad}', () => {
    let detallePut: TramiteDetalle | undefined;
    api.guardarItemTramite(77, 'conductor', { nombre: 'Carlos' }).subscribe((res) => {
      detallePut = res;
    });

    const reqPut = httpMock.expectOne('https://api.aldialogistica.com/api/app/tramites/77/items/conductor');
    expect(reqPut.request.method).toBe('PUT');
    expect(reqPut.request.body).toEqual({ datos: { nombre: 'Carlos' } });
    assertNoClientSecretHeaders(reqPut.request.headers);
    reqPut.flush({ success: true, data: wireTramite });
    expect(detallePut?.id).toBe(77);

    let detalleDelete: TramiteDetalle | undefined;
    api.eliminarItemTramite(77, 'trailer').subscribe((res) => {
      detalleDelete = res;
    });

    const reqDel = httpMock.expectOne('https://api.aldialogistica.com/api/app/tramites/77/items/trailer');
    expect(reqDel.request.method).toBe('DELETE');
    assertNoClientSecretHeaders(reqDel.request.headers);
    reqDel.flush({ success: true, data: wireTramite });
    expect(detalleDelete?.placa).toBe('SXT482');
  });

  it('subirArchivoTramite, eliminarArchivoTramite y enviarTramite deben usar rutas/métodos correctos', () => {
    let detalleArchivo: TramiteDetalle | undefined;
    api
      .subirArchivoTramite(77, { entidad: 'vehiculo', tipo: 'soat1', data64: 'data:image/jpeg;base64,AAA' })
      .subscribe((res) => {
        detalleArchivo = res;
      });

    const reqPost = httpMock.expectOne('https://api.aldialogistica.com/api/app/tramites/77/archivos');
    expect(reqPost.request.method).toBe('POST');
    expect(reqPost.request.body).toEqual({
      entidad: 'vehiculo',
      tipo: 'soat1',
      data64: 'data:image/jpeg;base64,AAA'
    });
    assertNoClientSecretHeaders(reqPost.request.headers);
    reqPost.flush({ success: true, data: wireTramite });
    expect(detalleArchivo?.id).toBe(77);

    api.eliminarArchivoTramite(77, 15).subscribe();
    const reqDelFile = httpMock.expectOne('https://api.aldialogistica.com/api/app/tramites/77/archivos/15');
    expect(reqDelFile.request.method).toBe('DELETE');
    assertNoClientSecretHeaders(reqDelFile.request.headers);
    reqDelFile.flush({ success: true, data: wireTramite });

    let enviado: TramiteDetalle | undefined;
    api.enviarTramite(77).subscribe((res) => {
      enviado = res;
    });
    const reqEnviar = httpMock.expectOne('https://api.aldialogistica.com/api/app/tramites/77/enviar');
    expect(reqEnviar.request.method).toBe('POST');
    expect(reqEnviar.request.body).toEqual({});
    assertNoClientSecretHeaders(reqEnviar.request.headers);
    reqEnviar.flush({ success: true, data: { ...wireTramite, estado: 'ENVIADO', enviado_at: '2026-11-27T15:00:00Z' } });

    expect(enviado?.estado).toBe('ENVIADO');
    expect(enviado?.enviadoAt).toBe('2026-11-27T15:00:00Z');
  });
});
