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
        const cleanPlaca = (credentials.password || '').trim().replace(/\s+/g, '').toUpperCase();
        const cleanCedula = (credentials.username || '').toString().trim().replace(/^["']|["']$/g, '');
        const cleanToken = (data.access_token || '').toString().trim().replace(/^["']|["']$/g, '');
        this.storage.set('token', cleanToken);
        this.storage.set('placa', cleanPlaca);
        this.storage.set('conductor', cleanCedula);
        localStorage.setItem('token', cleanToken);
        localStorage.setItem('placa', cleanPlaca);
        localStorage.setItem('conductor', cleanCedula);
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
    const cleanPlaca = (credentials.password || '').trim().replace(/\s+/g, '').toUpperCase();
    const cleanCedula = (credentials.username || '').toString().trim();
    return {
      numeroPlacaxxx: cleanPlaca,
      codigoTercerox: cleanCedula,
      version: environment.version,
    };
  }
}