import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs-compat/Observable";

@Injectable({
  providedIn: 'root'
})
export class RegistroService {


 constructor(private http: HttpClient) { }
 


 getClasevehiculo() : Observable<any>{

    const params = new HttpParams({
      fromString: 'estado=1'
    });

    const headers = new HttpHeaders({
      'Content-Type':'application/json; charset=utf-8'
    });

  const requestOptions = { headers: headers, params: params };

    return this.http.get("https://api.3slogistica.com/api/clasevehiculo", requestOptions)
 }

 getMarcas()  : Observable<any>{
    const params = new HttpParams({
        fromString: ''
      });
  
      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8'
      });
  
    const requestOptions = { headers: headers, params: params };
  
      return this.http.get("https://api.3slogistica.com/api/marcavehiculo", requestOptions)
 }

 getCarrocerias(clase:any)  : Observable<any>{
    const params = new HttpParams({
        fromString: 'clase='+ clase
      });
  
      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8'
      });
  
    const requestOptions = { headers: headers, params: params };
  
      return this.http.get("https://api.3slogistica.com/api/carroceriavehiculo", requestOptions)
 }

}
