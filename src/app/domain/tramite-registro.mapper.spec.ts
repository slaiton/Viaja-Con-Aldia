import { HttpErrorResponse } from '@angular/common/http';
import {
  EstadoRegistroEnCursoData,
  IniciarRegistroRequest,
  SubirArchivoRequest,
  VerificarRegistroRequest
} from '@core/models/tramite-registro.model';
import {
  EstadoRegistroResponseDto,
  IniciarRegistroResponseDto,
  ListaTramitesResponseDto,
  TramiteDetalleDto,
  TramiteDetalleResponseDto,
  VerificarRegistroResponseDto
} from './tramite-registro.dto';
import { TramiteRegistroMapper } from './tramite-registro.mapper';

describe('TramiteRegistroMapper', () => {
  const buildTramiteDto = (overrides?: Partial<TramiteDetalleDto>): TramiteDetalleDto => ({
    id: 45,
    tipo: 'REGISTRO_NUEVO',
    estado: 'BORRADOR',
    placa: 'SXT482',
    enviado_at: '2026-11-27T10:00:00Z',
    revisado_at: null,
    motivo_rechazo: null,
    items: [
      {
        entidad: 'CONDUCTOR',
        accion: 'CREAR',
        llave: '1012345678',
        datos: { nombre: 'Carlos', apellido: 'Pérez' }
      }
    ],
    archivos: [
      {
        id: 9,
        entidad: 'CONDUCTOR',
        tipo: 'cedula1',
        mime: 'image/jpeg',
        tamano: 20480,
        subido_at: '2026-11-27T10:05:00Z'
      }
    ],
    eventos: [{ accion: 'CREADO', actor: 'CONDUCTOR', fecha: '2026-11-27T09:50:00Z' }],
    ...overrides
  });

  it('debe mapear IniciarRegistroResponseDto a camelCase y aplicar valores por defecto', () => {
    const dto: IniciarRegistroResponseDto = {
      success: true,
      data: {
        id: 12,
        celular: '******4567',
        expira_at: '2026-11-27T12:00:00Z',
        expira_en_segundos: 300,
        reenviar_en_segundos: 60
      }
    };

    const result = TramiteRegistroMapper.mapIniciarRegistroDto(dto);
    expect(result).toEqual({
      id: 12,
      celular: '******4567',
      expiraAt: '2026-11-27T12:00:00Z',
      expiraEnSegundos: 300,
      reenviarEnSegundos: 60
    });

    const fallback = TramiteRegistroMapper.mapIniciarRegistroDto({} as IniciarRegistroResponseDto);
    expect(fallback.id).toBe(0);
    expect(fallback.reenviarEnSegundos).toBe(60);
  });

  it('debe mapear VerificarRegistroResponseDto a VerificarRegistroResult en camelCase', () => {
    const dto: VerificarRegistroResponseDto = {
      success: true,
      data: {
        access_token: 'jwt-access',
        token_type: 'Bearer',
        expira_at: '2026-11-28T00:00:00Z',
        refresh_token: 'jwt-refresh',
        refresh_expira_at: '2026-12-05T00:00:00Z',
        sesion_id: 99,
        estado: 'REGISTRO',
        tramite_id: 45
      }
    };

    const result = TramiteRegistroMapper.mapVerificarRegistroDto(dto);
    expect(result).toEqual({
      accessToken: 'jwt-access',
      tokenType: 'Bearer',
      expiraAt: '2026-11-28T00:00:00Z',
      refreshToken: 'jwt-refresh',
      refreshExpiraAt: '2026-12-05T00:00:00Z',
      sesionId: 99,
      estado: 'REGISTRO',
      tramiteId: 45
    });
  });

  it('debe mapear EstadoRegistroResponseDto en BORRADOR incluyendo imagenes_permitidas como objeto o arreglo', () => {
    const dto: EstadoRegistroResponseDto = {
      success: true,
      data: {
        estado: 'BORRADOR',
        tramite: buildTramiteDto(),
        pasos: [
          {
            paso: 'conductor',
            entidad: 'CONDUCTOR',
            requerido: true,
            con_datos: true,
            imagenes: 1,
            imagenes_permitidas: ['cedula1', 'cedula2']
          },
          {
            paso: 'vehiculo',
            entidad: 'VEHICULO',
            requerido: true,
            con_datos: false,
            imagenes: 0,
            imagenes_permitidas: { a: 'tarjeta1', b: 'soat1' }
          }
        ]
      }
    };

    const result = TramiteRegistroMapper.mapEstadoRegistroDto(dto) as EstadoRegistroEnCursoData;
    expect(result.estado).toBe('BORRADOR');
    expect(result.tramite.enviadoAt).toBe('2026-11-27T10:00:00Z');
    expect(result.tramite.archivos[0].subidoAt).toBe('2026-11-27T10:05:00Z');
    expect(result.pasos[0].conDatos).toBeTrue();
    expect(result.pasos[0].imagenesPermitidas).toEqual(['cedula1', 'cedula2']);
    expect(result.pasos[1].conDatos).toBeFalse();
    expect(result.pasos[1].imagenesPermitidas).toEqual(['tarjeta1', 'soat1']);
  });

  it('debe mapear EstadoRegistroResponseDto en estado APROBADO', () => {
    const dto: EstadoRegistroResponseDto = {
      success: true,
      data: {
        estado: 'APROBADO',
        placa: 'SXT482',
        mensaje: 'Registro aprobado'
      }
    };

    const result = TramiteRegistroMapper.mapEstadoRegistroDto(dto);
    expect(result).toEqual({
      estado: 'APROBADO',
      placa: 'SXT482',
      mensaje: 'Registro aprobado'
    });
  });

  it('debe mapear TramiteDetalleResponseDto y ListaTramitesResponseDto con nulos defensivos', () => {
    const detalleRes: TramiteDetalleResponseDto = {
      success: true,
      data: buildTramiteDto({
        estado: 'RECHAZADO',
        enviado_at: null,
        revisado_at: '2026-11-27T14:00:00Z',
        motivo_rechazo: 'SOAT ilegible'
      })
    };

    const detalle = TramiteRegistroMapper.mapTramiteDetalleDto(detalleRes);
    expect(detalle.estado).toBe('RECHAZADO');
    expect(detalle.enviadoAt).toBeNull();
    expect(detalle.revisadoAt).toBe('2026-11-27T14:00:00Z');
    expect(detalle.motivoRechazo).toBe('SOAT ilegible');

    const listaRes: ListaTramitesResponseDto = {
      success: true,
      data: [buildTramiteDto({ id: 1 }), buildTramiteDto({ id: 2 })]
    };
    const lista = TramiteRegistroMapper.mapListaTramitesDto(listaRes);
    expect(lista.length).toBe(2);
    expect(lista.map((t) => t.id)).toEqual([1, 2]);
  });

  it('debe serializar payloads salientes Dominio -> DTO respetando el contrato snake_case del backend', () => {
    const initDomain: IniciarRegistroRequest = {
      cedula: '1012345678',
      placa: 'SXT482',
      celular: '3001234567'
    };
    expect(TramiteRegistroMapper.toIniciarRegistroDto(initDomain)).toEqual({
      cedula: '1012345678',
      placa: 'SXT482',
      celular: '3001234567'
    });

    const verifDomain: VerificarRegistroRequest = {
      cedula: '1012345678',
      placa: 'SXT482',
      celular: '3001234567',
      codigo: '654321',
      dispositivoId: 'dev-1',
      plataforma: 'android',
      versionApp: '1.0.9',
      pushToken: 'push-abc'
    };
    expect(TramiteRegistroMapper.toVerificarRegistroDto(verifDomain)).toEqual({
      cedula: '1012345678',
      placa: 'SXT482',
      celular: '3001234567',
      codigo: '654321',
      dispositivo_id: 'dev-1',
      plataforma: 'android',
      version_app: '1.0.9',
      push_token: 'push-abc'
    });

    const archivoDomain: SubirArchivoRequest = {
      entidad: 'conductor',
      tipo: 'cedula1',
      data64: 'data:image/jpeg;base64,/9j/4AAQ'
    };
    expect(TramiteRegistroMapper.toSubirArchivoDto(archivoDomain)).toEqual({
      entidad: 'conductor',
      tipo: 'cedula1',
      data64: 'data:image/jpeg;base64,/9j/4AAQ'
    });
  });

  it('debe mapear errores HTTP 409, 422 y 429 en mapHttpError', () => {
    const err409 = new HttpErrorResponse({
      status: 409,
      error: {
        error: 'YA_REGISTRADO',
        message: 'Esta cédula o placa ya está registrada.'
      }
    });
    const parsed409 = TramiteRegistroMapper.mapHttpError(err409, 'Fallback');
    expect(parsed409.status).toBe(409);
    expect(parsed409.code).toBe('YA_REGISTRADO');
    expect(parsed409.message).toBe('Esta cédula o placa ya está registrada.');

    const err422 = new HttpErrorResponse({
      status: 422,
      error: {
        error: 'REGISTRO_INCOMPLETO',
        message: 'Faltan datos para enviar.',
        faltan: [{ paso: 'vehiculo', campo: 'marca', etiqueta: 'Marca' }],
        errors: { marca: ['Obligatoria'] }
      }
    });
    const parsed422 = TramiteRegistroMapper.mapHttpError(err422, 'Fallback');
    expect(parsed422.status).toBe(422);
    expect(parsed422.code).toBe('REGISTRO_INCOMPLETO');
    expect(parsed422.faltan).toEqual([{ paso: 'vehiculo', campo: 'marca', etiqueta: 'Marca' }]);
    expect(parsed422.erroresCampo['marca']).toEqual(['Obligatoria']);

    const err429 = new HttpErrorResponse({
      status: 429,
      error: {
        error: 'ESPERA_REENVIO',
        message: 'Espera antes de reenviar.',
        reenviar_en_segundos: 42,
        intentos_restantes: 2
      }
    });
    const parsed429 = TramiteRegistroMapper.mapHttpError(err429, 'Fallback');
    expect(parsed429.status).toBe(429);
    expect(parsed429.code).toBe('ESPERA_REENVIO');
    expect(parsed429.reenviarEnSegundos).toBe(42);
    expect(parsed429.intentosRestantes).toBe(2);
  });
});
