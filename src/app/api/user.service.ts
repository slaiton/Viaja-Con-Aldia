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
      return this.http.post("https://api.aldialogistica.com/api/auth/login-external", user);
    }

    getPlaca() {
      return localStorage.getItem("placa");
    }

    getCedula() {
      return localStorage.getItem("conductor");
    }

    getUser(): Observable<any>{

      const params = new HttpParams({
        fromString: 'placa='+localStorage.getItem("placa") + '&digitales=true'
      });

      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8',
         'user':'USUSEGINT',
        'password':'12249'
      });

    const requestOptions = { headers: headers, params: params };

      return this.http.get("https://api.aldialogistica.com/api/datos/vehiculos", requestOptions)
    }

    getConductor():Observable<any>{

      const params = new HttpParams({
        fromString: 'documento='+localStorage.getItem("conductor")
      });

      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8',
        'user':'USUSEGINT',
        'password':'12249'
      });
      const requestOptions = { headers: headers, params: params };

      return this.http.get("https://api.aldialogistica.com/api/datos/terceros", requestOptions)
    }


    getVehiculoByPlaca(placa: any):Observable<any> {

      const params = new HttpParams({
        fromString: 'placa='+placa
      });

      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8',
         'user':'USUSEGINT',
        'password':'12249'
      });

    const requestOptions = { headers: headers, params: params };

      return this.http.get("https://api.aldialogistica.com/api/datos/vehiculos", requestOptions)
    }

    getTerceroByCedula(cedula:any):Observable<any>
    {
      const params = new HttpParams({
        fromString: 'documento='+cedula
      });

      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8',
        'user':'USUSEGINT',
        'password':'12249'
      });
      const requestOptions = { headers: headers, params: params };

      return this.http.get("https://api.aldialogistica.com/api/datos/terceros", requestOptions)
    }


    getTercero3sL():Observable<any> {

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

    get3SLbyplaca(placa:any):Observable<any> {
      const params = new HttpParams({
        fromString: 'placa=' + placa
      });

      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8'
      });
      const requestOptions = { headers: headers, params: params };

      return this.http.get("https://api.3slogistica.com/api/ingresos", requestOptions)
    }

    get3SLbyCedula(cedula:any):Observable<any> {
      const params = new HttpParams({
        fromString: 'cedula=' + cedula
      });

      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8'
      });
      const requestOptions = { headers: headers, params: params };

      return this.http.get("https://api.3slogistica.com/api/ingresos", requestOptions)
    }


    registroApiAldia(params: any):Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type':'application/json'
      });

      const requestOptions = { headers: headers };
      // const url = 'https://api.aldialogistica.com/api/pruebas';
      const url = 'https://api.3slogistica.com/api/ingresos';

      return this.http.post(url, params, requestOptions)
    }

    cargaDocumentos(params: any):Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8',
        'user':'USUSEGINT',
        'password':'12249'
      });

      const requestOptions = { headers: headers };

      return this.http.post("https://api.aldialogistica.com/api/documento", params, requestOptions)
    }


    registroApi(params: any):Observable<any>{

      const headers = new HttpHeaders({
        'Content-Type':'application/json'
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
      'user':'USUSEGINT',
      'password':'12249'
     });

     const requestOptions = { headers: headers };

     return this.http.post("https://siat.aldialogistica.net/aldia/recursos/operacion_enturnamiento/index.php" , turno, requestOptions)
    }

    getTurnoUser()
    {

      const placa = localStorage.getItem("placa")?.toUpperCase();

      const headers = new HttpHeaders({
      'Content-Type':'application/json; charset=utf-8',
      'user':'USUSEGINT',
      'password':'12249'
      });

     const params = new HttpParams({
      fromString: 'placa=' + placa
     });

     const requestOptions = { headers: headers, params: params };


     return this.http.get("https://api.aldialogistica.com/api/enturnamiento" , requestOptions)

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



    postPreoperacionalData(params: any):Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8',
        'usuario':'USUSEGINT',
        'clave':'12249'
      });


      const requestOptions = { headers: headers };
      const url = 'https://siat.aldialogistica.com:8000/api/maestros/preoperacional';

      return this.http.post(url,params,requestOptions)
    }


}
