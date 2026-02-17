import { Injectable } from "@angular/core";
import { Browser } from "@capacitor/browser";
import { AlertService } from "@core/services/alert.service";
import { UserService } from "@core/services/user.service";
import { environment } from "@env/environment";
import { from, tap, throwError } from "rxjs";

@Injectable({ providedIn: 'root' })
export class VersionService {

  constructor(
    private api: UserService,
    private alert: AlertService
  ) {}

  validateVersion() {
    return from(this.api.getDataApi('', '', 'api/version/latest')).pipe(
      tap((data: any) => {

        if (data.version_number > environment.version) {

          this.alert.presentAlertButtons(
            'Actualización requerida',
            '',
            'Se requiere actualización para continuar.',
            '',
            [
              {
                text: 'Actualizar',
                handler: () => {
                  Browser.open({ url: this.getPlayStoreUrl() });
                }
              }
            ]
          );

          throw new Error('Version outdated');
        }

      })
    );
  }

  private getPlayStoreUrl(): string {
    return 'https://play.google.com/store/apps/details?id=com.viajaconaldia.id';
  }
}