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


  login(user: any): Observable<any> {
    return this.http.post("https://api.3slogistica.com/api/auth/driver", user);
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

  getUser3sL(token:any):Observable<any> {

    const params = new HttpParams({
      fromString: 'cedula='+localStorage.getItem("conductor") + '&placa=' + localStorage.getItem("placa")
    });

    const headers = new HttpHeaders({
      'Content-Type':'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    const requestOptions = { headers: headers, params: params };

    return this.http.get("https://api.3slogistica.com/api/ingresos", requestOptions)
  }

  setToken(token: any) {
    localStorage.setItem("token", token);
  }

  getToken() {
    return localStorage.getItem("token");
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

  logout(){
    
    const token =  this.getToken()
    const jsontoken = {
      'token' : token
    };
    this.delToken(jsontoken).subscribe(
      (data:any) => {
        localStorage.removeItem("token");
        localStorage.removeItem("placa");
        this.menu.enable(false);
        this.router.navigate(['/login']);
      },
      err => {
        throw err;
      }
    )
  }


}
