import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { VehiculoApi } from '@domain/vehiculo.api';
import { ConductorApi } from '@domain/conductor.api';
import { UserService } from '@core/services/user.service';
import { RegistroService } from '@core/services/registro.service';
import { StorageService } from '@core/services/storage.service';
import { ImageCompressionService, CompressResult } from '@core/services/image-compression.service';
import { AldiaDatabase } from '@core/offline/database';
import { PhotoService } from '@core/services/photo.service';

export type EstadoDocumento = 'VIGENTE' | 'POR_VENCER' | 'VENCIDO';

export interface SubDocumentoItem {
  nombre: string;
  codigo: string;
  previewUrl?: string | null;
}

export interface DocumentoUI {
  id: string;
  titulo: string;
  tipoRegistro: 'vehiculo' | 'conductor';
  fechaVigencia?: string;
  fechaFormateada?: string;
  diasRestantes?: number;
  estado: EstadoDocumento;
  tagFecha?: string;
  subdocumentos: SubDocumentoItem[];
  previewUrl?: string | null;
  tieneFoto?: boolean;
}

export interface SemaforoConteo {
  vigentes: number;
  porVencer: number;
  vencidos: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class DocumentosFacade {

  private _tieneAlertas$ = new BehaviorSubject<boolean>(false);
  public readonly tieneAlertasVencimiento$ = this._tieneAlertas$.asObservable();

  private _totalAlertas$ = new BehaviorSubject<number>(0);
  public readonly totalAlertas$ = this._totalAlertas$.asObservable();

  constructor(
    private vehiculoApi: VehiculoApi,
    private conductorApi: ConductorApi,
    private user: UserService,
    private reg: RegistroService,
    private storage: StorageService,
    private imageCompressor: ImageCompressionService,
    private photoService: PhotoService,
    private db: AldiaDatabase
  ) {}

  getCedula(): string {
    const c = this.storage.get<string>('conductor') || localStorage.getItem('conductor') || '';
    return String(c).replace(/^["']|["']$/g, '').trim();
  }

  getPlaca(): string {
    const p = this.storage.get<string>('placa') || localStorage.getItem('placa') || '';
    return String(p).replace(/^["']|["']$/g, '').trim();
  }

  getToken(): string {
    const t = this.storage.get<string>('token') || localStorage.getItem('token') || '';
    return String(t).replace(/^["']|["']$/g, '').trim();
  }

  /**
   * Obtiene la lista completa de documentos clasificados por vigencia
   * junto al conteo del semáforo.
   */
  async getDocumentosYVigencias(): Promise<{ documentos: DocumentoUI[]; semaforo: SemaforoConteo }> {
    const cedula = this.getCedula();
    const placa = this.getPlaca();
    const token = this.getToken();

    // 1. Consultar estado oficial en 3SL y datos de fechas en paralelo
    const [validacionFechas, envelope, vehiculoData] = await Promise.all([
      this.vehiculoApi.validateFechasDocumentos(cedula, placa, token),
      this.conductorApi.getEnvelope3SL(token).catch(() => null),
      this.vehiculoApi.getDataVehiculoPorPlaca(placa).catch(() => null)
    ]);

    const datosConductor: any = (envelope?.data && Array.isArray(envelope.data) && envelope.data.length)
      ? envelope.data[0]
      : {};
    const datosVehiculo: any = vehiculoData ?? {};

    const docsVencidosSet = new Set<string>();
    if (validacionFechas?.docs) {
      for (const d of validacionFechas.docs) {
        if (d.nombre) docsVencidosSet.add(d.nombre.toLowerCase().trim());
      }
    }

    // Catálogos base de conductor y vehículo
    const docsConductorBase = this.user.documents_conductor || [];
    const docsVehiculoBase = this.user.documents_vehiculo || [];

    // Recolectar códigos de fotos para consultar en lote ante la API
    const tiposConductor: string[] = [];
    for (const cat of docsConductorBase) {
      if (cat.hidden) continue;
      for (const s of (cat.docs || [])) {
        if (s.codigo) tiposConductor.push(s.codigo);
      }
    }

    const tiposVehiculo: string[] = [];
    for (const cat of docsVehiculoBase) {
      if (cat.hidden) continue;
      for (const s of (cat.docs || [])) {
        if (s.codigo) tiposVehiculo.push(s.codigo);
      }
    }

    // Consultar fotos actuales registradas en el backend en paralelo
    const [fotosCondResp, fotosVehResp] = await Promise.all([
      (tiposConductor.length && cedula)
        ? firstValueFrom(this.photoService.getFotosTercero(cedula, tiposConductor.join(','), 'conductor')).catch(() => null)
        : null,
      (tiposVehiculo.length && placa)
        ? firstValueFrom(this.photoService.getFotosTercero(placa, tiposVehiculo.join(','), 'vehiculo')).catch(() => null)
        : null
    ]);

    const mapaFotos: Record<string, string> = {};
    if (fotosCondResp?.data && typeof fotosCondResp.data === 'object') {
      for (const [k, v] of Object.entries(fotosCondResp.data)) {
        if (v && typeof v === 'string') mapaFotos[k] = v;
      }
    }
    if (fotosVehResp?.data && typeof fotosVehResp.data === 'object') {
      for (const [k, v] of Object.entries(fotosVehResp.data)) {
        if (v && typeof v === 'string') mapaFotos[k] = v;
      }
    }

    const listaDocs: DocumentoUI[] = [];

    // Catálogo base de conductor
    for (const cat of docsConductorBase) {
      if (cat.hidden) continue;

      let fechaStr: string | undefined;
      if (cat.fechaTag && datosConductor[cat.fechaTag]) {
        fechaStr = String(datosConductor[cat.fechaTag]).slice(0, 10);
      }

      const clasificacion = this.clasificarVigencia(cat.nombre, fechaStr, docsVencidosSet);
      const subdocumentos: SubDocumentoItem[] = (cat.docs || []).map((sub: any) => ({
        nombre: sub.nombre,
        codigo: sub.codigo,
        previewUrl: mapaFotos[sub.codigo] || null
      }));

      const previewUrl = subdocumentos.map(s => s.previewUrl).find(url => !!url) || null;

      listaDocs.push({
        id: cat.tag || cat.nombre,
        titulo: cat.nombre,
        tipoRegistro: 'conductor',
        fechaVigencia: fechaStr,
        fechaFormateada: this.formatearFecha(fechaStr),
        diasRestantes: clasificacion.diasRestantes,
        estado: clasificacion.estado,
        tagFecha: cat.fechaTag,
        subdocumentos,
        previewUrl,
        tieneFoto: !!previewUrl
      });
    }

    // Catálogo base de vehículo
    for (const cat of docsVehiculoBase) {
      if (cat.hidden) continue;

      let fechaStr: string | undefined;
      if (cat.fechaTag && datosVehiculo[cat.fechaTag]) {
        fechaStr = String(datosVehiculo[cat.fechaTag]).slice(0, 10);
      }

      const clasificacion = this.clasificarVigencia(cat.nombre, fechaStr, docsVencidosSet);
      const subdocumentos: SubDocumentoItem[] = (cat.docs || []).map((sub: any) => ({
        nombre: sub.nombre,
        codigo: sub.codigo,
        previewUrl: mapaFotos[sub.codigo] || null
      }));

      const previewUrl = subdocumentos.map(s => s.previewUrl).find(url => !!url) || null;

      listaDocs.push({
        id: cat.tag || cat.nombre,
        titulo: cat.nombre,
        tipoRegistro: 'vehiculo',
        fechaVigencia: fechaStr,
        fechaFormateada: this.formatearFecha(fechaStr),
        diasRestantes: clasificacion.diasRestantes,
        estado: clasificacion.estado,
        tagFecha: cat.fechaTag,
        subdocumentos,
        previewUrl,
        tieneFoto: !!previewUrl
      });
    }

    // Calcular conteos del semáforo
    let vigentes = 0;
    let porVencer = 0;
    let vencidos = 0;

    for (const doc of listaDocs) {
      if (doc.estado === 'VENCIDO') vencidos++;
      else if (doc.estado === 'POR_VENCER') porVencer++;
      else vigentes++;
    }

    const semaforo: SemaforoConteo = {
      vigentes,
      porVencer,
      vencidos,
      total: listaDocs.length
    };

    const totalAlertas = vencidos + porVencer;
    this._tieneAlertas$.next(totalAlertas > 0);
    this._totalAlertas$.next(totalAlertas);

    return { documentos: listaDocs, semaforo };
  }

  /**
   * Comprime una foto usando Canvas nativo (WebP o fallback JPEG < 100 KB).
   */
  async verificarAlertasVencimiento(): Promise<boolean> {
    try {
      const res = await this.getDocumentosYVigencias();
      return (res.semaforo.vencidos > 0 || res.semaforo.porVencer > 0);
    } catch {
      return false;
    }
  }

  async comprimirFoto(source: string): Promise<CompressResult> {
    return this.imageCompressor.compressImage(source, {
      maxDimension: 1280,
      quality: 0.75,
      preferredFormat: 'image/webp'
    });
  }

  /**
   * Sube la foto comprimida a api.aldialogistica.com y actualiza vigencia en 3SL si aplica.
   */
  async subirDocumento(
    codigoSubDoc: string,
    tipoRegistro: 'conductor' | 'vehiculo',
    dataUrlComprimido: string,
    tagFecha?: string,
    nuevaFecha?: string
  ): Promise<void> {
    const idEntidad = tipoRegistro === 'vehiculo' ? this.getPlaca() : this.getCedula();

    const payload = {
      files: [
        {
          codigo: idEntidad,
          tipo: codigoSubDoc,
          tipoRegistro,
          data64: dataUrlComprimido
        }
      ]
    };

    // 1. Subir documento optimizado a Aldia
    await firstValueFrom(this.user.cargaDocumentos(payload));

    // 2. Si se suministró fecha de vigencia, sincronizar en 3SL
    if (tagFecha && nuevaFecha) {
      if (tipoRegistro === 'vehiculo') {
        const jsonVeh: any = { placa: this.getPlaca() };
        jsonVeh[tagFecha] = nuevaFecha;
        await this.reg.sendDataVehiculo(jsonVeh).catch(() => null);
      } else {
        const jsonCond: any = {
          codigoTercerox: this.getCedula(),
          conductor: true
        };
        jsonCond[tagFecha] = nuevaFecha;
        await this.reg.sendDataTercero(jsonCond).catch(() => null);
      }
    }

    // 3. Invalidar caché Dexie para forzar refresco del semáforo
    const cacheKey = `docs_fechas_${this.getCedula()}_${this.getPlaca()}`;
    await this.db.cache_store.delete(cacheKey).catch(() => null);
  }

  // ─── Helpers de cálculo y formato ──────────────────────────────────────

  private clasificarVigencia(
    nombreDoc: string,
    fechaStr: string | undefined,
    docsVencidosSet: Set<string>
  ): { estado: EstadoDocumento; diasRestantes?: number } {
    const nombreLower = (nombreDoc || '').toLowerCase().trim();

    // Si 3SL lo marcó explícitamente en su lista de vencidos
    if (docsVencidosSet.has(nombreLower)) {
      return { estado: 'VENCIDO', diasRestantes: -1 };
    }

    // Documentos sin fecha obligatoria (Cédula, Fotos vehículo)
    if (!fechaStr) {
      return { estado: 'VIGENTE' };
    }

    const fechaDoc = new Date(fechaStr + 'T00:00:00');
    if (isNaN(fechaDoc.getTime())) {
      return { estado: 'VIGENTE' };
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const diffTime = fechaDoc.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) {
      return { estado: 'VENCIDO', diasRestantes };
    } else if (diasRestantes <= 30) {
      return { estado: 'POR_VENCER', diasRestantes };
    } else {
      return { estado: 'VIGENTE', diasRestantes };
    }
  }

  private formatearFecha(fechaStr?: string): string {
    if (!fechaStr) return 'Al día';
    const partes = fechaStr.split('-');
    if (partes.length !== 3) return fechaStr;

    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const anio = partes[0];
    const mes = meses[parseInt(partes[1], 10) - 1] || partes[1];
    const dia = partes[2];

    return `${dia} ${mes} ${anio}`;
  }
}
