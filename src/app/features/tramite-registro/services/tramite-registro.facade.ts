import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import {
  EntidadTramiteSlug,
  EntidadTramiteUpper,
  EstadoRegistroEnCursoData,
  TramiteDetalle
} from '@core/models/tramite-registro.model';
import { DevicePlatformService } from '@core/platform/device-platform.service';
import { AuthService } from '@core/services/auth.service';
import { CoreLoggerService } from '@core/services/core-logger.service';
import { SessionStore } from '@core/session/session.store';
import { UiFeedbackService } from '@core/ui/ui-feedback.service';
import { TramiteRegistroApi } from '@domain/tramite-registro.api';
import {
  EtapaRegistro,
  INITIAL_TRAMITE_STATE,
  TramiteRegistroState,
  normalizarOtpInput,
  parsearErrorTramite,
  puedeAccederAEtapa,
  recalcularPasosTramite
} from './tramite-registro-error.helper';
import { TramiteRegistroRecursosService } from './tramite-registro-recursos.service';

export { TramiteRegistroState } from './tramite-registro-error.helper';

@Injectable()
export class TramiteRegistroFacade {
  private readonly stateSubject = new BehaviorSubject<TramiteRegistroState>(INITIAL_TRAMITE_STATE);
  public readonly state$ = this.stateSubject.asObservable();
  private inicializandoEnCurso = false;
  private catalogosCargados = false;

  constructor(
    private readonly tramiteApi: TramiteRegistroApi,
    private readonly recursos: TramiteRegistroRecursosService,
    private readonly sessionStore: SessionStore,
    private readonly devicePlatform: DevicePlatformService,
    private readonly authService: AuthService,
    private readonly coreLogger: CoreLoggerService,
    private readonly ui: UiFeedbackService,
    private readonly router: Router
  ) {}

  get snapshot(): TramiteRegistroState {
    return this.stateSubject.getValue();
  }

  limpiarErrorOtp(): void {
    this.patchState({ errorMensaje: null, intentosRestantesOtp: null });
  }

  volverASolicitudOtp(): void {
    this.patchState({ subpasoOtp: 'SOLICITUD', errorMensaje: null, intentosRestantesOtp: null, reenviarEnSegundos: 0 });
  }

  seleccionarEtapa(etapa: EtapaRegistro): void {
    if (!puedeAccederAEtapa(etapa, this.snapshot.tramite)) {
      void this.ui.showToast('Completa y guarda los pasos previos antes de continuar.', 'warning');
      return;
    }
    this.patchState({ etapaActual: etapa });
  }

  avanzarADocumentosDesdeOpcionales(): void {
    if (!puedeAccederAEtapa('documentos', this.snapshot.tramite)) {
      void this.ui.showToast('Guarda primero los datos del conductor y del vehículo.', 'warning');
      return;
    }
    this.patchState({ etapaActual: 'documentos' });
  }

  async inicializarFlujo(): Promise<void> {
    if (this.inicializandoEnCurso) {
      return;
    }
    const { cedula, placa } = this.sessionStore.snapshot;
    if (!this.sessionStore.isRegistroSession()) {
      this.patchState({ ...INITIAL_TRAMITE_STATE, estadoRegistro: 'SIN_SESION', cedulaActiva: cedula, placaActiva: placa });
      return;
    }
    this.inicializandoEnCurso = true;
    this.patchState({ cargando: true, cedulaActiva: cedula, placaActiva: placa });
    try {
      const data = await firstValueFrom(this.tramiteApi.obtenerEstadoRegistro());
      if (!data) {
        this.patchState({ cargando: false, errorMensaje: 'No fue posible consultar el estado del registro.' });
        return;
      }
      if (data.estado === 'APROBADO') {
        this.sessionStore.promoteRegistroToActiva();
        this.recursos.limpiarCacheCatalogos();
        this.patchState({ cargando: false, estadoRegistro: 'APROBADO' });
        await this.router.navigate(['/home'], { replaceUrl: true });
        return;
      }
      const enCurso = data as EstadoRegistroEnCursoData;
      this.patchState({
        cargando: false,
        estadoRegistro: enCurso.estado,
        tramite: enCurso.tramite,
        pasos: enCurso.pasos || [],
        placaActiva: enCurso.tramite?.placa || placa,
        errorMensaje: null
      });
      void this.cargarCatalogosIniciales(enCurso.tramite);
    } catch (err: unknown) {
      const parsed = parsearErrorTramite(err, 'Error al consultar el estado del registro.');
      this.coreLogger.log('TramiteRegistroFacade.inicializarFlujo error', parsed);
      if (parsed.status === 401) {
        this.sessionStore.clearSession();
        this.patchState({ ...INITIAL_TRAMITE_STATE, estadoRegistro: 'SIN_SESION', errorMensaje: parsed.message });
        return;
      }
      this.patchState({ cargando: false, errorMensaje: parsed.message });
    } finally {
      this.inicializandoEnCurso = false;
    }
  }

