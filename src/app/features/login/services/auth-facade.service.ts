import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { StorageService } from '@core/services/storage.service';
import { CoreLoggerService } from '@core/services/core-logger.service';
import { SessionStore } from '@core/session/session.store';
import { DevicePlatformService, DeviceMetadata } from '@core/platform/device-platform.service';
import { AuthConductorApi } from '@domain/auth-conductor.api';
import {
  SolicitarCodigoResponse,
  VerificarCodigoResponse,
  AldiaApiErrorBody,
  SolicitudOtpResult,
  VerificacionOtpResult,
  OtpErrorResult
} from '@core/models/auth-conductor.model';
import { environment } from '@env/environment';
import { catchError, EMPTY, from, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { VersionService } from './version.service';

@Injectable({ providedIn: 'root' })
export class AuthFacadeService {
  constructor(
    private readonly authConductorApi: AuthConductorApi,
    private readonly devicePlatform: DevicePlatformService,
    private readonly sessionStore: SessionStore,
    private readonly coreLogger: CoreLoggerService,
    private readonly router: Router,
    private readonly alert: AlertService,
    private readonly versionService: VersionService,
    private readonly authService: AuthService,
    private readonly storage: StorageService
  ) {}

  /**
   * Solicita el código OTP de 6 dígitos por WhatsApp en Aldia-Backend.
   */
  solicitarCodigoOtp(cedula: string, placa: string): Observable<SolicitudOtpResult> {
    const cleanCedula = (cedula || '').toString().replace(/\D/g, '').trim();
    const cleanPlaca = (placa || '').toString().replace(/\s+/g, '').toUpperCase().trim();

    return from(this.versionService.validateVersion()).pipe(
      catchError((verErr: unknown) => {
        if (verErr instanceof Error && verErr.message === 'Version outdated') {
          return throwError(() => verErr);
        }
        return of(null);
      }),
      switchMap(() => this.authConductorApi.solicitarCodigo(cleanCedula, cleanPlaca)),
      map((res: SolicitarCodigoResponse): SolicitudOtpResult => ({
        success: res.success,
        celular: res.data.celular,
        expiraEnSegundos: res.data.expira_en_segundos,
        reenviarEnSegundos: res.data.reenviar_en_segundos
      })),
      catchError((err: unknown) => {
        if (err instanceof Error && err.message === 'Version outdated') {
          return throwError(() => ({
            code: 'VERSION_OUTDATED',
            message: 'Se requiere actualización para continuar.'
          } as OtpErrorResult));
        }

        const httpErr = err as HttpErrorResponse;
        const body = (httpErr?.error || {}) as AldiaApiErrorBody;
        const code = body?.error || (httpErr?.status === 0 ? 'NETWORK_ERROR' : 'ERROR_SOLICITUD');
        const message = body?.message || 'Error al solicitar el código de verificación.';
        const reenviarEnSegundos = body?.reenviar_en_segundos ?? body?.data?.reenviar_en_segundos;

        this.coreLogger.log('AuthFacadeService.solicitarCodigoOtp error', { code, message, reenviarEnSegundos });

        return throwError(() => ({
          code,
          message,
          reenviarEnSegundos
        } as OtpErrorResult));
      })
    );
  }

  /**
   * Verifica el código OTP de 6 dígitos y establece la sesión reactiva en SessionStore.
   */
  verificarCodigoOtp(cedula: string, placa: string, codigo: string): Observable<VerificacionOtpResult> {
    const cleanCedula = (cedula || '').toString().replace(/\D/g, '').trim();
    const cleanPlaca = (placa || '').toString().replace(/\s+/g, '').toUpperCase().trim();
    const cleanCodigo = (codigo || '').toString().replace(/\D/g, '').trim();

    return from(this.devicePlatform.getDeviceMetadata()).pipe(
      switchMap((meta: DeviceMetadata) =>
        this.authConductorApi.verificarCodigo({
          cedula: cleanCedula,
          placa: cleanPlaca,
          codigo: cleanCodigo,
          dispositivo_id: meta.dispositivo_id,
          plataforma: meta.plataforma,
          version_app: meta.version_app,
          push_token: meta.push_token
        })
      ),
      tap((res: VerificarCodigoResponse) => {
        this.sessionStore.setAldiaSession(res.data, cleanCedula, cleanPlaca);
        this.coreLogger.log('AuthFacadeService: Sesión 2FA establecida exitosamente', {
          conductor: res.data.conductor.nombre,
          placa: res.data.conductor.placa
        });
      }),
      map((res: VerificarCodigoResponse): VerificacionOtpResult => ({
        success: res.success,
        conductorNombre: res.data.conductor.nombre,
        placa: res.data.conductor.placa
      })),
      catchError((err: unknown) => {
        const httpErr = err as HttpErrorResponse;
        const body = (httpErr?.error || {}) as AldiaApiErrorBody;
        const code = body?.error || (httpErr?.status === 0 ? 'NETWORK_ERROR' : 'ERROR_VERIFICACION');
        const message = body?.message || 'Error al verificar el código.';
        const intentosRestantes = body?.intentos_restantes ?? body?.data?.intentos_restantes;

        this.coreLogger.log('AuthFacadeService.verificarCodigoOtp error', { code, message, intentosRestantes });

        return throwError(() => ({
          code,
          message,
          intentosRestantes
        } as OtpErrorResult));
      })
    );
  }

  /**
   * Comprueba si existe una sesión válida (activa o renovable).
   */
  validateSession(): Observable<boolean> {
    if (this.sessionStore.isSessionValid()) {
      return of(true);
    }
    return EMPTY;
  }

  /**
   * Cierra la sesión en Aldia-Backend, limpia SessionStore y redirige a /login.
   */
  logout(): Observable<boolean> {
    return this.authConductorApi.cerrarSesion().pipe(
      catchError((err: unknown) => {
        this.coreLogger.log('AuthFacadeService.logout ignorado defensivamente', err);
        return of({ success: true });
      }),
      tap(() => {
        this.sessionStore.clearSession();
        void this.router.navigate(['/login'], { replaceUrl: true });
      }),
      map(() => true)
    );
  }

  /**
   * Flujo heredado de autenticación legacy contra 3SL (mantenido para retrocompatibilidad).
   */
  login(credentials: { username: string; password: string }): Observable<unknown> {
    return this.versionService.validateVersion().pipe(
      switchMap(() => this.authService.login(this.buildLegacyPayload(credentials))),
      tap((data: unknown) => {
        const cleanPlaca = (credentials.password || '').trim().replace(/\s+/g, '').toUpperCase();
        const cleanCedula = (credentials.username || '').toString().trim().replace(/^["']|["']$/g, '');
        const tokenObj = data as { access_token?: string };
        const cleanToken = (tokenObj?.access_token || '').toString().trim().replace(/^["']|["']$/g, '');
        this.storage.set('token', cleanToken);
        this.storage.set('placa', cleanPlaca);
        this.storage.set('conductor', cleanCedula);
        localStorage.setItem('token', cleanToken);
        localStorage.setItem('placa', cleanPlaca);
        localStorage.setItem('conductor', cleanCedula);
      }),
      catchError((err: unknown) => {
        const httpErr = err as HttpErrorResponse;
        this.alert.presentAlert(
          'Error',
          'Fallo al ingresar',
          httpErr?.error?.data || 'Error inesperado, intente nuevamente.',
          'Cerrar'
        );
        return throwError(() => err);
      })
    );
  }

  private buildLegacyPayload(credentials: { username: string; password: string }) {
    const cleanPlaca = (credentials.password || '').trim().replace(/\s+/g, '').toUpperCase();
    const cleanCedula = (credentials.username || '').toString().trim();
    return {
      numeroPlacaxxx: cleanPlaca,
      codigoTercerox: cleanCedula,
      version: environment.version
    };
  }
}
