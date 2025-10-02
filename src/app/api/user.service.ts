import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs-compat/Observable";
import { catchError, retry, Subject, throwError, timeout } from 'rxjs';
import { CookieService } from "ngx-cookie-service";
import { User } from "../models/user.model";
import { MenuController } from '@ionic/angular';



@Injectable({
  providedIn: 'root'
})
export class UserService {
  documents_conductor: any = [
    {
      nombre: 'Cedula Ciudadania',
      position: 1,
      status: false,
      type: 'conductor',
      capture: 'galery',
      hidden: false,
      rotate: true,
      tag: 'cedula',
      fecha: false,
      docs: [
        {
          nombre: 'Cara frontal',
          codigo: 'cedula1'
        },
        {
          nombre: 'Cara posterior',
          codigo: 'cedula2'
        }
      ]
    },
    {
      nombre: 'Licencia Conduccion',
      position: 2,
      status: false,
      tag: 'licencia',
      type: 'conductor',
      fecha: true,
      capture: 'galery',
      hidden: false,
      rotate: true,
      fechaTag: 'fechaLicencia',
      fechaTitle: 'Vencimiento Licencia',
      docs: [
        {
          nombre: 'Cara frontal',
          codigo: 'licencia1'
        },
        {
          nombre: 'Cara posterior',
          codigo: 'licencia2'
        }
      ]
    },
    {
      nombre: 'Seguridad Social',
      position: 3,
      status: false,
      tag: 'seguridad',
      type: 'conductor',
      capture: 'galery',
      hidden: false,
      rotate: false,
      fecha: false,
      fechaTag: 'fechaSeguridad',
      docs: [
        {
          nombre: 'Cara Frontal',
          codigo: 'seguridadsocial'
        }
      ]
    },
    {
      nombre: 'Mercancias peligrosas',
      position: 3,
      status: false,
      tag: 'mercapeligrosa',
      type: 'conductor',
      capture: 'galery',
      hidden: false,
      rotate: false,
      fecha: false,
      fechaTag: false,
      docs: [
        {
          nombre: 'Cara Frontal',
          codigo: 'mercapeligrosa'
        }
      ]
    }
  ]

  documents_vehiculo: any = [
    {
      nombre: 'Tarjeta Propiedad Vehiculo',
      position: 1,
      status: false,
      type: 'vehiculo',
      capture: 'galery',
      hidden: false,
      rotate: true,
      tag: 'tarjePro',
      fecha: false,
      docs: [
        {
          nombre: 'Cara frontal',
          codigo: 'tarjePro1'
        },
        {
          nombre: 'Cara posterior',
          codigo: 'tarjePro2'
        }
      ]
    },
    {
      nombre: 'Soat',
      position: 2,
      status: false,
      type: 'vehiculo',
      capture: 'galery',
      hidden: false,
      rotate: false,
      tag: 'soat',
      fecha: true,
      fechaTag: 'fechaSoat',
      fechaTitle: 'Vencimiento Soat',
      docs: [
        {
          nombre: 'Cara frontal',
          codigo: 'soat1'
        }
      ]
    },
    {
      nombre: 'Tecnomecanica',
      position: 3,
      status: false,
      type: 'vehiculo',
      capture: 'galery',
      hidden: false,
      rotate: false,
      tag: 'tarjePro',
      fecha: true,
      fechaTag: 'fechaTecno',
      fechaTitle: 'Vencimiento Tecnomecanica',
      docs: [
        {
          nombre: 'Cara frontal',
          codigo: 'tecnomecanica'
        }
      ]
    },
    {
      nombre: 'Fotos Vehiculo',
      position: 5,
      status: false,
      type: 'vehiculo',
      capture: 'galery',
      hidden: false,
      rotate: false,
      tag: 'tarjePro',
      fecha: false,
      docs: [
        {
          nombre: 'Foto Frontal',
          codigo: 'fotovehi1'
        },
        {
          nombre: 'Foto Lateral',
          codigo: 'fotovehi2'
        },
        {
          nombre: 'Foto Motor',
          codigo: 'fotovehi3'
        },
        {
          nombre: 'Foto Posterior',
          codigo: 'fotovehi4'
        }
      ]
    },
     {
      nombre: 'Remolque',
      position: 6,
      status: false,
      type: 'vehiculo',
      capture: 'galery',
      hidden: false,
      rotate: false,
      tag: 'tarjePro',
      fecha: false,
      articulado: true,
      docs: [
        {
          nombre: 'Foto romolque',
          codigo: 'fotoremol'
        },
        {
          nombre: 'Tarjeta de propiedad remolque',
          codigo: 'tarjePror1'
        },
        {
          nombre: 'Tarjeta de propiedad remolque',
          codigo: 'tarjePror2'
        }
        
      ]
    }
  ]