  async iniciarSolicitudOtp(payload: { cedula: string; placa: string; celular: string }): Promise<void> {
    const { cedula, placa, celular } = normalizarOtpInput(payload);
    this.patchState({ cargando: true, errorMensaje: null, erroresCampo: {} });
    try {
      const res = await firstValueFrom(this.tramiteApi.iniciarRegistro({ cedula, placa, celular }));
      this.patchState({
        cargando: false,
        subpasoOtp: 'VERIFICACION',
        celularEnmascarado: res.celular || celular.slice(-4),
        reenviarEnSegundos: res.reenviarEnSegundos || 60,
        intentosRestantesOtp: null
      });
    } catch (err: unknown) {
      const parsed = parsearErrorTramite(err, 'No fue posible enviar el código de registro por WhatsApp.');
      this.coreLogger.log('TramiteRegistroFacade.iniciarSolicitudOtp error', parsed);
      if (parsed.code === 'YA_REGISTRADO') {
        this.patchState({ cargando: false, errorMensaje: parsed.message });
        const irLogin = await this.ui.confirm({
          header: 'Conductor Ya Registrado',
          message: parsed.message,
          confirmText: 'Ir a Iniciar Sesión',
          cancelText: 'Cerrar'
        });
        if (irLogin) {
          await this.irALogin();
        }
        return;
      }
      const irAVerif = parsed.code === 'ESPERA_REENVIO' && (parsed.reenviarEnSegundos ?? 0) > 0;
      this.patchState({
        cargando: false,
        errorMensaje: parsed.message,
        erroresCampo: parsed.erroresCampo,
        subpasoOtp: irAVerif ? 'VERIFICACION' : this.snapshot.subpasoOtp,
        reenviarEnSegundos: irAVerif ? parsed.reenviarEnSegundos ?? 0 : this.snapshot.reenviarEnSegundos
      });
    }
  }

  async verificarSolicitudOtp(payload: { cedula: string; placa: string; celular: string; codigo: string }): Promise<void> {
    const { cedula, placa, celular, codigo } = normalizarOtpInput(payload);
    this.patchState({ cargando: true, errorMensaje: null, erroresCampo: {}, intentosRestantesOtp: null });
    try {
      const meta = await this.devicePlatform.getDeviceMetadata();
      const res = await firstValueFrom(
        this.tramiteApi.verificarRegistro({
          cedula,
          placa,
          celular,
          codigo,
          dispositivoId: meta.dispositivo_id,
          plataforma: meta.plataforma,
          versionApp: meta.version_app,
          pushToken: meta.push_token
        })
      );
      this.sessionStore.setAldiaRegistroSession(res, cedula, placa);
      await this.inicializarFlujo();
    } catch (err: unknown) {
      const parsed = parsearErrorTramite(err, 'Código incorrecto o expirado.');
      this.coreLogger.log('TramiteRegistroFacade.verificarSolicitudOtp error', parsed);
      this.patchState({
        cargando: false,
        errorMensaje: parsed.message,
        erroresCampo: parsed.erroresCampo,
        intentosRestantesOtp: parsed.intentosRestantes ?? null,
        subpasoOtp: parsed.code === 'CODIGO_BLOQUEADO' ? 'SOLICITUD' : this.snapshot.subpasoOtp
      });
    }
  }

