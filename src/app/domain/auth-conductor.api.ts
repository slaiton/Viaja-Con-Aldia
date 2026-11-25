import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG, ApiConfig } from '@core/config/api.config';
import {
  SolicitarCodigoRequest,
  SolicitarCodigoResponse,
  VerificarCodigoRequest,
  VerificarCodigoResponse,
  RenovarTokenRequest,
  RenovarTokenResponse,
  ConductorYoResponse
} from '@core/models/auth-conductor.model';

@Injectable({
  providedIn: 'root'
})
export class AuthConductorApi {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_CONFIG) private readonly apiConfig: ApiConfig
  ) {}

  private get baseUrl(): string {
    return this.apiConfig.baseUrlAldia.replace(/\/+$/, '');
  }

  /**
   * POST /api/app/conductor/login
   * Envía código OTP de 6 dígitos por WhatsApp al conductor vinculado.
   * Sin Client-Secret ni Bearer token.
   */
  public solicitarCodigo(cedula: string, placa: string): Observable<SolicitarCodigoResponse> {
    const payload: SolicitarCodigoRequest = {
      cedula: cedula.trim(),
      placa: placa.trim().toUpperCase()
    };
    return this.http.post<SolicitarCodigoResponse>(`${this.baseUrl}/app/conductor/login`, payload);
  }

  /**
   * POST /api/app/conductor/login/verificar
   * Valida OTP de WhatsApp y emite tokens de sesión (access_token + refresh_token).
   * Sin Client-Secret ni Bearer token.
   */
  public verificarCodigo(payload: VerificarCodigoRequest): Observable<VerificarCodigoResponse> {
    const body: VerificarCodigoRequest = {
      cedula: payload.cedula.trim(),
      placa: payload.placa.trim().toUpperCase(),
      codigo: payload.codigo.trim(),
      ...(payload.dispositivo_id ? { dispositivo_id: payload.dispositivo_id.trim() } : {}),
      ...(payload.plataforma ? { plataforma: payload.plataforma.trim() } : {}),
      ...(payload.version_app ? { version_app: payload.version_app.trim() } : {}),
      ...(payload.push_token ? { push_token: payload.push_token.trim() } : {})
    };
    return this.http.post<VerificarCodigoResponse>(`${this.baseUrl}/app/conductor/login/verificar`, body);
  }

  /**
   * POST /api/app/conductor/token/renovar
   * Rota atómicamente el refresh_token cuando el access_token vence.
   * Sin Client-Secret ni Bearer token.
   */
  public renovarToken(refreshToken: string): Observable<RenovarTokenResponse> {
    const payload: RenovarTokenRequest = {
      refresh_token: refreshToken.trim()
    };
    return this.http.post<RenovarTokenResponse>(`${this.baseUrl}/app/conductor/token/renovar`, payload);
  }

  /**
   * GET /api/app/conductor/yo
   * Consulta el perfil del conductor, vehículo actual, tráiler y trámites abiertos.
   * Requiere Bearer token (inyectado por AuthInterceptor).
   */
  public obtenerPerfil(): Observable<ConductorYoResponse> {
    return this.http.get<ConductorYoResponse>(`${this.baseUrl}/app/conductor/yo`);
  }

  /**
   * DELETE /api/app/conductor/sesion
   * Anula los tokens en el backend.
   * Requiere Bearer token (inyectado por AuthInterceptor).
   */
  public cerrarSesion(): Observable<{ success: boolean; data?: { cerrada: boolean } }> {
    return this.http.delete<{ success: boolean; data?: { cerrada: boolean } }>(`${this.baseUrl}/app/conductor/sesion`);
  }
}
