export type EstadoTramite = 'BORRADOR' | 'ENVIADO' | 'RECHAZADO' | 'APROBADO' | 'CANCELADO';

export type EntidadTramiteUpper = 'CONDUCTOR' | 'VEHICULO' | 'TRAILER' | 'PROPIETARIO' | 'TENEDOR';

export type EntidadTramiteSlug = 'conductor' | 'vehiculo' | 'trailer' | 'propietario' | 'tenedor';

export interface IniciarRegistroRequest {
  cedula: string;
  placa: string;
  celular: string;
}

export interface IniciarRegistroData {
  id: number;
  celular: string;
  expira_at: string;
  expira_en_segundos: number;
  reenviar_en_segundos: number;
}

export interface IniciarRegistroResponse {
  success: boolean;
  data: IniciarRegistroData;
}

export interface VerificarRegistroRequest {
  cedula: string;
  placa: string;
  celular: string;
  codigo: string;
  dispositivo_id?: string;
  plataforma?: string;
  version_app?: string;
  push_token?: string;
}

export interface VerificarRegistroData {
  access_token: string;
  token_type: string;
  expira_at: string;
  refresh_token: string;
  refresh_expira_at: string;
  sesion_id: number;
  estado: 'REGISTRO';
  tramite_id: number;
}

export interface VerificarRegistroResponse {
  success: boolean;
  data: VerificarRegistroData;
}

export interface TramiteItem {
  entidad: EntidadTramiteUpper;
  accion: string;
  llave: string;
  datos: Record<string, unknown>;
}

export interface TramiteArchivo {
  id: number;
  entidad: EntidadTramiteUpper;
  tipo: string;
  mime: string;
  tamano: number;
  subido_at: string;
}

export interface TramiteEvento {
  accion: string;
  actor: string;
  fecha: string;
}

export interface TramiteDetalle {
  id: number;
  tipo: string;
  estado: EstadoTramite;
  placa: string;
  enviado_at: string | null;
  revisado_at: string | null;
  motivo_rechazo: string | null;
  items: TramiteItem[];
  archivos: TramiteArchivo[];
  eventos: TramiteEvento[];
}

export interface PasoRegistro {
  paso: EntidadTramiteSlug;
  entidad: EntidadTramiteUpper;
  requerido: boolean;
  con_datos: boolean;
  imagenes: number;
  imagenes_permitidas: string[];
}

export interface EstadoRegistroEnCursoData {
  estado: Exclude<EstadoTramite, 'APROBADO'>;
  tramite: TramiteDetalle;
  pasos: PasoRegistro[];
}

export interface EstadoRegistroAprobadoData {
  estado: 'APROBADO';
  placa: string;
  mensaje: string;
}

export interface EstadoRegistroResponse {
  success: boolean;
  data: EstadoRegistroEnCursoData | EstadoRegistroAprobadoData;
}

export interface TramiteDetalleResponse {
  success: boolean;
  data: TramiteDetalle;
}

export interface ReferenciaConductor {
  nombre: string;
  telefono: string;
}

export interface DatosTerceroOpcionalTramite {
  tipo_documento?: string;
  documento?: string;
  dv?: string;
  ciudad_expedicion?: string;
  nacionalidad?: string;
  tipo_tercero?: string;
  nombre?: string;
  apellido?: string;
  fecha_nacimiento?: string;
  grupo_sanguineo?: string;
  ciudad_residencia?: string;
  direccion?: string;
  barrio?: string;
  telefono_1?: string;
  telefono_2?: string;
  celular?: string;
  celular_empresarial?: string;
  email?: string;
  tipo_conductor?: string;
  empresa_conductor?: string;
  pase_conduccion?: string;
  categoria_pase?: string;
  vigencia_pase?: string;
  clasificado_operacion?: string;
  aplica_libreta_tripulante?: string;
  libreta_tripulante?: string;
  libreta_militar?: string;
  vigencia_libreta?: string;
  eps?: string;
  numero_eps?: string | number;
  vigencia_eps?: string;
  arl?: string;
  numero_arl?: string | number;
  vigencia_arl?: string;
  afp?: string;
  numero_afp?: string | number;
  vigencia_afp?: string;
  banco_afiliado?: string;
  cuenta_banco?: string;
  llamar_a?: string;
  parentesco_contacto?: string;
  ciudad_llamar_a?: string;
  telefono_llamar_a?: string;
  observacion_documentacion?: string;
}

