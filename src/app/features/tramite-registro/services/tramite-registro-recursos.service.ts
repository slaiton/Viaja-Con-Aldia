import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { CatalogoItem } from '@core/models/tramite-registro.model';
import {
  CameraDirection,
  CameraResultType,
  CameraSource,
  PlatformCameraService
} from '@core/platform/camera-platform.service';
import { PhotoService } from '@core/services/photo.service';
import { CatalogosAppApi } from '@domain/catalogos-app.api';

export interface CatalogosRegistroSet {
  tiposDocumento: CatalogoItem[];
  ciudades: CatalogoItem[];
  bancos: CatalogoItem[];
  epsList: CatalogoItem[];
  arlList: CatalogoItem[];
  afpList: CatalogoItem[];
  clasesVehiculo: CatalogoItem[];
  marcas: CatalogoItem[];
  carrocerias: CatalogoItem[];
  aseguradoras: CatalogoItem[];
  colores: CatalogoItem[];
  proveedoresGps: CatalogoItem[];
}

export const CATALOGOS_VACIOS: CatalogosRegistroSet = {
  tiposDocumento: [],
  ciudades: [],
  bancos: [],
  epsList: [],
  arlList: [],
  afpList: [],
  clasesVehiculo: [],
  marcas: [],
  carrocerias: [],
  aseguradoras: [],
  colores: [],
  proveedoresGps: []
};

@Injectable()
export class TramiteRegistroRecursosService {
  constructor(
    private readonly catalogosApi: CatalogosAppApi,
    private readonly cameraPlatform: PlatformCameraService,
    private readonly photoService: PhotoService
  ) {}

  cargarCatalogos(): Observable<CatalogosRegistroSet> {
    return forkJoin({
      tiposDocumento: this.catalogosApi.obtenerCatalogo('tipodocumento'),
      ciudades: this.catalogosApi.obtenerCatalogo('ciudad'),
      bancos: this.catalogosApi.obtenerCatalogo('banco'),
      epsList: this.catalogosApi.obtenerCatalogo('eps'),
      arlList: this.catalogosApi.obtenerCatalogo('arl'),
      afpList: this.catalogosApi.obtenerCatalogo('afp'),
      clasesVehiculo: this.catalogosApi.obtenerCatalogo('clasevehiculo'),
      marcas: this.catalogosApi.obtenerCatalogo('marcavehiculo'),
      carrocerias: this.catalogosApi.obtenerCatalogo('carroceria'),
      aseguradoras: this.catalogosApi.obtenerCatalogo('aseguradora'),
      colores: this.catalogosApi.obtenerCatalogo('color'),
      proveedoresGps: this.catalogosApi.obtenerCatalogo('proveedorgps')
    });
  }

  cargarLineasPorMarca(marcaId: number): Observable<CatalogoItem[]> {
    return this.catalogosApi.obtenerCatalogo('claselinea', marcaId);
  }

  limpiarCacheCatalogos(): void {
    this.catalogosApi.clearCache();
  }

  async capturarFotoBase64(tipo: string, etiqueta?: string): Promise<string | null> {
    try {
      const photo = await this.cameraPlatform.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        direction: tipo === 'foto_conductor_cara' ? CameraDirection.Front : CameraDirection.Rear,
        promptLabelHeader: etiqueta || 'Adjuntar soporte',
        promptLabelPhoto: 'Elegir de galería',
        promptLabelPicture: 'Tomar con cámara',
        promptLabelCancel: 'Cancelar'
      });

      const base64Data = await this.photoService.readAsBase64(photo);
      return typeof base64Data === 'string' && base64Data.trim() !== '' ? base64Data : null;
    } catch (err: unknown) {
      if (this.esCancelacionUsuario(err)) {
        return null;
      }
      throw err;
    }
  }

  esCancelacionUsuario(err: unknown): boolean {
    const msg = (err instanceof Error ? err.message : String(err || '')).toLowerCase();
    return msg.includes('cancel') || msg.includes('no image picked') || msg.includes('dismiss');
  }
}
