import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import {
  CampoFaltanteRegistro,
  EntidadTramiteSlug,
  EntidadTramiteUpper,
  ErrorTramiteBody,
  EstadoRegistroEnCursoData,
  EstadoTramite,
  IniciarRegistroData,
  PasoRegistro,
  TramiteDetalle
} from '@core/models/tramite-registro.model';
import { DevicePlatformService } from '@core/platform/device-platform.service';
import { AuthService } from '@core/services/auth.service';
import { CoreLoggerService } from '@core/services/core-logger.service';
import { SessionStore } from '@core/session/session.store';
import { CatalogosAppApi } from '@domain/catalogos-app.api';
import { TramiteRegistroApi } from '@domain/tramite-registro.api';

export interface TramiteRegistroState {
  cargando: boolean;
  guardando: boolean;
  subiendoArchivoKey: string | null;
  errorMensaje: string | null;
  erroresCampo: Record<string, string[]>;
  faltanEnviar: CampoFaltanteRegistro[];
  estadoRegistro: EstadoTramite | 'SIN_SESION';
  tramite: TramiteDetalle | null;
  pasos: PasoRegistro[];
  mensajeExito: string | null;
}

export type OtpRegistroActionResult<T = void> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: string;
      message: string;
      reenviarEnSegundos?: number;
      intentosRestantes?: number;
    };

const INITIAL_STATE: TramiteRegistroState = {
  cargando: false,
  guardando: false,
  subiendoArchivoKey: null,
  errorMensaje: null,
  erroresCampo: {},
  faltanEnviar: [],
  estadoRegistro: 'SIN_SESION',
  tramite: null,
  pasos: [],
  mensajeExito: null
};

@Injectable()
export class TramiteRegistroFacade {
  private readonly stateSubject = new BehaviorSubject<TramiteRegistroState>(INITIAL_STATE);
  public readonly state$ = this.stateSubject.asObservable();

  constructor(
    private readonly tramiteApi: TramiteRegistroApi,
    private readonly catalogosApi: CatalogosAppApi,
    private readonly sessionStore: SessionStore,
    private readonly devicePlatform: DevicePlatformService,
    private readonly authService: AuthService,
    private readonly coreLogger: CoreLoggerService,
    private readonly router: Router
  ) {}

  get snapshot(): TramiteRegistroState {
    return this.stateSubject.getValue();
  }

  limpiarMensajes(): void {
    this.patchState({ errorMensaje: null, erroresCampo: {}, faltanEnviar: [], mensajeExito: null });
  }

  avanzarADocumentosDesdeOpcionales(): void {
    this.coreLogger.info('FACADE_AVANZAR_A_DOCUMENTOS_DESDE_OPCIONALES', {
      cargandoPrevio: this.snapshot.cargando,
      guardandoPrevio: this.snapshot.guardando,
      tramiteId: this.snapshot.tramite?.id ?? null,
      itemsCount: this.snapshot.tramite?.items?.length ?? 0,
      pasosCount: this.snapshot.pasos?.length ?? 0
    });
    this.patchState({
      cargando: false,
      guardando: false,
      errorMensaje: null,
      erroresCampo: {},
      faltanEnviar: [],
      mensajeExito: null
    });
  }

  async inicializarFlujo(): Promise<void> {
    if (!this.sessionStore.isRegistroSession()) {
      this.patchState({
        ...INITIAL_STATE,
        estadoRegistro: 'SIN_SESION'
      });
      return;
    }

    this.patchState({ cargando: true, errorMensaje: null, mensajeExito: null });

    try {
      const res = await firstValueFrom(this.tramiteApi.obtenerEstadoRegistro());
      if (!res?.success || !res.data) {
        this.patchState({ cargando: false, errorMensaje: 'No fue posible consultar el estado del registro.' });
        return;
      }

      if (res.data.estado === 'APROBADO') {
        this.sessionStore.promoteRegistroToActiva();
        this.catalogosApi.clearCache();
        this.patchState({ cargando: false, estadoRegistro: 'APROBADO' });
        await this.router.navigate(['/home'], { replaceUrl: true });
        return;
      }

      const enCurso = res.data as EstadoRegistroEnCursoData;
      this.patchState({
        cargando: false,
        estadoRegistro: enCurso.estado,
        tramite: enCurso.tramite,
        pasos: enCurso.pasos || []
      });
    } catch (err: unknown) {
      const parsed = this.parseHttpError(err, 'Error al consultar el estado del registro.');
      this.coreLogger.log('TramiteRegistroFacade.inicializarFlujo error', parsed);

      if (parsed.status === 401) {
        this.sessionStore.clearSession();
        this.patchState({ ...INITIAL_STATE, estadoRegistro: 'SIN_SESION', errorMensaje: parsed.message });
        return;
      }

      this.patchState({ cargando: false, errorMensaje: parsed.message });
    }
  }