  documents_remolque:any = [
    {
      nombre: 'Remolque',
      position: 6,
      status: false,
      type: 'vehiculo',
      capture: 'galery',
      hidden: false,
      rotate: false,
      tag: 'tarjePro',
      fecha: false,
      articulado: true,
      docs: [
        {
          nombre: 'Foto romolque',
          codigo: 'fotoremol'
        },
        {
          nombre: 'Tarjeta de propiedad remolque',
          codigo: 'tarjePror'
        },
        {
          nombre: 'Tarjeta de propiedad remolque',
          codigo: 'tarjePror'
        }
        
      ]
    }
  ]

  public onLoginChange = new Subject();

  constructor(
    private menu: MenuController, 
    private http: HttpClient, 
    private cookies: CookieService, 
    private router: Router) 
    { }

  login(user: User): Observable<any> {
    return this.http.post("https://api.aldialogistica.com/api/auth/login-external", user);
  }

  getPlaca() {
    const placa = localStorage.getItem("placa");
    return placa ? placa : null;
  }

  getCedula() {
    return localStorage.getItem("conductor");
  }

  getUser(): Observable<any> {

    const params = new HttpParams({
      fromString: 'placa=' + localStorage.getItem("placa") + '&digitales=true'
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'user': 'USUSEGINT',
      'password': '12249'
    });

    const requestOptions = { headers: headers, params: params };

    return this.http.get("https://api.aldialogistica.com/api/datos/vehiculos", requestOptions)
  }

