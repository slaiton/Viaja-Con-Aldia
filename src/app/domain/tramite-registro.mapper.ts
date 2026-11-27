import { HttpErrorResponse } from '@angular/common/http';
import {
  ErrorTramiteDomain,
  EstadoRegistroData,
  IniciarRegistroRequest,
  IniciarRegistroResult,
  PasoRegistro,
  SubirArchivoRequest,
  TramiteArchivo,
  TramiteDetalle,
  VerificarRegistroRequest,
  VerificarRegistroResult
} from '@core/models/tramite-registro.model';
import {
  ErrorTramiteBodyDto,
  EstadoRegistroResponseDto,
  IniciarRegistroRequestDto,
  IniciarRegistroResponseDto,
  ListaTramitesResponseDto,
  PasoRegistroDto,
  SubirArchivoRequestDto,
  TramiteArchivoDto,
  TramiteDetalleDto,
  TramiteDetalleResponseDto,
  VerificarRegistroRequestDto,
  VerificarRegistroResponseDto
} from './tramite-registro.dto';

export class TramiteRegistroMapper {
  static toIniciarRegistroDto(payload: IniciarRegistroRequest): IniciarRegistroRequestDto {
    return {
      cedula: payload.cedula,
      placa: payload.placa,
      celular: payload.celular
    };
  }

  static toVerificarRegistroDto(payload: VerificarRegistroRequest): VerificarRegistroRequestDto {
    return {
      cedula: payload.cedula,
      placa: payload.placa,
      celular: payload.celular,
      codigo: payload.codigo,
      dispositivo_id: payload.dispositivoId,
      plataforma: payload.plataforma,
      version_app: payload.versionApp,
      push_token: payload.pushToken
    };
  }

  static toSubirArchivoDto(payload: SubirArchivoRequest): SubirArchivoRequestDto {
    return {
      entidad: payload.entidad,
      tipo: payload.tipo,
      data64: payload.data64
    };
  }

  static mapIniciarRegistroDto(res: IniciarRegistroResponseDto): IniciarRegistroResult {
    const data = res?.data;
    return {
      id: data?.id ?? 0,
      celular: data?.celular ?? '',
      expiraAt: data?.expira_at ?? '',
      expiraEnSegundos: data?.expira_en_segundos ?? 0,
      reenviarEnSegundos: data?.reenviar_en_segundos ?? 60
    };
  }

  static mapVerificarRegistroDto(res: VerificarRegistroResponseDto): VerificarRegistroResult {
    const data = res?.data;
    return {
      accessToken: data?.access_token ?? '',
      tokenType: data?.token_type ?? 'Bearer',
      expiraAt: data?.expira_at ?? '',
      refreshToken: data?.refresh_token ?? '',
      refreshExpiraAt: data?.refresh_expira_at ?? '',
      sesionId: data?.sesion_id ?? 0,
      estado: 'REGISTRO',
      tramiteId: data?.tramite_id ?? 0
    };
  }

  static mapEstadoRegistroDto(res: EstadoRegistroResponseDto): EstadoRegistroData {
    const data = res?.data;
    if (!data || data.estado === 'APROBADO') {
      return {
        estado: 'APROBADO',
        placa: data && 'placa' in data ? data.placa : '',
        mensaje: data && 'mensaje' in data ? data.mensaje : ''
      };
    }

    return {
      estado: data.estado,
      tramite: TramiteRegistroMapper.mapTramite(data.tramite),
      pasos: Array.isArray(data.pasos) ? data.pasos.map(TramiteRegistroMapper.mapPaso) : [],
      reabiertoId: data.reabierto_id
    };
  }

  static mapTramiteDetalleDto(res: TramiteDetalleResponseDto): TramiteDetalle {
    return TramiteRegistroMapper.mapTramite(res?.data);
  }

  static mapListaTramitesDto(res: ListaTramitesResponseDto): TramiteDetalle[] {
    const list = Array.isArray(res?.data) ? res.data : [];
    return list.map(TramiteRegistroMapper.mapTramite);
  }

  static mapHttpError(err: unknown, fallbackMessage: string): ErrorTramiteDomain {
    const httpErr = err as HttpErrorResponse;
    const body = (httpErr?.error || {}) as ErrorTramiteBodyDto;
    const status = httpErr?.status ?? 0;

    return {
      status,
      code: body?.error || (status === 0 ? 'NETWORK_ERROR' : 'ERROR_API'),
      message: body?.message || fallbackMessage,
      reenviarEnSegundos: body?.reenviar_en_segundos,
      intentosRestantes: body?.intentos_restantes,
      erroresCampo: body?.errors || {},
      faltan: Array.isArray(body?.faltan) ? body.faltan : []
    };
  }

  private static mapTramite(dto?: TramiteDetalleDto): TramiteDetalle {
    return {
      id: dto?.id ?? 0,
      tipo: dto?.tipo ?? '',
      estado: dto?.estado ?? 'BORRADOR',
      placa: dto?.placa ?? '',
      enviadoAt: dto?.enviado_at ?? null,
      revisadoAt: dto?.revisado_at ?? null,
      motivoRechazo: dto?.motivo_rechazo ?? null,
      items: Array.isArray(dto?.items) ? dto.items : [],
      archivos: Array.isArray(dto?.archivos) ? dto.archivos.map(TramiteRegistroMapper.mapArchivo) : [],
      eventos: Array.isArray(dto?.eventos) ? dto.eventos : []
    };
  }

  private static mapArchivo(dto: TramiteArchivoDto): TramiteArchivo {
    return {
      id: dto.id,
      entidad: dto.entidad,
      tipo: dto.tipo,
      mime: dto.mime,
      tamano: dto.tamano,
      subidoAt: dto.subido_at
    };
  }

  private static mapPaso(dto: PasoRegistroDto): PasoRegistro {
    const permitidas = Array.isArray(dto.imagenes_permitidas)
      ? dto.imagenes_permitidas
      : dto.imagenes_permitidas && typeof dto.imagenes_permitidas === 'object'
        ? Object.values(dto.imagenes_permitidas)
        : [];

    return {
      paso: dto.paso,
      entidad: dto.entidad,
      requerido: Boolean(dto.requerido),
      conDatos: Boolean(dto.con_datos),
      imagenes: dto.imagenes ?? 0,
      imagenesPermitidas: permitidas
    };
  }
}