  async iniciarSolicitudOtp(
    cedula: string,
    placa: string,
    celular: string
  ): Promise<OtpRegistroActionResult<IniciarRegistroData>> {
    const cleanCedula = (cedula || '').replace(/\D/g, '').trim();
    const cleanPlaca = (placa || '').replace(/[\s\-]/g, '').toUpperCase().trim();
    const cleanCelular = (celular || '').replace(/\D/g, '').trim();

    this.patchState({ cargando: true, errorMensaje: null, erroresCampo: {}, mensajeExito: null });

    try {
      const res = await firstValueFrom(
        this.tramiteApi.iniciarRegistro({
          cedula: cleanCedula,
          placa: cleanPlaca,
          celular: cleanCelular
        })
      );
      this.patchState({ cargando: false });
      return { ok: true, data: res.data };
    } catch (err: unknown) {
      const parsed = this.parseHttpError(err, 'No fue posible enviar el código de registro por WhatsApp.');
      this.coreLogger.log('TramiteRegistroFacade.iniciarSolicitudOtp error', parsed);
      this.patchState({
        cargando: false,
        errorMensaje: parsed.message,
        erroresCampo: parsed.erroresCampo
      });
      return {
        ok: false,
        code: parsed.code,
        message: parsed.message,
        reenviarEnSegundos: parsed.reenviarEnSegundos
      };
    }
  }

  async verificarSolicitudOtp(
    cedula: string,
    placa: string,
    celular: string,
    codigo: string
  ): Promise<OtpRegistroActionResult<void>> {
    const cleanCedula = (cedula || '').replace(/\D/g, '').trim();
    const cleanPlaca = (placa || '').replace(/[\s\-]/g, '').toUpperCase().trim();
    const cleanCelular = (celular || '').replace(/\D/g, '').trim();
    const cleanCodigo = (codigo || '').replace(/\D/g, '').trim();

    this.patchState({ cargando: true, errorMensaje: null, erroresCampo: {}, mensajeExito: null });

    try {
      const meta = await this.devicePlatform.getDeviceMetadata();
      const res = await firstValueFrom(
        this.tramiteApi.verificarRegistro({
          cedula: cleanCedula,
          placa: cleanPlaca,
          celular: cleanCelular,
          codigo: cleanCodigo,
          dispositivo_id: meta.dispositivo_id,
          plataforma: meta.plataforma,
          version_app: meta.version_app,
          push_token: meta.push_token
        })
      );

      this.sessionStore.setAldiaRegistroSession(res.data, cleanCedula, cleanPlaca);
      await this.inicializarFlujo();
      return { ok: true, data: undefined };
    } catch (err: unknown) {
      const parsed = this.parseHttpError(err, 'Código incorrecto o expirado.');
      this.coreLogger.log('TramiteRegistroFacade.verificarSolicitudOtp error', parsed);
      this.patchState({
        cargando: false,
        errorMensaje: parsed.message,
        erroresCampo: parsed.erroresCampo
      });
      return {
        ok: false,
        code: parsed.code,
        message: parsed.message,
        intentosRestantes: parsed.intentosRestantes
      };
    }
  }

  async guardarEntidad(entidad: EntidadTramiteSlug, datos: object): Promise<boolean> {
    const tramiteId = this.resolveTramiteId();
    if (!tramiteId) {
      this.patchState({ errorMensaje: 'No se encontró un trámite de registro activo.' });
      return false;
    }

    this.patchState({ guardando: true, errorMensaje: null, erroresCampo: {}, mensajeExito: null });

    try {
      const res = await firstValueFrom(this.tramiteApi.guardarItemTramite(tramiteId, entidad, datos));
      if (res?.data) {
        const pasosActualizados = this.recalcularPasos(this.snapshot.pasos, res.data);
        this.patchState({
          guardando: false,
          tramite: res.data,
          pasos: pasosActualizados,
          estadoRegistro: res.data.estado,
          mensajeExito: `Datos de ${entidad} guardados correctamente.`
        });
        return true;
      }
      this.patchState({ guardando: false });
      return false;
    } catch (err: unknown) {
      const parsed = this.parseHttpError(err, `Error al guardar los datos de ${entidad}.`);
      this.coreLogger.log('TramiteRegistroFacade.guardarEntidad error', { entidad, ...parsed });
      this.patchState({
        guardando: false,
        errorMensaje: parsed.message,
        erroresCampo: parsed.erroresCampo
      });
      return false;
    }
  }