  async guardarEntidad(entidad: EntidadTramiteSlug, datos: object): Promise<void> {
    const etapa = entidad === 'conductor' ? 'vehiculo' : entidad === 'vehiculo' ? 'opcionales' : this.snapshot.etapaActual;
    await this.ejecutarMutacion(
      (id) => firstValueFrom(this.tramiteApi.guardarItemTramite(id, entidad, datos)),
      `Error al guardar los datos de ${entidad}.`,
      `Datos de ${entidad} guardados`,
      { etapaActual: etapa }
    );
  }

  async eliminarEntidadOpcional(entidad: 'trailer' | 'propietario' | 'tenedor'): Promise<void> {
    const upper = entidad.toUpperCase() as EntidadTramiteUpper;
    if (!this.snapshot.tramite?.items?.some((i) => i.entidad === upper)) {
      return;
    }
    await this.ejecutarMutacion(
      (id) => firstValueFrom(this.tramiteApi.eliminarItemTramite(id, entidad)),
      `No fue posible quitar ${entidad} del trámite.`,
      `Sección ${entidad} retirada`,
      { ignorar404: true }
    );
  }

  async cargarLineasPorMarca(marcaId: number): Promise<void> {
    this.patchState({ cargandoLineas: true });
    try {
      const lineasVehiculo = await firstValueFrom(this.recursos.cargarLineasPorMarca(marcaId));
      this.patchState({ lineasVehiculo, cargandoLineas: false });
    } catch {
      this.patchState({ lineasVehiculo: [], cargandoLineas: false });
    }
  }

  async capturarYSubirSoporte(entidad: EntidadTramiteSlug, tipo: string, etiqueta?: string): Promise<void> {
    if (this.snapshot.subiendoArchivoKey || this.snapshot.guardando) {
      return;
    }
    try {
      const data64 = await this.recursos.capturarFotoBase64(tipo, etiqueta);
      if (data64) {
        await this.subirSoporte(entidad, tipo, data64);
      }
    } catch {
      await this.ui.showToast('No fue posible acceder a la cámara o galería.', 'danger');
    }
  }

  async solicitarEliminacionSoporte(archivoId: number): Promise<void> {
    const confirmado = await this.ui.confirm({
      header: 'Eliminar soporte',
      message: '¿Deseas retirar este archivo del expediente?',
      confirmText: 'Eliminar',
      destructive: true
    });
    if (confirmado) {
      await this.ejecutarMutacion(
        (id) => firstValueFrom(this.tramiteApi.eliminarArchivoTramite(id, archivoId)),
        'No fue posible eliminar el documento.',
        'Documento eliminado'
      );
    }
  }

  async solicitarEnvioFinal(): Promise<void> {
    const confirmado = await this.ui.confirm({
      header: 'Enviar registro a revisión',
      message:
        'Al enviarlo, operaciones de ALDÍA revisará tus datos y documentos. Mientras esté en revisión no podrás editar el expediente.',
      confirmText: 'Confirmar y enviar',
      cancelText: 'Revisar más tarde'
    });
    if (confirmado) {
      await this.ejecutarMutacion(
        (id) => firstValueFrom(this.tramiteApi.enviarTramite(id)),
        'No fue posible enviar el trámite a revisión.',
        'Registro enviado a revisión por operaciones ALDÍA',
        { guardarFaltan: true }
      );
    }
  }

  async reabrirTramiteRechazado(): Promise<void> {
    this.patchState({ cargando: true, errorMensaje: null, erroresCampo: {}, faltanEnviar: [] });
    try {
      await firstValueFrom(this.tramiteApi.reabrirRegistro());
      await this.inicializarFlujo();
      await this.ui.showToast('Trámite reabierto en borrador para corrección.', 'success');
    } catch (err: unknown) {
      const parsed = parsearErrorTramite(err, 'No fue posible reabrir el trámite.');
      this.coreLogger.log('TramiteRegistroFacade.reabrirTramiteRechazado error', parsed);
      this.patchState({ cargando: false, errorMensaje: parsed.message });
    }
  }

  async notificarFormularioInvalido(mensaje: string): Promise<void> {
    await this.ui.showToast(mensaje, 'warning');
  }

