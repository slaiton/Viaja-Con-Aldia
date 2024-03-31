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
  documents_conductor:any = [
    {
      nombre: 'Cedula Ciudadania',
      position: 1,
      status: false,
      type: 'doc',
      capture: 'camera',
      hidden: false,
      tag: 'cedula',
      fecha:false,
      docs: [
        {
          nombre:'Cara frontal',
          codigo:'cedula1'
        },
        {
          nombre:'Cara posterior',
          codigo:'cedula2'
        }
      ]
    },
    {
      nombre: 'Licencia Conduccion',
      position: 2,
      status: false,
      tag: 'licencia',
      type: 'doc',
      fecha :true,
      capture: 'camera',
      hidden: false,
      fechaTag:'fechaLicencia',
      fechaTitle: 'Vencimiento Licencia',
      docs: [
        {
          nombre:'Cara frontal',
          codigo:'licencia1'
        },
        {
          nombre:'Cara posterior',
          codigo:'licencia2'
        }
      ]
    },
    {
      nombre: 'Seguridad Social',
      position: 3,
      status: false,
      tag: 'seguridad',
      type: 'doc',
      capture: 'galery',
      hidden: false,
      fecha:false,
      docs: [
        {
          nombre: 'Cara Frontal',
          codigo: 'seguridadsocial'
        }
      ]
    }
  ]

  documents_vehiculo:any = [
    {
      nombre: 'Tarjeta Propiedad Vehiculo',
      position: 1,
      status: false,
      type: 'doc',
      capture: 'camera',
      hidden: false,
      tag: 'tarjePro',
      fecha:false,
      docs: [
        {
          nombre:'Cara frontal',
          codigo:'tarjePro1'
        },
        {
          nombre:'Cara posterior',
          codigo:'tarjePro2'
        }
      ]
    },
    {
      nombre: 'Soat',
      position: 2,
      status: false,
      type: 'doc',
      capture: 'galery',
      hidden: false,
      tag: 'soat',
      fecha:true,
      fechaTag:'fechaSoat',
      fechaTitle: 'Vencimiento Soat',
      docs: [
        {
          nombre:'Cara frontal',
          codigo:'soat1'
        }
      ]
    },
    {
      nombre: 'Tecnomecanica',
      position: 3,
      status: false,
      type: 'doc',
      capture: 'galery',
      hidden: false,
      tag: 'tarjePro',
      fecha:true,
      fechaTag:'fechaTecno',
      fechaTitle: 'Vencimiento Tecnomecanica',
      docs: [
        {
          nombre:'Cara frontal',
          codigo:'tecnomecanica'
        }
      ]
    },
    {
      nombre: 'Remolque',
      position: 4,
      status: false,
      type: 'doc',
      capture: 'camera',
      hidden: false,
      tag: 'tarjePro',
      fecha:false,
      articulado:true,
      docs: [
        {
          nombre:'Foto romolque',
          codigo:'fotoremol'
        },
        {
          nombre:'Tarjeta de propiedad remolque',
          codigo:'tarjePror'
        }
      ]
    },
    {
      nombre: 'Fotos Vehiculo',
      position: 5,
      status: false,
      type: 'doc',
      capture: 'camera',
      hidden: false,
      tag: 'tarjePro',
      fecha:false,
      articulado:true,
      docs: [
        {
          nombre:'Foto Frontal',
          codigo:'fotovehi1'
        },
        {
          nombre:'Foto Lateral',
          codigo:'fotovehi2'
        },
        {
          nombre:'Foto Motor',
          codigo:'fotovehi3'
        },
        {
          nombre:'Foto Posterior',
          codigo:'fotovehi4'
        }
      ]
    }

  ]

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


    getTercero3sL(token:any):Observable<any> {

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

    get3SLbyplaca(placa:any, token:any):Observable<any> {
      const params = new HttpParams({
        fromString: 'placa=' + placa
      });

      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      });
      const requestOptions = { headers: headers, params: params };

      return this.http.get("https://api.3slogistica.com/api/ingresos", requestOptions)
    }

    get3SLbyCedula(cedula:any, token:any):Observable<any> {
      const params = new HttpParams({
        fromString: 'cedula=' + cedula
      });

      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      });
      const requestOptions = { headers: headers, params: params };

      return this.http.get("https://api.3slogistica.com/api/ingresos", requestOptions)
    }

    obtenerInformacionIP(token:any):Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      });
      const requestOptions = { headers: headers};

    return   this.http.get('https://api.3slogistica.com/api/ip', requestOptions)
    }


    registroApiAldia(params: any, token:any):Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type':'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
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


    // registroApi(params: any):Observable<any>{

    //   const headers = new HttpHeaders({
    //     'Content-Type':'application/json'
    //   });

    //   const requestOptions = { headers: headers };

    //   return this.http.post("https://3slogistica.com/tr_panel/wsr_aldia/ingresoApp", params, requestOptions)
    // }

    getFirma(e:any, tipo:any, token:any):Observable<any>
    {

      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
        });

       const params = new HttpParams({
        fromString: 'cedula=' + e + '&contrato=' + tipo
       });

       const requestOptions = { headers: headers, params: params };
      return   this.http.get('https://api.3slogistica.com/api/firma', requestOptions)
    }


    firmaContrato(tipo:any, cedula:any, placa:any, token:any):Promise<any>
    {

      const headers = new HttpHeaders({
        'Content-Type':'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      });

      const requestOptions = { headers: headers };

      var json = {
        "codigoContrato": tipo,
        "codigoTercerox": cedula,
        "numeroPlacaxxx": placa,
        "agenteUsuarioxx": "",
      }

      try {
        const response = this.http.post("https://api.3slogistica.com/api/firma", json, requestOptions).toPromise()
        return response
      } catch (error) {
        console.log(error);
        throw error;
      }


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

    setToken(token: any) {
      localStorage.setItem("token", token);
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


    getTemporalToken(cedula:any, placa:any) {

      const headers = new HttpHeaders({
        'Content-Type':'application/json',
        'Accept': 'application/json'
      });

      const requestOptions = { headers: headers };

      var json = {
        "user":cedula,
        "pass":placa
    }


      return this.http.post("https://api.3slogistica.com/api/auth/login", json, requestOptions)
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
