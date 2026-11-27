import {
  CampoFaltanteRegistro,
  EntidadTramiteSlug,
  EntidadTramiteUpper,
  EstadoTramite
} from '@core/models/tramite-registro.model';

export interface IniciarRegistroRequestDto {
  cedula: string;
  placa: string;
  celular: string;
}

export interface IniciarRegistroDataDto {
  id: number;
  celular: string;
  expira_at: string;
  expira_en_segundos: number;
  reenviar_en_segundos: number;
}

export interface IniciarRegistroResponseDto {
  success: boolean;
  data: IniciarRegistroDataDto;
}

export interface VerificarRegistroRequestDto {
  cedula: string;
  placa: string;
  celular: string;
  codigo: string;
  dispositivo_id?: string;
  plataforma?: string;
  version_app?: string;
  push_token?: string;
}

export interface VerificarRegistroDataDto {
  access_token: string;
  token_type: string;
  expira_at: string;
  refresh_token: string;
  refresh_expira_at: string;
  sesion_id: number;
  estado: 'REGISTRO';
  tramite_id: number;
}

export interface VerificarRegistroResponseDto {
  success: boolean;
  data: VerificarRegistroDataDto;
}

export interface TramiteItemDto {
  entidad: EntidadTramiteUpper;
  accion: string;
  llave: string;
  datos: Record<string, unknown>;
}

export interface TramiteArchivoDto {
  id: number;
  entidad: EntidadTramiteUpper;
  tipo: string;
  mime: string;
  tamano: number;
  subido_at: string;
}

export interface TramiteEventoDto {
  accion: string;
  actor: string;
  fecha: string;
}

export interface TramiteDetalleDto {
  id: number;
  tipo: string;
  estado: EstadoTramite;
  placa: string;
  enviado_at: string | null;
  revisado_at: string | null;
  motivo_rechazo: string | null;
  items: TramiteItemDto[];
  archivos: TramiteArchivoDto[];
  eventos: TramiteEventoDto[];
}

export interface PasoRegistroDto {
  paso: EntidadTramiteSlug;
  entidad: EntidadTramiteUpper;
  requerido: boolean;
  con_datos: boolean;
  imagenes: number;
  imagenes_permitidas: string[] | Record<string, string>;
}

export interface EstadoRegistroEnCursoDataDto {
  estado: Exclude<EstadoTramite, 'APROBADO'>;
  tramite: TramiteDetalleDto;
  pasos: PasoRegistroDto[];
  reabierto_id?: number;
}

export interface EstadoRegistroAprobadoDataDto {
  estado: 'APROBADO';
  placa: string;
  mensaje: string;
}

export interface EstadoRegistroResponseDto {
  success: boolean;
  data: EstadoRegistroEnCursoDataDto | EstadoRegistroAprobadoDataDto;
}

export interface TramiteDetalleResponseDto {
  success: boolean;
  data: TramiteDetalleDto;
}

export interface ListaTramitesResponseDto {
  success: boolean;
  data: TramiteDetalleDto[];
}

export interface GuardarItemRequestDto<T> {
  datos: T;
}

export interface SubirArchivoRequestDto {
  entidad: EntidadTramiteSlug;
  tipo: string;
  data64: string;
}

export interface ErrorTramiteBodyDto {
  success?: boolean;
  error?: string;
  message?: string;
  intentos_restantes?: number;
  reenviar_en_segundos?: number;
  faltan?: CampoFaltanteRegistro[];
  errors?: Record<string, string[]>;
}
