import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { BehaviorSubject, Observable, catchError, firstValueFrom, of, retry, throwError, timeout } from 'rxjs';
import { LoadingController, MenuController } from '@ionic/angular';
import { StorageService } from './storage.service';
import { ConductorApi } from '@domain/conductor.api';
import { SessionStore } from '@core/session/session.store';
import { AuthConductorApi } from '@domain/auth-conductor.api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public onLoginChange = new BehaviorSubject(false);
  public onChange = this.onLoginChange.asObservable();

  constructor(
    private menu: MenuController,
    private http: HttpClient,
    private storage: StorageService,
    private router: Router,
    private loading: LoadingController,
    private conductorApi: ConductorApi,
    private sessionStore: SessionStore,
    private injector: Injector) { }

  private get authConductorApi(): AuthConductorApi {
    return this.injector.get(AuthConductorApi);
  }


  login(user: any): Observable<any> {
    return this.http.post("https://api.3slogistica.com/api/auth/driver", user);
  }

  getUser(): Observable<any>{
    const placa = (this.storage.get<string>("placa") || localStorage.getItem("placa") || '').replace(/^["']|["']$/g, '').trim();

    const params = new HttpParams({
      fromString: 'placa=' + placa
    });

    const headers = new HttpHeaders({
      'Content-Type':'application/json; charset=utf-8',
      'user':'USUSEGINT',
      'password':'12249'
    });

    const requestOptions = { headers: headers, params: params };

    return this.http.get("http://api.aldialogistica.com/api/datos/vehiculos", requestOptions)
  }

  getUser3sL(token: any): Promise<any> {
    return this.conductorApi.getEnvelope3SL(undefined, undefined, token);
  }

  setToken(token: any) {
    this.storage.set('token', token);
  }

  getToken() {
    return this.storage.get<string>("token");
  }

tokenValidate(jsonToken:any) :Observable<any> {
  return this.http.post("https://api.3slogistica.com/api/auth/token", jsonToken)
}

delToken(jsonToken:any) :Observable<any>
{
  const options = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
    body:jsonToken,
  };

  return this.http.delete("https://api.3slogistica.com/api/auth/token", options)
}

  async logout(): Promise<void> {
    const loadingData = await this.loading.create({
      message: 'Cerrando... Hasta luego!',
    });
    await loadingData.present();

    const cleanAllStorage = () => {
      this.sessionStore.clearSession();
      this.storage.remove('token');
      this.storage.remove('placa');
      this.storage.remove('conductor');
      this.storage.remove('token_3sl');
      localStorage.removeItem('token');
      localStorage.removeItem('placa');
      localStorage.removeItem('conductor');
      localStorage.removeItem('token_3sl');
      this.menu.enable(false);
    };

    const tieneSesionAldia = this.sessionStore.hasAldiaSession();

    if (tieneSesionAldia) {
      try {
        await firstValueFrom(
          this.authConductorApi.cerrarSesion().pipe(
            timeout(5000),
            catchError(() => of({ success: true }))
          )
        );
      } catch {
        // Ignorar defensivamente error en anulación remota
      } finally {
        cleanAllStorage();
        await loadingData.dismiss();
        await this.router.navigateByUrl('/login', { replaceUrl: true });
      }
      return;
    }

    // Sesión legacy 3SL
    const token = this.getToken();
    const jsontoken = {
      'token': token
    };

    this.delToken(jsontoken).pipe(
      timeout(5000),
      catchError(() => of(null))
    ).subscribe({
      next: async () => {
        cleanAllStorage();
        await loadingData.dismiss();
        await this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: async () => {
        cleanAllStorage();
        await loadingData.dismiss();
        await this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    });
  }


}
