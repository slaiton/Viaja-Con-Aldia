import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs-compat/Observable";
import { Subject } from 'rxjs';
import { CookieService } from "ngx-cookie-service";
import { User } from "../models/user.model";
import { MenuController } from '@ionic/angular';



@Injectable({
  providedIn: 'root'
})
export class UserService {

  public onLoginChange = new Subject();

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
        'user':'jlaiton',
        'password':'Jhoan1309'
      });

    const requestOptions = { headers: headers, params: params };

      return this.http.get("http://api.aldialogistica.com/api/datos/vehiculos", requestOptions)
    }

    getConductor():Observable<any>{

      console.log(localStorage.getItem("conductor"));


      const params = new HttpParams({
        fromString: 'documento='+localStorage.getItem("conductor")
      });

      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8',
        'user':'jlaiton',
        'password':'Jhoan1309'
      });
      const requestOptions = { headers: headers, params: params };

      return this.http.get("http://api.aldialogistica.com/api/datos/terceros", requestOptions)

    }


    registroApiAldia(params: any):Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8',
        'user':'jlaiton',
        'password':'Jhoan1309'
      });

      const requestOptions = { headers: headers };
      // const url = 'http://api.aldialogistica.com/api/pruebas';
      const url = 'https://3slogistica.com/tr_panel/wsr_aldia/ingresoApp';

      return this.http.post(url, params, requestOptions)
    }

    cargaDocumentos(params: any):Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8',
        'user':'jlaiton',
        'password':'Jhoan1309'
      });

      const requestOptions = { headers: headers };

      return this.http.post("http://api.aldialogistica.com/api/documento", params, requestOptions)
    }


    registroApi(params: any):Observable<any>{

      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8',
        'emailxUsuariox':'jhoan.laiton@aldialogistica.com',
        'clavexUsuariox':'Jhoan1309'
      });

      const requestOptions = { headers: headers };

      return this.http.post("https://3slogistica.com/tr_panel/wsr_aldia/ingresoApp", params, requestOptions)
    }



    nevoTurnoApi(ciudad:any, destino1:any, destino2:any, destino3:any, desacorasa:any, trailer:any):Observable<any>
    {
      const ciudadOrigen = ciudad.normalize("NFD") // Normalizamos para obtener los códigos
      .replace(/[\u0300-\u036f|.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // Quitamos los acentos y símbolos de puntuación
      .replace(/ +/g, '-') // Reemplazamos los espacios por guiones
      .toLowerCase();


    const placa = localStorage.getItem("placa")?.toUpperCase();
    const turno = {
      "view": "enturnamiento",
      "params": {
      "placa": placa,
      "ciudad_destino1": destino1,
      "ciudad_destino2": destino2,
      "ciudad_destino3": destino3,
      "desacorasado": desacorasa,
      "ciudad_origen": ciudadOrigen,
      "estado_trailer": trailer
    }
   };

     const headers = new HttpHeaders({
      'Content-Type':'application/json; charset=utf-8',
      'user': 'WSTERCEROS',
      'password':'aldia2019'
     });

     const requestOptions = { headers: headers };

     return this.http.post("http://siat.aldialogistica.net/aldia/recursos/operacion_enturnamiento/index.php" , turno, requestOptions)
    }

    getTurnoUser()
    {

      const placa = localStorage.getItem("placa")?.toUpperCase();

      const headers = new HttpHeaders({
      'Content-Type':'application/json; charset=utf-8',
      'user': 'WSTERCEROS',
      'password':'aldia2019'
      });

     const params = new HttpParams({
      fromString: 'view=enturnamiento/' + placa
     });

     const requestOptions = { headers: headers, params: params };


     return this.http.get("http://siat.aldialogistica.net/aldia/recursos/operacion_enturnamiento/index.php" , requestOptions)

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
      localStorage.removeItem("conductor");
      this.router.navigate(['/login']);
      this.menu.enable(false);
    }

    reloadComp(user:User){
      this.onLoginChange.next(user);
    }

    getSession()
    {
      return this.onLoginChange.asObservable();
    }
}
