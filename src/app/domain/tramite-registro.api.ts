import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_CONFIG, ApiConfig } from '@core/config/api.config';
import {
  EntidadTramiteSlug,
  EstadoRegistroData,
  IniciarRegistroRequest,
  IniciarRegistroResult,
  SubirArchivoRequest,
  TramiteDetalle,
  VerificarRegistroRequest,
  VerificarRegistroResult
} from '@core/models/tramite-registro.model';
import {
  EstadoRegistroResponseDto,
  GuardarItemRequestDto,
  IniciarRegistroResponseDto,
  ListaTramitesResponseDto,
  TramiteDetalleResponseDto,
  VerificarRegistroResponseDto
} from './tramite-registro.dto';
import { TramiteRegistroMapper } from './tramite-registro.mapper';

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

  iniciarRegistro(payload: IniciarRegistroRequest): Observable<IniciarRegistroResult> {
    return this.http
      .post<IniciarRegistroResponseDto>(
        `${this.baseUrl}/app/registro/iniciar`,
        TramiteRegistroMapper.toIniciarRegistroDto(payload)
      )
      .pipe(map((res) => TramiteRegistroMapper.mapIniciarRegistroDto(res)));
  }

  verificarRegistro(payload: VerificarRegistroRequest): Observable<VerificarRegistroResult> {
    return this.http
      .post<VerificarRegistroResponseDto>(
        `${this.baseUrl}/app/registro/verificar`,
        TramiteRegistroMapper.toVerificarRegistroDto(payload)
      )
      .pipe(map((res) => TramiteRegistroMapper.mapVerificarRegistroDto(res)));
  }

  obtenerEstadoRegistro(): Observable<EstadoRegistroData> {
    return this.http
      .get<EstadoRegistroResponseDto>(`${this.baseUrl}/app/registro`)
      .pipe(map((res) => TramiteRegistroMapper.mapEstadoRegistroDto(res)));
  }

  reabrirRegistro(): Observable<EstadoRegistroData> {
    return this.http
      .post<EstadoRegistroResponseDto>(`${this.baseUrl}/app/registro/reabrir`, {})
      .pipe(map((res) => TramiteRegistroMapper.mapEstadoRegistroDto(res)));
  }

  listarTramites(): Observable<TramiteDetalle[]> {
    return this.http
      .get<ListaTramitesResponseDto>(`${this.baseUrl}/app/tramites`)
      .pipe(map((res) => TramiteRegistroMapper.mapListaTramitesDto(res)));
  }

  obtenerDetalleTramite(tramiteId: number): Observable<TramiteDetalle> {
    return this.http
      .get<TramiteDetalleResponseDto>(`${this.baseUrl}/app/tramites/${tramiteId}`)
      .pipe(map((res) => TramiteRegistroMapper.mapTramiteDetalleDto(res)));
  }

  guardarItemTramite<T extends object>(
    tramiteId: number,
    entidad: EntidadTramiteSlug,
    datos: T
  ): Observable<TramiteDetalle> {
    const body: GuardarItemRequestDto<T> = { datos };
    return this.http
      .put<TramiteDetalleResponseDto>(`${this.baseUrl}/app/tramites/${tramiteId}/items/${entidad}`, body)
      .pipe(map((res) => TramiteRegistroMapper.mapTramiteDetalleDto(res)));
  }

  eliminarItemTramite(tramiteId: number, entidad: EntidadTramiteSlug): Observable<TramiteDetalle> {
    return this.http
      .delete<TramiteDetalleResponseDto>(`${this.baseUrl}/app/tramites/${tramiteId}/items/${entidad}`)
      .pipe(map((res) => TramiteRegistroMapper.mapTramiteDetalleDto(res)));
  }

  subirArchivoTramite(tramiteId: number, payload: SubirArchivoRequest): Observable<TramiteDetalle> {
    return this.http
      .post<TramiteDetalleResponseDto>(
        `${this.baseUrl}/app/tramites/${tramiteId}/archivos`,
        TramiteRegistroMapper.toSubirArchivoDto(payload)
      )
      .pipe(map((res) => TramiteRegistroMapper.mapTramiteDetalleDto(res)));
  }

  eliminarArchivoTramite(tramiteId: number, archivoId: number): Observable<TramiteDetalle> {
    return this.http
      .delete<TramiteDetalleResponseDto>(`${this.baseUrl}/app/tramites/${tramiteId}/archivos/${archivoId}`)
      .pipe(map((res) => TramiteRegistroMapper.mapTramiteDetalleDto(res)));
  }

  enviarTramite(tramiteId: number): Observable<TramiteDetalle> {
    return this.http
      .post<TramiteDetalleResponseDto>(`${this.baseUrl}/app/tramites/${tramiteId}/enviar`, {})
      .pipe(map((res) => TramiteRegistroMapper.mapTramiteDetalleDto(res)));
  }

  cancelarTramite(tramiteId: number): Observable<TramiteDetalle> {
    return this.http
      .post<TramiteDetalleResponseDto>(`${this.baseUrl}/app/tramites/${tramiteId}/cancelar`, {})
      .pipe(map((res) => TramiteRegistroMapper.mapTramiteDetalleDto(res)));
  }
}
