/**
 * Contratos de datos tipados para autenticación 2FA WhatsApp de Conductor en Aldia-Backend.
 */

export interface SolicitarCodigoRequest {
  cedula: string;
  placa: string;
}

export interface SolicitarCodigoData {
  id: number;
  celular: string;
  expira_at: string;
  expira_en_segundos: number;
  reenviar_en_segundos: number;
}

export interface SolicitarCodigoResponse {
  success: boolean;
  data: SolicitarCodigoData;
}

export interface VerificarCodigoRequest {
  cedula: string;
  placa: string;
  codigo: string;
  dispositivo_id?: string;
  plataforma?: string;
  version_app?: string;
  push_token?: string;
}

export interface ConductorInfo {
  nombre: string;
  placa: string;
}

export interface VerificarCodigoData {
  access_token: string;
  token_type: string;
  expira_at: string;
  refresh_token: string;
  refresh_expira_at: string;
  sesion_id: number;
  conductor: ConductorInfo;
}

export interface VerificarCodigoResponse {
  success: boolean;
  data: VerificarCodigoData;
}

export interface RenovarTokenRequest {
  refresh_token: string;
}

export interface RenovarTokenData {
  access_token: string;
  token_type: string;
  expira_at: string;
  refresh_token: string;
  refresh_expira_at: string;
}

export interface RenovarTokenResponse {
  success: boolean;
  data: RenovarTokenData;
}

export interface AldiaApiErrorBody {
  success?: boolean;
  error?: string;
  message?: string;
  intentos_restantes?: number;
  reenviar_en_segundos?: number;
  data?: {
    intentos_restantes?: number;
    reenviar_en_segundos?: number;
  };
}

export interface AldiaSessionState {
  accessToken: string | null;
  refreshToken: string | null;
  expiraAt: string | null;
  refreshExpiraAt: string | null;
  sesionId: number | null;
  cedula: string | null;
  placa: string | null;
  nombreConductor: string | null;
}

export interface ConductorYoData {
  conductor: {
    nombre: string | null;
    documento: string;
    celular: string | null;
    correo: string | null;
  };
  vehiculo_actual: {
    placa: string;
    clase?: string | null;
    marca?: string | null;
    modelo?: string | number | null;
    vigencia_soat?: string | null;
    vigencia_tecnomecanica?: string | null;
  } | null;
  trailer: {
    placa: string;
  } | null;
  sesion?: {
    desde?: string | null;
    ultimo_login_at?: string | null;
  };
  tramites_abiertos?: unknown[];
}

export interface ConductorYoResponse {
  success: boolean;
  data: ConductorYoData;
}

export interface SolicitudOtpResult {
  success: boolean;
  celular: string;
  expiraEnSegundos: number;
  reenviarEnSegundos: number;
}

export interface VerificacionOtpResult {
  success: boolean;
  conductorNombre: string;
  placa: string;
}

export interface OtpErrorResult {
  code: string;
  message: string;
  intentosRestantes?: number;
  reenviarEnSegundos?: number;
}