  async eliminarEntidadOpcional(entidad: 'trailer' | 'propietario' | 'tenedor'): Promise<boolean> {
    const tramiteId = this.resolveTramiteId();
    const entidadUpper = entidad.toUpperCase() as 'TRAILER' | 'PROPIETARIO' | 'TENEDOR';
    const existeEntidad = this.tieneEntidad(entidadUpper);

    this.coreLogger.info('FACADE_ELIMINAR_ENTIDAD_OPCIONAL', {
      entidad,
      tramiteId,
      existeEntidad,
      cargando: this.snapshot.cargando,
      guardando: this.snapshot.guardando
    });

    if (!tramiteId) {
      this.patchState({ cargando: false, guardando: false });
      return false;
    }

    // Si la entidad no existe en el trámite aún, no hay nada que eliminar — avanzar silenciosamente.
    if (!existeEntidad) {
      this.patchState({ cargando: false, guardando: false });
      return true;
    }

    this.patchState({ guardando: true, errorMensaje: null, erroresCampo: {}, mensajeExito: null });

    try {
      const res = await firstValueFrom(this.tramiteApi.eliminarItemTramite(tramiteId, entidad));
      if (res?.data) {
        const pasosActualizados = this.recalcularPasos(this.snapshot.pasos, res.data);
        this.patchState({
          guardando: false,
          tramite: res.data,
          pasos: pasosActualizados,
          mensajeExito: `Sección ${entidad} retirada del trámite.`
        });
        return true;
      }
      this.patchState({ guardando: false });
      return false;
    } catch (err: unknown) {
      const parsed = this.parseHttpError(err, `No fue posible quitar ${entidad} del trámite.`);
      this.coreLogger.log('TramiteRegistroFacade.eliminarEntidadOpcional error', { entidad, ...parsed });
      // 404 = la entidad ya no existe en backend → tratar como éxito silencioso.
      if (parsed.status === 404) {
        this.patchState({ guardando: false });
        return true;
      }
      this.patchState({ guardando: false, errorMensaje: parsed.message });
      return false;
    }
  }

  async reabrirTramiteRechazado(): Promise<boolean> {
    this.patchState({ cargando: true, errorMensaje: null, mensajeExito: null });

    try {
      await firstValueFrom(this.tramiteApi.reabrirRegistro());
      await this.inicializarFlujo();
      this.patchState({ mensajeExito: 'Trámite reabierto en borrador para corrección.' });
      return true;
    } catch (err: unknown) {
      const parsed = this.parseHttpError(err, 'No fue posible reabrir el trámite.');
      this.coreLogger.log('TramiteRegistroFacade.reabrirTramiteRechazado error', parsed);
      this.patchState({ cargando: false, errorMensaje: parsed.message });
      return false;
    }
  }

  async subirSoporte(entidad: EntidadTramiteSlug, tipo: string, data64: string): Promise<boolean> {
    const tramiteId = this.resolveTramiteId();
    if (!tramiteId) {
      this.patchState({ errorMensaje: 'No se encontró un trámite de registro activo.' });
      return false;
    }

    const key = `${entidad.toUpperCase()}:${tipo}`;
    this.patchState({ subiendoArchivoKey: key, errorMensaje: null, mensajeExito: null });

    try {
      const res = await firstValueFrom(
        this.tramiteApi.subirArchivoTramite(tramiteId, { entidad, tipo, data64 })
      );
      if (res?.data) {
        const pasosActualizados = this.recalcularPasos(this.snapshot.pasos, res.data);
        this.patchState({
          subiendoArchivoKey: null,
          tramite: res.data,
          pasos: pasosActualizados,
          mensajeExito: 'Documento cargado correctamente.'
        });
        return true;
      }
      this.patchState({ subiendoArchivoKey: null });
      return false;
    } catch (err: unknown) {
      const parsed = this.parseHttpError(err, 'No fue posible subir la imagen.');
      this.coreLogger.log('TramiteRegistroFacade.subirSoporte error', { entidad, tipo, ...parsed });
      this.patchState({ subiendoArchivoKey: null, errorMensaje: parsed.message });
      return false;
    }
  }

