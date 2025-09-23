import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs-compat/Observable";

import { CookieService } from "ngx-cookie-service";
import { environment } from 'src/environments/environment';
import { catchError, retry, Subject, throwError, timeout } from 'rxjs';

import { Geolocation } from '@capacitor/geolocation';

import { AuthService } from './auth.service';



@Injectable({
  providedIn: 'root'
})
export class GeodataService {

  complemento: any;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }


  async getCityFromCurrentLocation(token: string): Promise<string | null> {
    try {
      const resp = await Geolocation.getCurrentPosition();
      const lat = resp.coords.latitude;
      const lon = resp.coords.longitude;

      const data = await this.getCityByLatLon(lat, lon, token);

      if (data.status) {
        return data.data.ciudad_oigen_final;
      } else {
        return null;
      }
    } catch (error: any) {
      if (error.status === 401) {
        this.auth.logout();
      }
      console.error('Error getting location', error);
      throw error;
    }
  }



  async checkLocationEnabled() {
    try {
      // Solicita permisos
      const permission = await Geolocation.requestPermissions();

      if (permission.location === 'granted') {
        // Intenta obtener la ubicación
        const position = await Geolocation.getCurrentPosition();
        console.log('Ubicación:', position);
        return true; // GPS activo
      } else {
        console.warn('Permiso de ubicación denegado');
        return false;
      }
    } catch (error) {
      console.error('No se pudo obtener la ubicación. ¿Está el GPS apagado?', error);
      return false; // Probablemente GPS apagado o sin permisos
    }
  }


  getCityByLatLon(lat: Number, lon: Number, token: any): Promise<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });

    const params = new HttpParams({
      fromString: "latitud=" + lat + "&longitud=" + lon
    });

    const requestOptions = { headers: headers, params: params };

    return this.http.get("https://api.3slogistica.com/api/zonas/gps", requestOptions)
      .pipe(
        timeout(5000),
        retry(2),
        catchError((err: any) => {
          return throwError(() => err);
        })
      )
      .toPromise()
  }

  getGeoZona(nombre: any, lat: any, lon: any, token: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });

    const params = new HttpParams({
      fromString: 'nombreOrigen=' + nombre
    });

    const requestOptions = { headers: headers, params: params };
    return this.http.get('https://api.3slogistica.com/api/zonas', requestOptions)
  }


  turnoCreacion(turno: any): Promise<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'user': 'USUSEGINT',
      'password': '12249'
    });

    const requestOptions = { headers: headers };

    const url = "https://api.aldialogistica.com/api/enturnamiento"

    return this.http.post(url, turno, requestOptions)
      .pipe(
        timeout(5000),
        retry(2),
        catchError((err: any) => {
          return throwError(() => err);
        })
      )
      .toPromise()
  }

  tokenAcceso(user: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const requestOptions = { headers: headers };
    return this.http.post("http://siat.aldialogistica.com:8000/api/auth/login", user, requestOptions)
  }

}
