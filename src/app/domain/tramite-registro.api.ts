import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG, ApiConfig } from '@core/config/api.config';
import {
  EntidadTramiteSlug,
  EstadoRegistroResponse,
  GuardarItemRequest,
  IniciarRegistroRequest,
  IniciarRegistroResponse,
  SubirArchivoRequest,
  TramiteDetalle,
  TramiteDetalleResponse,
  VerificarRegistroRequest,
  VerificarRegistroResponse
} from '@core/models/tramite-registro.model';

@Injectable({
  providedIn: 'root'
})
export class TramiteRegistroApi {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_CONFIG) private readonly apiConfig: ApiConfig
  ) {}

  private get baseUrl(): string {
    return this.apiConfig.baseUrlAldia.replace(/\/+$/, '');
  }

  iniciarRegistro(payload: IniciarRegistroRequest): Observable<IniciarRegistroResponse> {
    return this.http.post<IniciarRegistroResponse>(`${this.baseUrl}/app/registro/iniciar`, payload);
  }

  verificarRegistro(payload: VerificarRegistroRequest): Observable<VerificarRegistroResponse> {
    return this.http.post<VerificarRegistroResponse>(`${this.baseUrl}/app/registro/verificar`, payload);
  }

  obtenerEstadoRegistro(): Observable<EstadoRegistroResponse> {
    return this.http.get<EstadoRegistroResponse>(`${this.baseUrl}/app/registro`);
  }

  reabrirRegistro(): Observable<TramiteDetalleResponse> {
    return this.http.post<TramiteDetalleResponse>(`${this.baseUrl}/app/registro/reabrir`, {});
  }

  listarTramites(): Observable<{ success: boolean; data: TramiteDetalle[] }> {
    return this.http.get<{ success: boolean; data: TramiteDetalle[] }>(`${this.baseUrl}/app/tramites`);
  }

  obtenerDetalleTramite(tramiteId: number): Observable<TramiteDetalleResponse> {
    return this.http.get<TramiteDetalleResponse>(`${this.baseUrl}/app/tramites/${tramiteId}`);
  }

  guardarItemTramite<T extends object>(
    tramiteId: number,
    entidad: EntidadTramiteSlug,
    datos: T
  ): Observable<TramiteDetalleResponse> {
    const body: GuardarItemRequest<T> = { datos };
    return this.http.put<TramiteDetalleResponse>(
      `${this.baseUrl}/app/tramites/${tramiteId}/items/${entidad}`,
      body
    );
  }

  eliminarItemTramite(tramiteId: number, entidad: EntidadTramiteSlug): Observable<TramiteDetalleResponse> {
    return this.http.delete<TramiteDetalleResponse>(
      `${this.baseUrl}/app/tramites/${tramiteId}/items/${entidad}`
    );
  }

  subirArchivoTramite(tramiteId: number, payload: SubirArchivoRequest): Observable<TramiteDetalleResponse> {
    return this.http.post<TramiteDetalleResponse>(
      `${this.baseUrl}/app/tramites/${tramiteId}/archivos`,
      payload
    );
  }

  eliminarArchivoTramite(tramiteId: number, archivoId: number): Observable<TramiteDetalleResponse> {
    return this.http.delete<TramiteDetalleResponse>(
      `${this.baseUrl}/app/tramites/${tramiteId}/archivos/${archivoId}`
    );
  }

  enviarTramite(tramiteId: number): Observable<TramiteDetalleResponse> {
    return this.http.post<TramiteDetalleResponse>(`${this.baseUrl}/app/tramites/${tramiteId}/enviar`, {});
  }

  cancelarTramite(tramiteId: number): Observable<TramiteDetalleResponse> {
    return this.http.post<TramiteDetalleResponse>(`${this.baseUrl}/app/tramites/${tramiteId}/cancelar`, {});
  }
}