  async eliminarSoporte(archivoId: number): Promise<boolean> {
    const tramiteId = this.resolveTramiteId();
    if (!tramiteId) {
      return false;
    }

    this.patchState({ guardando: true, errorMensaje: null, mensajeExito: null });

    try {
      const res = await firstValueFrom(this.tramiteApi.eliminarArchivoTramite(tramiteId, archivoId));
      if (res?.data) {
        const pasosActualizados = this.recalcularPasos(this.snapshot.pasos, res.data);
        this.patchState({
          guardando: false,
          tramite: res.data,
          pasos: pasosActualizados,
          mensajeExito: 'Documento eliminado del expediente.'
        });
        return true;
      }
      this.patchState({ guardando: false });
      return false;
    } catch (err: unknown) {
      const parsed = this.parseHttpError(err, 'No fue posible eliminar el documento.');
      this.coreLogger.log('TramiteRegistroFacade.eliminarSoporte error', { archivoId, ...parsed });
      this.patchState({ guardando: false, errorMensaje: parsed.message });
      return false;
    }
  }

  async enviarTramiteARevision(): Promise<boolean> {
    const tramiteId = this.resolveTramiteId();
    if (!tramiteId) {
      this.patchState({ errorMensaje: 'No se encontró un trámite de registro activo.' });
      return false;
    }

    this.patchState({ guardando: true, errorMensaje: null, faltanEnviar: [], mensajeExito: null });

    try {
      const res = await firstValueFrom(this.tramiteApi.enviarTramite(tramiteId));
      if (res?.data) {
        this.patchState({
          guardando: false,
          tramite: res.data,
          estadoRegistro: res.data.estado,
          faltanEnviar: [],
          mensajeExito: 'Tu registro fue enviado a revisión por operaciones de ALDÍA.'
        });
        return true;
      }
      this.patchState({ guardando: false });
      return false;
    } catch (err: unknown) {
      const parsed = this.parseHttpError(err, 'No fue posible enviar el trámite a revisión.');
      this.coreLogger.log('TramiteRegistroFacade.enviarTramiteARevision error', parsed);
      this.patchState({
        guardando: false,
        errorMensaje: parsed.message,
        faltanEnviar: parsed.faltan
      });
      return false;
    }
  }

  async cerrarSesionRegistro(): Promise<void> {
    this.catalogosApi.clearCache();
    await this.authService.logout();
  }

  obtenerDatosEntidad<T extends Record<string, unknown>>(entidad: EntidadTramiteUpper): Partial<T> {
    const item = this.snapshot.tramite?.items?.find((i) => i.entidad === entidad);
    return (item?.datos || {}) as Partial<T>;
  }

  tieneEntidad(entidad: EntidadTramiteUpper): boolean {
    return Boolean(this.snapshot.tramite?.items?.some((i) => i.entidad === entidad));
  }

  private resolveTramiteId(): number | null {
    return this.snapshot.tramite?.id ?? this.sessionStore.snapshot.tramiteId ?? null;
  }

  private recalcularPasos(pasosActuales: PasoRegistro[], tramite: TramiteDetalle): PasoRegistro[] {
    const llavesPrecargadas = new Set(['documento', 'celular', 'placa', 'cedula_conductor', 'placa_trailer']);
    const pasos = Array.isArray(pasosActuales) ? pasosActuales : [];
    const items = Array.isArray(tramite?.items) ? tramite.items : [];
    const archivos = Array.isArray(tramite?.archivos) ? tramite.archivos : [];

    return pasos.map((paso) => {
      const item = items.find((i) => i.entidad === paso.entidad);
      const datos = item?.datos || {};
      const conDatos = Object.entries(datos).some(
        ([k, v]) => !llavesPrecargadas.has(k) && v !== null && v !== '' && v !== undefined
      );
      const imagenes = archivos.filter((a) => a.entidad === paso.entidad).length;
      return {
        ...paso,
        con_datos: conDatos,
        imagenes
      };
    });
  }

  private patchState(partial: Partial<TramiteRegistroState>): void {
    this.stateSubject.next({
      ...this.snapshot,
      ...partial
    });
  }

  private parseHttpError(
    err: unknown,
    fallbackMessage: string
  ): {
    status: number;
    code: string;
    message: string;
    reenviarEnSegundos?: number;
    intentosRestantes?: number;
    erroresCampo: Record<string, string[]>;
    faltan: CampoFaltanteRegistro[];
  } {
    const httpErr = err as HttpErrorResponse;
    const body = (httpErr?.error || {}) as ErrorTramiteBody;
    const status = httpErr?.status ?? 0;
    const code = body?.error || (status === 0 ? 'NETWORK_ERROR' : 'ERROR_API');
    const message = body?.message || fallbackMessage;
    const erroresCampo = body?.errors || {};
    const faltan = Array.isArray(body?.faltan) ? body.faltan : [];

    return {
      status,
      code,
      message,
      reenviarEnSegundos: body?.reenviar_en_segundos,
      intentosRestantes: body?.intentos_restantes,
      erroresCampo,
      faltan
    };
  }
}
