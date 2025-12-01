import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs-compat/Observable";
import { catchError, retry, Subject, throwError, timeout } from 'rxjs';


@Injectable({
    providedIn: 'root'
})

export class GlobalService {


    constructor(private http: HttpClient) { }


    /** -------------------------
    *  HEADERS CON TOKEN
    *  ------------------------- */
    private buildHeaders(token?: string): HttpHeaders {
        let headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        });

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
    }

    /** -------------------------
      *  GET GENÉRICO
      *  ------------------------- */
    get<T>(endpoint: string, params?: any, token?: string, extraHeaders?: any) {
        const httpParams = new HttpParams({ fromObject: params || {} });

        let headers = this.buildHeaders(token);

        if (extraHeaders) {
            Object.keys(extraHeaders).forEach(key => {
                headers = headers.set(key, extraHeaders[key]);
            });
        }

        return this.http.get<T>(`${endpoint}`, {
            headers,
            params: httpParams
        })
            .pipe(
                timeout(15000),
                catchError(this.handleError)
            )
            .toPromise();
    }

    /** -------------------------
     *  POST GENÉRICO
     *  ------------------------- */
    post<T>(endpoint: string, body: any, token?: string, extraHeaders?: any) {

        let headers = this.buildHeaders(token);

        if (extraHeaders) {
            Object.keys(extraHeaders).forEach(key => {
                headers = headers.set(key, extraHeaders[key]);
            });
        }

        return this.http.post<T>(`${endpoint}`, body, {
            headers
        })
            .pipe(
                timeout(15000),
                catchError(this.handleError)
            )
            .toPromise();
    }

    /** -------------------------
     *  MANEJO CENTRALIZADO DE ERRORES
     *  ------------------------- */
    private handleError(error: any) {
        console.error('API ERROR:', error);
        return throwError(() => error);
    }

}