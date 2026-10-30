import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { VehiculoApi } from '@domain/vehiculo.api';
import { RegistroService } from '@core/services/registro.service';
import { PhotoService } from '@core/services/photo.service';
import { StorageService } from '@core/services/storage.service';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { VehiculoListItem, CatalogoItem } from '@core/models/vehiculo.model';

@Injectable({ providedIn: 'root' })
export class VehiculosFacade {

  constructor(
    private vehiculoApi: VehiculoApi,
    private reg: RegistroService,
    private photo: PhotoService,
    private storage: StorageService,
    private auth: AuthService,
    private user: UserService
  ) {}

  // ─── Helpers de sesión ───────────────────────────────────────────────────

  private getToken(): string {
    const t = this.storage.get<string>('token') || localStorage.getItem('token') || '';
    return String(t).replace(/^[\"']|[\"']$/g, '').trim();
  }

  private getCedula(): string {
    const c = this.storage.get<string>('conductor') || localStorage.getItem('conductor') || '';
    return String(c).replace(/^[\"']|[\"']$/g, '').trim();
  }

  private getPlacaActual(): string {
    const p = this.storage.get<string>('placa') || localStorage.getItem('placa') || '';
    return String(p).replace(/^[\"']|[\"']$/g, '').trim();
  }

  // ─── Lista de vehículos ──────────────────────────────────────────────────

  /**
   * Devuelve la lista de vehículos enriquecida con foto y estado de actividad.
   * Llama a VehiculoApi.getVehiculosConductor() (con caché Dexie offline TTL 5 min).
   */
  async getListaVehiculos(): Promise<VehiculoListItem[]> {
    const cedula     = this.getCedula();
    const placaActual = this.getPlacaActual();

    const raw = await this.vehiculoApi.getVehiculosConductor(cedula);

    const result: VehiculoListItem[] = [];

    for (const v of raw) {
      const placa: string = v.numeroPlacaxxx ?? '';

      // Foto del vehículo — consultada pero no bloqueante
      let foto: string | null = null;
      try {
        const fotoResp: any = await firstValueFrom(
          this.photo.getFotoTercero(placa, 'fotovehi1', 'vehiculo')
        );
        const url: string = fotoResp?.data?.fotovehi1 ?? '';
        if (url) {
          foto = await this.imgValidate(url) ? url : null;
        }
      } catch { /* foto queda null */ }

      result.push({
        placa,
        cedula:           v.codigoTercerox ?? '',
        esActivo:         placa === placaActual,
        enUso:            !!v.hojaVidaApp,
        foto,
        clase:            v.nombreClaseVeh ?? undefined,
        marca:            v.nombreVehmarca ?? undefined,
        modelo:           v.numeroModeloxx ?? undefined,
        cedulaVinculada:  v.codigoTercerox ?? undefined,
        celularPropietario: v.celularPropietario ?? undefined,
      });
    }

    return result;
  }

  // ─── Búsqueda de vehículo por placa ────────────────────────────────────

  /**
   * Busca los datos de un vehículo específico para el formulario de cambio/registro.
   * Devuelve null si no existe o si hay error.
   */
  async buscarVehiculoPorPlaca(placa: string): Promise<any | null> {
    try {
      return await this.vehiculoApi.getDataVehiculoPorPlaca(placa);
    } catch (err: any) {
      if (err?.status === 401) this.auth.logout();
      return null;
    }
  }

  // ─── Cambio de vehículo activo ──────────────────────────────────────────

  /**
   * Flujo completo de cambio de vehículo activo:
   * 1. Verifica si hay un código SMS pendiente (getDataCode).
   * 2. Valida que la placa no pertenezca a otro conductor.
   * 3. Llama addVehiclexDriver (3SL) + cambiarVehiculoActivo (3SL).
   * Lanza errores con mensajes descriptivos para que el componente los muestre en alertas.
   */
  async cambiarVehiculo(placa: string, cedulaVinculada: string): Promise<void> {
    const cedula = this.getCedula();
    const token  = this.getToken();

    // Verificar código SMS pendiente
    const codeResp = await this.vehiculoApi.getDataCode(cedula, placa, token);
    if (codeResp?.status) {
      throw new Error('SMS_PENDIENTE');
    }

    // Verificar que la placa no esté en uso por otro conductor
    if (cedulaVinculada && cedulaVinculada !== cedula) {
      throw new Error('PLACA_OTRO_CONDUCTOR');
    }

    // Vincular en 3SL
    await this.reg.addVehiclexDriver(token, {
      numeroPlacaxxx: placa,
      codigoTercerox: cedula
    });

    // Cambiar vehículo activo
    await this.vehiculoApi.cambiarVehiculoActivo({ placa, cedula }, token);
  }

  // ─── Eliminar vehículo ──────────────────────────────────────────────────

  async eliminarVehiculo(placa: string): Promise<void> {
    const cedula = this.getCedula();
    const token  = this.getToken();

    await firstValueFrom(
      this.reg.deleteVehicle({ numeroPlacaxxx: placa, codigoTercerox: cedula }, token)
    );
  }

  // ─── Registro de vehículo nuevo ─────────────────────────────────────────

  /**
   * Envía los datos del vehículo y su foto al backend de 3SL.
   * El cargue de documentos lo orquesta el componente via UserService (evita dependencia circular).
   */
  async registrarVehiculo(jsonApi: any, cedula: string): Promise<void> {
    const token = this.getToken();
    await this.reg.sendDataVehiculo(jsonApi);
    await this.reg.addVehiclexDriver(token, {
      numeroPlacaxxx: jsonApi.placa,
      codigoTercerox: cedula
    });
  }

  // ─── Catálogos (con caché en memoria simple) ─────────────────────────────

  /** Expone el cambio de vehículo activo para flujos SMS (approveCode en el componente). */
  async cambiarVehiculoActivo(json: { placa: string; cedula: string }): Promise<any> {
    return this.vehiculoApi.cambiarVehiculoActivo(json);
  }

  async getCatalogoClases(token?: string): Promise<CatalogoItem[]> {
    const t = token || this.getToken();
    try {
      const resp: any = await firstValueFrom(this.reg.getClasevehiculo(t));
      if (!resp?.status) return [];
      return (resp.data as any[]).map(e => ({
        id:   e.codigoVehclase,
        name: e.nombreSiatxxxx,
        tipo: e.tipoxxVehiculo
      }));
    } catch { return []; }
  }

  async getCatalogoMarcas(token?: string): Promise<CatalogoItem[]> {
    const t = token || this.getToken();
    try {
      const resp: any = await firstValueFrom(this.reg.getMarcas(t));
      if (!resp?.status) return [];
      return (resp.data as any[]).map(e => ({
        id:   e.codigoVehmarca,
        name: e.nombreVehmarca
      }));
    } catch { return []; }
  }

  async getCarrocerias(idClase: string, token?: string): Promise<CatalogoItem[]> {
    const t = token || this.getToken();
    try {
      const resp: any = await firstValueFrom(this.reg.getCarrocerias(idClase, t));
      if (!resp?.status) return [];
      return (resp.data as any[]).map(e => ({
        id:   e.codigoVehcarro,
        name: e.nombrevehcarcl
      }));
    } catch { return []; }
  }

  async getLineas(idMarca: string, token?: string): Promise<CatalogoItem[]> {
    const t = token || this.getToken();
    try {
      const resp: any = await firstValueFrom(this.reg.getLineas(idMarca, '', t));
      if (!resp?.status) return [];
      return (resp.data as any[]).map(e => ({
        id:   e.codigoVehlinea,
        name: e.nombreVehlinea
      }));
    } catch { return []; }
  }

  async getCatalogoColores(token?: string): Promise<CatalogoItem[]> {
    const t = token || this.getToken();
    try {
      const resp: any = await firstValueFrom(this.reg.getColores(t));
      if (!resp?.status) return [];
      return (resp.data as any[]).map(e => ({
        id:   e.codigoVehcolor,
        name: e.nombreVehcolor
      }));
    } catch { return []; }
  }

  async getCatalogoSatelital(token?: string): Promise<CatalogoItem[]> {
    const t = token || this.getToken();
    try {
      const resp: any = await firstValueFrom(this.reg.getSatelital(t));
      if (!resp?.status) return [];
      return (resp.data as any[]).map(e => ({
        id:   e.codigoVehgpsxx,
        name: e.nombreVehgpsxx
      }));
    } catch { return []; }
  }

  // ─── Helpers internos ───────────────────────────────────────────────────

  private imgValidate(url: string): Promise<boolean> {
    return new Promise(resolve => {
      const img = new Image();
      img.onload  = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }
}