  async irALogin(): Promise<void> {
    await this.router.navigate(['/login'], { replaceUrl: true });
  }

  async cerrarSesionRegistro(): Promise<void> {
    this.recursos.limpiarCacheCatalogos();
    await this.authService.logout();
  }

  private async subirSoporte(entidad: EntidadTramiteSlug, tipo: string, data64: string): Promise<void> {
    const tramiteId = this.resolveTramiteId();
    if (!tramiteId) {
      this.patchState({ errorMensaje: 'No se encontró un trámite de registro activo.' });
      return;
    }
    this.patchState({ subiendoArchivoKey: `${entidad.toUpperCase()}:${tipo}`, errorMensaje: null });
    try {
      const tramite = await firstValueFrom(this.tramiteApi.subirArchivoTramite(tramiteId, { entidad, tipo, data64 }));
      this.patchState({ subiendoArchivoKey: null, tramite, pasos: recalcularPasosTramite(tramite, this.snapshot.pasos) });
      await this.ui.showToast('Documento cargado correctamente', 'success');
    } catch (err: unknown) {
      const parsed = parsearErrorTramite(err, 'No fue posible subir la imagen.');
      this.coreLogger.log('TramiteRegistroFacade.subirSoporte error', { entidad, tipo, ...parsed });
      this.patchState({ subiendoArchivoKey: null, errorMensaje: parsed.message });
    }
  }

  private async ejecutarMutacion(
    accion: (tramiteId: number) => Promise<TramiteDetalle>,
    fallbackError: string,
    mensajeExito: string,
    opts?: { etapaActual?: EtapaRegistro; ignorar404?: boolean; guardarFaltan?: boolean }
  ): Promise<void> {
    const tramiteId = this.resolveTramiteId();
    if (!tramiteId) {
      this.patchState({ errorMensaje: 'No se encontró un trámite de registro activo.' });
      return;
    }
    this.patchState({ guardando: true, errorMensaje: null, erroresCampo: {}, faltanEnviar: [] });
    try {
      const tramite = await accion(tramiteId);
      this.patchState({
        guardando: false,
        tramite,
        pasos: recalcularPasosTramite(tramite, this.snapshot.pasos),
        estadoRegistro: tramite.estado,
        etapaActual: opts?.etapaActual ?? this.snapshot.etapaActual,
        faltanEnviar: []
      });
      await this.ui.showToast(mensajeExito, 'success');
    } catch (err: unknown) {
      const parsed = parsearErrorTramite(err, fallbackError);
      this.coreLogger.log('TramiteRegistroFacade.ejecutarMutacion error', parsed);
      const ignorar = Boolean(opts?.ignorar404 && parsed.status === 404);
      this.patchState({
        guardando: false,
        errorMensaje: ignorar ? null : parsed.message,
        erroresCampo: parsed.erroresCampo,
        faltanEnviar: opts?.guardarFaltan ? parsed.faltan : this.snapshot.faltanEnviar
      });
    }
  }

  private async cargarCatalogosIniciales(tramite: TramiteDetalle): Promise<void> {
    if (!this.catalogosCargados) {
      this.patchState({ cargandoCatalogos: true });
      try {
        const catalogos = await firstValueFrom(this.recursos.cargarCatalogos());
        this.catalogosCargados = true;
        this.patchState({ catalogos, cargandoCatalogos: false });
      } catch {
        this.patchState({ cargandoCatalogos: false });
      }
    }
    const marcaNombre = String(tramite?.items?.find((i) => i.entidad === 'VEHICULO')?.datos?.['marca'] || '');
    const encontrada = this.snapshot.catalogos.marcas.find((m) => m.nombre === marcaNombre);
    if (encontrada) {
      await this.cargarLineasPorMarca(encontrada.id);
    }
  }

  private resolveTramiteId(): number | null {
    return this.snapshot.tramite?.id ?? this.sessionStore.snapshot.tramiteId ?? null;
  }

  private patchState(partial: Partial<TramiteRegistroState>): void {
    this.stateSubject.next({ ...this.snapshot, ...partial });
  }
}
