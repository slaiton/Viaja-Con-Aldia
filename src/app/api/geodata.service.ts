import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs-compat/Observable";
import { CookieService } from "ngx-cookie-service";
import { environment } from 'src/environments/environment';





@Injectable({
  providedIn: 'root'
})
export class GeodataService {

  

  complemento:any;

  constructor(private http: HttpClient) { }


  getCityByLatLon(lat: Number,lon: Number): Observable<any> {


    this.complemento = "latlng="+lat+","+lon+"&key=" + environment.maps.apikey;


     return this.http.get("https://maps.googleapis.com/maps/api/geocode/json?" +  this.complemento)
  }

  turnoCreacion(turno: any)
  {
    const headers = new HttpHeaders({
      'Content-Type':'application/json; charset=utf-8',
      'user': 'USUSEGINT',
      'password': '12249'
    });

    const requestOptions = { headers: headers };

    // const url = "http://siat.aldialogistica.net/aldia/recursos/operacion_enturnamiento/index.php"
    const url = "https://api.aldialogistica.com/api/enturnamiento"

    return this.http.post(url, turno, requestOptions)
  }

  tokenAcceso(user: any){
    const headers = new HttpHeaders({
      'Content-Type':'application/json'
    });

  const requestOptions = { headers: headers };
    return this.http.post("http://siat.aldialogistica.com:8000/api/auth/login", user , requestOptions)
  }
  
}
