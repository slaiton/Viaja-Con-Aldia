import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { BehaviorSubject, Observable, catchError, retry, throwError, timeout } from 'rxjs';
import { LoadingController, MenuController } from '@ionic/angular';
import { StorageService } from './storage.service';
import { ConductorApi } from '@domain/conductor.api';

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
    private conductorApi: ConductorApi) { }


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

  async logout(){

    const loadingData = await this.loading.create({
      message: 'Cerrando... Hasta luego!',
    });

    loadingData.present();

    const token =  this.getToken()
    const jsontoken = {
      'token' : token
    };
    this.delToken(jsontoken).subscribe(
      (data:any) => {
        loadingData.dismiss();
        this.storage.remove("token");
        this.storage.remove("placa");
        this.storage.remove("conductor");
        this.menu.enable(false);
        // this.router.navigate(['/login']);
        location.href = '/login'
      },
      err => {
        loadingData.dismiss();

        // this.router.navigateByUrl('/login');
        location.href = '/login'
        // throw err;
      }
    )
  }


}