  laodTokenMobile(params:any ,token:any): Promise<any>
  {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });

    const requestOptions = { headers: headers };

    return this.http.post("https://api.3slogistica.com/api/load/token", params, requestOptions)
    .pipe(
      timeout(5000),
      retry(2),
      catchError((err: any) => {
        return throwError(() => err);
      })
    )
    .toPromise()

  }

  getConductor(): Observable<any> {

    const params = new HttpParams({
      fromString: 'documento=' + localStorage.getItem("conductor")
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'user': 'USUSEGINT',
      'password': '12249'
    });
    const requestOptions = { headers: headers, params: params };

    return this.http.get("https://api.aldialogistica.com/api/datos/terceros", requestOptions)
  }


  getVehiculoByPlaca(placa: any): Observable<any> {

    const params = new HttpParams({
      fromString: 'placa=' + placa
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'user': 'USUSEGINT',
      'password': '12249'
    });

    const requestOptions = { headers: headers, params: params };

    return this.http.get("https://api.aldialogistica.com/api/datos/vehiculos", requestOptions)
  }

  getTerceroByCedula(cedula: any): Observable<any> {
    const params = new HttpParams({
      fromString: 'documento=' + cedula
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'user': 'USUSEGINT',
      'password': '12249'
    });
    const requestOptions = { headers: headers, params: params };

    return this.http.get("https://api.aldialogistica.com/api/datos/terceros", requestOptions)
  }

  getFechas(token: any): Promise<any> {
    const params = new HttpParams({
      fromString: 'cedula=' + localStorage.getItem("conductor") + '&placa=' + localStorage.getItem("placa")
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    const requestOptions = { headers: headers, params: params };

    return this.http.get("https://api.3slogistica.com/api/document/validate", requestOptions)
      .pipe(
        timeout(5000),
        retry(2),
        catchError((err: any) => {
          return throwError(() => err);
        })
      )
      .toPromise()
  }


  getTercero3sL(token: any): Promise<any> {

    const params = new HttpParams({
      fromString: 'cedula=' + localStorage.getItem("conductor") + '&placa=' + localStorage.getItem("placa")
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    const requestOptions = { headers: headers, params: params };

    return this.http.get("https://api.3slogistica.com/api/ingresos", requestOptions)
      .pipe(
        timeout(5000),
        retry(2),
        catchError((err: any) => {
          return throwError(() => err);
        })
      )
      .toPromise()
  }

  get3SLbyplaca(placa: any, token: any): Observable<any> {
    const params = new HttpParams({
      fromString: 'placa=' + placa
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    const requestOptions = { headers: headers, params: params };

    return this.http.get("https://api.3slogistica.com/api/ingresos", requestOptions)
  }

  get3SLbyCedula(cedula: any, token: any): Observable<any> {
    const params = new HttpParams({
      fromString: 'cedula=' + cedula
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    const requestOptions = { headers: headers, params: params };

    return this.http.get("https://api.3slogistica.com/api/ingresos", requestOptions)
  }

  obtenerInformacionIP(token: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    const requestOptions = { headers: headers };

    return this.http.get('https://api.3slogistica.com/api/ip', requestOptions)
  }


  registroApiAldia(params: any, token: any): Promise<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });

    const requestOptions = { headers: headers };
    // const url = 'https://api.aldialogistica.com/api/pruebas';
    const url = 'https://api.3slogistica.com/api/ingresos';

    return this.http.post(url, params, requestOptions).toPromise();
  }

  cargaDocumentos(params: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'user': 'USUSEGINT',
      'password': '12249'
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

  getFirma(e: any, tipo: any, token: any): Observable<any> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });

    const params = new HttpParams({
      fromString: 'cedula=' + e + '&contrato=' + tipo
    });

    const requestOptions = { headers: headers, params: params };
    return this.http.get('https://api.3slogistica.com/api/firma', requestOptions)
  }


  firmaContrato(tipo: any, cedula: any, placa: any, token: any): Promise<any> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
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




  nevoTurnoApi(ciudad: any, destino1: any, destino2: any, destino3: any, desacorasa: any, trailer: any): Observable<any> {
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
      'Content-Type': 'application/json; charset=utf-8',
      'user': 'USUSEGINT',
      'password': '12249'
    });

    const requestOptions = { headers: headers };

    return this.http.post("https://siat.aldialogistica.net/aldia/recursos/operacion_enturnamiento/index.php", turno, requestOptions)
  }

  getTurnoUser(): Promise<any> {

    const placa = localStorage.getItem("placa")?.toUpperCase();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'user': 'USUSEGINT',
      'password': '12249'
    });

    const params = new HttpParams({
      fromString: 'placa=' + placa
    });

    const requestOptions = { headers: headers, params: params };

    return this.http.get("https://api.aldialogistica.com/api/enturnamiento", requestOptions)
    .pipe(
      timeout(5000),
      retry(2),
      catchError((err: any) => {
        return throwError(() => err);
      })
    )
    .toPromise()

  }


  getDataApi(param: any, token: any, url: any): Promise<any> {
    const params = new HttpParams({
      fromString: param
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });

    const requestOptions = { headers: headers, params: params };
    return this.http.get("https://api.3slogistica.com/" + url, requestOptions)
    .pipe(
      timeout(5000),
      retry(2),
      catchError((err: any) => {
        return throwError(() => err);
      })
    )
    .toPromise()
  }

  setToken(token: any) {
    localStorage.setItem("token", token);
  }

  setItem(item: any, value: any) {
    localStorage.setItem(item, value);
  }

  getItem(item: any) {
    const itemm = localStorage.getItem(item);
    return itemm ? itemm : null;
  }

  getToken() {
    const token = localStorage.getItem("token");
    return token ? token : null;
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("placa");
    localStorage.removeItem("conductor");
    this.router.navigate(['/login']);
    this.menu.enable(false);
  }

  reloadComp(user: User) {
    this.onLoginChange.next(user);
  }

  getSession() {
    return this.onLoginChange.asObservable();
  }

  separarCamelCase(cadena: any): string {
    const regex = /([a-z])([A-Z])/g;
    let nuevaCadena: any = cadena.replace(regex, '$1 $2');
    nuevaCadena = nuevaCadena.toLowerCase();
    nuevaCadena = nuevaCadena.charAt(0).toLowerCase() + nuevaCadena.slice(1);
    return nuevaCadena;
  }

  buscarCodigoEnDocumentos(codigo: string) {
    for (const documento1 of this.documents_conductor) {
      if (documento1.fechaTag && documento1.fechaTag === codigo) {
        return documento1;
      } else {
        for (const docs of documento1.docs) {
          if (docs.codigo === codigo) {
            return documento1;
          }
        }
      }
    }

    for (const documento2 of this.documents_vehiculo) {
      if (documento2.fechaTag && documento2.fechaTag === codigo) {
        return documento2;
      } else {
        for (const docs of documento2.docs) {
          if (docs.codigo === codigo) {
            return documento2;
          }
        }
      }
    }


    return undefined;
  }

   loginUser(cedula: any, placa: any): Promise<any> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const requestOptions = { headers: headers };

    var json = {
      "codigoTercerox": cedula,
      "numeroPlacaxxx": placa
    }


    return this.http.post("https://api.3slogistica.com/api/auth/driver", json, requestOptions).toPromise();
  }


  getTemporalToken(cedula: any, placa: any) {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const requestOptions = { headers: headers };

    var json = {
      "user": cedula,
      "pass": placa
    }


    return this.http.post("https://api.3slogistica.com/api/auth/login", json, requestOptions)
  }

  async getFechasDocs(token: any): Promise<any> {
    let docs = []
    let statusDoc = true;
    var text: any = []
    const data = await this.getFechas(token)
    if (data.status) {
      statusDoc = true;
      docs = []
      text = []
    } else {
      statusDoc = false;

      if (data.data.vehiculo && data.data.vehiculo.length > 0) {
        for (let a = 0; a < data.data.vehiculo.length; a++) {
          const element = data.data.vehiculo[a];

          const json = {
            nombre: element.nombre,
            fecha: element.fecha
          }

          const palabra = this.separarCamelCase(element.nombre);
          text.push(palabra);
          docs.push(json);
        }
      }

      if (data.data.conductor && data.data.conductor.length > 0) {
        for (let a = 0; a < data.data.conductor.length; a++) {
          const element = data.data.conductor[a];

          const json = {
            nombre: element.nombre,
            fecha: element.fecha
          }

          const palabra = this.separarCamelCase(element.nombre);
          text.push(palabra);
          docs.push(json);
        }
      }

      if (text.length > 0) {
        // this.executeNotification(1,"IMPORTANTE","Documentos Vencidos",text.join(','), "Actualiza tus documentos para continuar");
      }
    }
    return { status: statusDoc, docs: docs }
  }

  async validateCap() {
    const cedula = this.getCedula();
    await this.getDataApi('lecturas=1&cedula=' + cedula, this.getToken(), 'api/capacitaciones').then(
      data => {
        if (data.length > 0) {
          window.location.href = "https://www.3slogistica.com/tr_panel/process/capacitaciones/?token=" + this.getToken();
        }
      }
    )
  }


  postPreoperacionalData(params: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'usuario': 'USUSEGINT',
      'clave': '12249'
    });


    const requestOptions = { headers: headers };
    const url = 'https://api.aldialogistica.com/api/tercero/preoperacional';

    return this.http.post(url, params, requestOptions)
  }


}