export interface DatosConductorTramite extends DatosTerceroOpcionalTramite {
  referencias?: ReferenciaConductor[];
  antecedentes?: Record<string, string>;
}

export interface DatosVehiculoTramite {
  placa?: string;
  pais?: string;
  tarjeta_propiedad?: string;
  fecha_matricula?: string;
  tipo_servicio?: string;
  tipo_registro?: string;
  empresa?: string;
  cedula_conductor?: string;
  cedula_propietario?: string;
  cedula_poseedor?: string;
  clase_vehiculo?: string;
  marca?: string;
  clase_linea?: string;
  carroceria?: string;
  color?: string;
  modelo?: string;
  repotenciado?: string;
  repotenciado_a_modelo?: string;
  numero_ejes?: string | number;
  numero_motor?: string;
  motor?: string;
  numero_chasis?: string;
  tipo_vehiculo?: string;
  capacidad?: number;
  capacidad_runt?: number;
  peso_bruto?: number;
  peso_bruto_permitido?: number;
  peso_vacio?: number;
  alto?: number;
  largo?: number;
  ancho?: number;
  tipo_liquidacion_tarifa?: string;
  tipo_liquidacion_flete?: string;
  aseguradora?: string;
  soat?: string;
  vigencia_soat?: string;
  poliza?: string;
  tecnomecanica?: string;
  vigencia_tecnomecanica?: string;
  veto_vehicular?: string;
  posee_gps?: string;
  proveedor_gps?: string;
  usuario_gps?: string;
  clave_gps?: string;
  cuenta_gps?: string;
  vencimiento_gps?: string;
  observacion?: string;
  antecedentes?: Record<string, string>;
}

export interface DatosTrailerTramite {
  placa_trailer?: string;
  pais?: string;
  registro_nacional_remolque?: string;
  documento_propietario?: string;
  documento_poseedor?: string;
  tipo_carroceria?: string;
  marca_trailer?: string;
  modelo?: string;
  numero_ejes?: string;
  configuracion?: string;
  peso_vacio?: number;
  largo?: number;
  alto?: number;
  ancho?: number;
  checklist?: string;
  fecha_checklist?: string;
  nueva_fecha_checklist?: string;
  habilitacion?: string;
  numero_habilitacion?: string;
  codigo_registro_habilitacion?: string;
  vigencia_habilitacion?: string;
  certificado_habilitacion_tramitado_por?: string;
  certificado_habilitado_tramitado_por?: string;
  poliza_andina?: string;
  numero_poliza_andina?: string;
  aseguradora?: string;
  vigencia_poliza_andina?: string;
  anexo_colombiano?: string;
  anexo_venezolano?: string;
  anexo_ecuatoriano?: string;
}

export interface GuardarItemRequest<T> {
  datos: T;
}

export interface SubirArchivoRequest {
  entidad: EntidadTramiteSlug;
  tipo: string;
  data64: string;
}

export type CatalogoNombre =
  | 'tipodocumento'
  | 'ciudad'
  | 'pais'
  | 'banco'
  | 'clasevehiculo'
  | 'claselinea'
  | 'marcavehiculo'
  | 'carroceria'
  | 'aseguradora'
  | 'color'
  | 'eps'
  | 'arl'
  | 'afp'
  | 'proveedorgps'
  | 'empresa';

export interface CatalogoItem {
  id: number;
  nombre: string;
}

export interface CampoFaltanteRegistro {
  paso: string;
  campo: string;
  etiqueta: string;
}

export interface ErrorTramiteBody {
  success?: boolean;
  error?: string;
  message?: string;
  intentos_restantes?: number;
  reenviar_en_segundos?: number;
  faltan?: CampoFaltanteRegistro[];
  errors?: Record<string, string[]>;
}
