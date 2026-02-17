import { Injectable } from "@angular/core";
import { AlertService } from "@core/services/alert.service";
import { AuthService } from "@core/services/auth.service";
import { environment } from "@env/environment";
import { catchError, EMPTY, switchMap, throwError, tap } from "rxjs";
import { VersionService } from "./version.service";
import { StorageService } from "@core/services/storage.service";

@Injectable({ providedIn: 'root' })
export class AuthFacadeService {

  constructor(
    private authService: AuthService,
    private versionService: VersionService,
    private storage: StorageService,
    private alert: AlertService
  ) {}

  login(credentials: { username: string; password: string }) {

    return this.versionService.validateVersion().pipe(

      switchMap(() =>
        this.authService.login(this.buildPayload(credentials))
      ),

      tap((data: any) => {
        console.log(credentials);
        
        this.storage.set('token', data.access_token);
        this.storage.set('placa', credentials.password.toUpperCase());
        this.storage.set('conductor', credentials.username);
      }),

      catchError((err) => {

        this.alert.presentAlert(
          'Error',
          'Fallo al ingresar',
          err?.error?.data || 'Error inesperado, intente nuevamente.',
          'Cerrar'
        );

        return throwError(() => err);
      })
    );
  }

  validateSession() {
    const token = this.storage.get<string>('token');

    if (!token) return EMPTY;

    return this.authService.tokenValidate({ token });
  }

  private buildPayload(credentials: { username: string; password: string }) {
    return {
      numeroPlacaxxx: credentials.password.toUpperCase(),
      codigoTercerox: credentials.username,
      version: environment.version,
    };
  }
}