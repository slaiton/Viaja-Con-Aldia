import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs-compat/Observable";
import { BehaviorSubject, tap } from 'rxjs';
import { CookieService } from "ngx-cookie-service";
import { User } from "../models/user.model";
import { MenuController } from '@ionic/angular';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public onLoginChange = new BehaviorSubject(false);
  public onChange = this.onLoginChange.asObservable();

  constructor(private menu: MenuController, private http: HttpClient, private cookies: CookieService, private router: Router) { }


  login(user: User): Observable<any> {
    return this.http.post("http://api.aldialogistica.com/api/auth/login-external", user);
  }

  getUser(): Observable<any>{
    // console.log(localStorage.getItem("placa"));

    const params = new HttpParams({
      fromString: 'placa='+localStorage.getItem("placa")
    });

    const headers = new HttpHeaders({
      'Content-Type':'application/json; charset=utf-8',
      'user':'USUSEGINT',
      'password':'12249'
    });

  const requestOptions = { headers: headers, params: params };

    return this.http.get("http://api.aldialogistica.com/api/datos/vehiculos", requestOptions)
  }

  getUser3sL():Observable<any> {

    const params = new HttpParams({
      fromString: 'cedula='+localStorage.getItem("conductor") + '&placa=' + localStorage.getItem("placa")
    });

    const headers = new HttpHeaders({
      'Content-Type':'application/json; charset=utf-8',
      'user':'USUSEGINT',
      'password':'12249'
    });
    const requestOptions = { headers: headers, params: params };

    return this.http.get("https://api.3slogistica.com/api/ingresos", requestOptions)
  }


  setToken(token: String) {
    localStorage.setItem("token", "auth-"+ token);
  }
  getToken() {
    return localStorage.getItem("token");
  }

  logout(){
    localStorage.removeItem("token");
    localStorage.removeItem("placa");
    this.router.navigate(['/login']);
    this.menu.enable(false);
  }


}
