import { Injectable, Inject, Injector } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
  HttpContextToken
} from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { API_CONFIG, ApiConfig } from '@core/config/api.config';
import { SessionStore } from '@core/session/session.store';
import { AuthConductorApi } from '@domain/auth-conductor.api';
import { CoreLoggerService } from '@core/services/core-logger.service';

export const IS_RETRIED_REQUEST = new HttpContextToken<boolean>(() => false);

export interface RefreshOutcome {
  token: string | null;
  failed: boolean;
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private readonly refreshSubject = new BehaviorSubject<RefreshOutcome | null>(null);

  constructor(
    @Inject(API_CONFIG) private readonly apiConfig: ApiConfig,
    private readonly sessionStore: SessionStore,
    private readonly injector: Injector,
    private readonly router: Router,
    private readonly coreLogger: CoreLoggerService
  ) {}

  private get authConductorApi(): AuthConductorApi {
    return this.injector.get(AuthConductorApi);
  }

  private get cleanBaseAldia(): string {
    return this.apiConfig.baseUrlAldia.replace(/\/+$/, '');
  }

  /**
   * Retorna true únicamente si la URL apunta a baseUrlAldia Y la ruta pertenece
   * a la aplicación del conductor (/app/conductor/, /app/registro, /app/tramites o /app/catalogos/).
   * Nunca inyecta Bearer en /tercero/preoperacional/*, /documento, /enturnamiento ni en 3SL.
   */
  private isConductorAppRoute(url: string): boolean {
    const cleanUrl = url.toLowerCase();
    const base = this.cleanBaseAldia.toLowerCase();
    if (!cleanUrl.startsWith(base)) {
      return false;
    }
    return (
      cleanUrl.includes('/app/conductor/') ||
      cleanUrl.includes('/app/registro') ||
      cleanUrl.includes('/app/tramites') ||
      cleanUrl.includes('/app/catalogos/')
    );
  }

  /**
   * Retorna true si es una ruta pública de inicio/verificación OTP o renovación.
   */
  private isPublicAuthRoute(url: string): boolean {
    const cleanUrl = url.toLowerCase();
    return (
      cleanUrl.includes('/app/conductor/login/verificar') ||
      cleanUrl.includes('/app/conductor/login') ||
      cleanUrl.includes('/app/conductor/token/renovar') ||
      cleanUrl.includes('/app/registro/iniciar') ||
      cleanUrl.includes('/app/registro/verificar')
    );
  }

  /**
   * Retorna true si la ruta es de la app de conductor y NO es pública de autenticación.
   * NOTA CRÍTICA: DELETE /app/conductor/sesion SÍ debe recibir Bearer para cerrar sesión.
   */
  private shouldAttachBearer(url: string): boolean {
    if (!this.isConductorAppRoute(url)) {
      return false;
    }
    return !this.isPublicAuthRoute(url);
  }

  /**
   * Retorna true si la petición admite reintento con renovación de token ante 401.
   * Si la petición es DELETE /app/conductor/sesion, jamás se intenta renovar ni revivir tokens.
   */
  private shouldAttemptRefresh(url: string): boolean {
    if (!this.shouldAttachBearer(url)) {
      return false;
    }
    const cleanUrl = url.toLowerCase();
    return !cleanUrl.includes('/app/conductor/sesion');
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let preparedReq = req;

    if (this.shouldAttachBearer(req.url)) {
      const token = this.sessionStore.getAldiaAccessToken();
      if (token && !req.headers.has('Authorization')) {
        preparedReq = this.cloneWithToken(req, token, false);
      }
    }

    return next.handle(preparedReq).pipe(
      catchError((error: unknown) => {
        const isRetried = preparedReq.context.get(IS_RETRIED_REQUEST);
        const canRefresh = this.shouldAttemptRefresh(preparedReq.url);

        if (
          error instanceof HttpErrorResponse &&
          error.status === 401 &&
          canRefresh &&
          !isRetried
        ) {
          return this.handle401Error(preparedReq, next, error);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(
    req: HttpRequest<unknown>,
    next: HttpHandler,
    originalError: HttpErrorResponse
  ): Observable<HttpEvent<unknown>> {
    const refreshToken = this.sessionStore.getAldiaRefreshToken();

    if (!refreshToken || !this.sessionStore.isRefreshTokenValid()) {
      this.coreLogger.log('AUTH_INTERCEPTOR_SESSION_EXPIRED', {
        reason: 'Refresh token no disponible o vencido',
        url: req.url
      });
      this.sessionStore.clearSession();
      void this.router.navigate(['/login'], { replaceUrl: true });
      return throwError(() => new Error('Sesión vencida. Ingresa de nuevo.'));
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshSubject.next(null);

      return this.authConductorApi.renovarToken(refreshToken).pipe(
        switchMap((res) => {
          this.isRefreshing = false;
          if (res?.success && res.data?.access_token) {
            const { access_token, expira_at, refresh_token, refresh_expira_at } = res.data;
            this.sessionStore.updateRotatedTokens(access_token, expira_at, refresh_token, refresh_expira_at);
            this.refreshSubject.next({ token: access_token, failed: false });
            return next.handle(this.cloneWithToken(req, access_token, true));
          }
          this.sessionStore.clearSession();
          this.refreshSubject.next({ token: null, failed: true });
          void this.router.navigate(['/login'], { replaceUrl: true });
          return throwError(() => new Error('Fallo al renovar sesión'));
        }),
        catchError((refreshErr: unknown) => {
          this.isRefreshing = false;
          this.coreLogger.log('AUTH_INTERCEPTOR_REFRESH_FAILED', {
            error: refreshErr instanceof Error ? refreshErr.message : 'Error desconocido en renovación'
          });
          this.sessionStore.clearSession();
          this.refreshSubject.next({ token: null, failed: true });
          void this.router.navigate(['/login'], { replaceUrl: true });
          return throwError(() => refreshErr);
        })
      );
    }

    return this.refreshSubject.pipe(
      filter((res): res is RefreshOutcome => res !== null),
      take(1),
      switchMap((res) => {
        if (res.failed || !res.token) {
          return throwError(() => originalError);
        }
        return next.handle(this.cloneWithToken(req, res.token, true));
      })
    );
  }

  private cloneWithToken(req: HttpRequest<unknown>, token: string, isRetry: boolean = false): HttpRequest<unknown> {
    let context = req.context;
    if (isRetry) {
      context = context.set(IS_RETRIED_REQUEST, true);
    }

    return req.clone({
      context,
      setHeaders: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
  }
}
