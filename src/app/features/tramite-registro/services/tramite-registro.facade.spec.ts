import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AldiaSessionState } from '@core/models/auth-conductor.model';
import { PasoRegistro, TramiteDetalle } from '@core/models/tramite-registro.model';
import { DevicePlatformService } from '@core/platform/device-platform.service';
import { AuthService } from '@core/services/auth.service';
import { CoreLoggerService } from '@core/services/core-logger.service';
import { SessionStore } from '@core/session/session.store';
import { UiFeedbackService } from '@core/ui/ui-feedback.service';
import { TramiteRegistroApi } from '@domain/tramite-registro.api';
import { TramiteRegistroFacade } from './tramite-registro.facade';
import { CATALOGOS_VACIOS, TramiteRegistroRecursosService } from './tramite-registro-recursos.service';

describe('TramiteRegistroFacade', () => {
  let facade: TramiteRegistroFacade;
  let tramiteApiSpy: jasmine.SpyObj<TramiteRegistroApi>;
  let recursosSpy: jasmine.SpyObj<TramiteRegistroRecursosService>;
  let sessionStoreSpy: jasmine.SpyObj<SessionStore>;
  let devicePlatformSpy: jasmine.SpyObj<DevicePlatformService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let uiSpy: jasmine.SpyObj<UiFeedbackService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let loggerSpy: jasmine.SpyObj<CoreLoggerService>;
  let sessionSnapshot: AldiaSessionState;

  const baseTramite = (overrides?: Partial<TramiteDetalle>): TramiteDetalle => ({
    id: 45,
    tipo: 'REGISTRO_NUEVO',
    estado: 'BORRADOR',
    placa: 'SXT482',
    enviadoAt: null,
    revisadoAt: null,
    motivoRechazo: null,
    items: [
      { entidad: 'CONDUCTOR', accion: 'CREAR', llave: '1012345678', datos: { documento: '1012345678' } },
      { entidad: 'VEHICULO', accion: 'CREAR', llave: 'SXT482', datos: { placa: 'SXT482' } }
    ],
    archivos: [],
    eventos: [],
    ...overrides
  });

  const basePasos: PasoRegistro[] = [
    { paso: 'conductor', entidad: 'CONDUCTOR', requerido: true, conDatos: false, imagenes: 0, imagenesPermitidas: ['cedula1'] },
    { paso: 'vehiculo', entidad: 'VEHICULO', requerido: true, conDatos: false, imagenes: 0, imagenesPermitidas: ['tarjeta1'] },
    { paso: 'trailer', entidad: 'TRAILER', requerido: false, conDatos: false, imagenes: 0, imagenesPermitidas: [] }
  ];

  beforeEach(() => {
    sessionSnapshot = {
      accessToken: 'acc-1',
      refreshToken: 'ref-1',
      expiraAt: '2026-12-01T00:00:00Z',
      refreshExpiraAt: '2026-12-10T00:00:00Z',
      sesionId: 10,
      cedula: '1012345678',
      placa: 'SXT482',
      nombreConductor: null,
      estado: 'REGISTRO',
      tramiteId: 45
    };

    tramiteApiSpy = jasmine.createSpyObj<TramiteRegistroApi>('TramiteRegistroApi', [
      'iniciarRegistro',
      'verificarRegistro',
      'obtenerEstadoRegistro',
      'reabrirRegistro',
      'guardarItemTramite',
      'eliminarItemTramite',
      'subirArchivoTramite',
      'eliminarArchivoTramite',
      'enviarTramite'
    ]);
    recursosSpy = jasmine.createSpyObj<TramiteRegistroRecursosService>('TramiteRegistroRecursosService', [
      'cargarCatalogos',
      'cargarLineasPorMarca',
      'limpiarCacheCatalogos',
      'capturarFotoBase64'
    ]);
    sessionStoreSpy = jasmine.createSpyObj<SessionStore>('SessionStore', [
      'isRegistroSession',
      'promoteRegistroToActiva',
      'clearSession',
      'setAldiaRegistroSession'
    ]);
    Object.defineProperty(sessionStoreSpy, 'snapshot', {
      get: () => sessionSnapshot
    });
    devicePlatformSpy = jasmine.createSpyObj<DevicePlatformService>('DevicePlatformService', ['getDeviceMetadata']);
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['logout']);
    uiSpy = jasmine.createSpyObj<UiFeedbackService>('UiFeedbackService', ['showToast', 'showAlert', 'confirm']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    loggerSpy = jasmine.createSpyObj<CoreLoggerService>('CoreLoggerService', ['log', 'logSafeError', 'info']);

    sessionStoreSpy.isRegistroSession.and.returnValue(true);
    recursosSpy.cargarCatalogos.and.returnValue(of(CATALOGOS_VACIOS));
    recursosSpy.cargarLineasPorMarca.and.returnValue(of([]));
    uiSpy.showToast.and.resolveTo();
    uiSpy.confirm.and.resolveTo(true);
    routerSpy.navigate.and.resolveTo(true);
    devicePlatformSpy.getDeviceMetadata.and.resolveTo({
      dispositivo_id: 'dev-1',
      plataforma: 'android',
      version_app: '1.0.0',
      push_token: ''
    });

    TestBed.configureTestingModule({
      providers: [
        TramiteRegistroFacade,
        { provide: TramiteRegistroApi, useValue: tramiteApiSpy },
        { provide: TramiteRegistroRecursosService, useValue: recursosSpy },
        { provide: SessionStore, useValue: sessionStoreSpy },
        { provide: DevicePlatformService, useValue: devicePlatformSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UiFeedbackService, useValue: uiSpy },
        { provide: Router, useValue: routerSpy },
        { provide: CoreLoggerService, useValue: loggerSpy }
      ]
    });

    facade = TestBed.inject(TramiteRegistroFacade);
  });

  describe('inicializarFlujo', () => {
    it('debe dejar estado SIN_SESION si no hay sesión REGISTRO activa', async () => {
      sessionStoreSpy.isRegistroSession.and.returnValue(false);

      await facade.inicializarFlujo();

      expect(facade.snapshot.estadoRegistro).toBe('SIN_SESION');
      expect(tramiteApiSpy.obtenerEstadoRegistro).not.toHaveBeenCalled();
    });

    it('debe hidratar tramite, pasos y cargar catálogos cuando el estado es BORRADOR', async () => {
      const tramite = baseTramite();
      tramiteApiSpy.obtenerEstadoRegistro.and.returnValue(
        of({ estado: 'BORRADOR', tramite, pasos: basePasos })
      );

      await facade.inicializarFlujo();

      expect(facade.snapshot.estadoRegistro).toBe('BORRADOR');
      expect(facade.snapshot.tramite).toEqual(tramite);
      expect(facade.snapshot.pasos.length).toBe(3);
      expect(recursosSpy.cargarCatalogos).toHaveBeenCalled();
      expect(facade.snapshot.cargando).toBeFalse();
    });

    it('debe promover sesión y navegar a /home cuando el registro ya está APROBADO', async () => {
      tramiteApiSpy.obtenerEstadoRegistro.and.returnValue(
        of({ estado: 'APROBADO', placa: 'SXT482', mensaje: 'Aprobado' })
      );

      await facade.inicializarFlujo();

      expect(sessionStoreSpy.promoteRegistroToActiva).toHaveBeenCalled();
      expect(recursosSpy.limpiarCacheCatalogos).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/home'], { replaceUrl: true });
    });

    it('debe limpiar sesión ante 401 y exponer error sin quedar en cargando=true ante fallo', async () => {
      tramiteApiSpy.obtenerEstadoRegistro.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 401, error: { message: 'Token vencido' } }))
      );

      await facade.inicializarFlujo();

      expect(sessionStoreSpy.clearSession).toHaveBeenCalled();
      expect(facade.snapshot.estadoRegistro).toBe('SIN_SESION');
      expect(facade.snapshot.cargando).toBeFalse();
      expect(facade.snapshot.errorMensaje).toBe('Token vencido');
    });
  });

  describe('flujo OTP', () => {
    it('iniciarSolicitudOtp exitoso debe pasar a VERIFICACION con datos enmascarados', async () => {
      tramiteApiSpy.iniciarRegistro.and.returnValue(
        of({
          id: 5,
          celular: '******4567',
          expiraAt: '2026-11-27T12:00:00Z',
          expiraEnSegundos: 300,
          reenviarEnSegundos: 45
        })
      );

      await facade.iniciarSolicitudOtp({ cedula: '10.123.456', placa: 'sxt-482', celular: '3001234567' });

      expect(tramiteApiSpy.iniciarRegistro).toHaveBeenCalledWith({
        cedula: '10123456',
        placa: 'SXT482',
        celular: '3001234567'
      });
      expect(facade.snapshot.subpasoOtp).toBe('VERIFICACION');
      expect(facade.snapshot.celularEnmascarado).toBe('******4567');
      expect(facade.snapshot.reenviarEnSegundos).toBe(45);
    });

    it('iniciarSolicitudOtp con 409 YA_REGISTRADO y 429 ESPERA_REENVIO debe manejar confirmación y reenvío', async () => {
      uiSpy.confirm.and.resolveTo(true);
      tramiteApiSpy.iniciarRegistro.and.returnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 409,
              error: { error: 'YA_REGISTRADO', message: 'Ya registrado' }
            })
        )
      );

      await facade.iniciarSolicitudOtp({ cedula: '1012345678', placa: 'SXT482', celular: '3001234567' });
      expect(uiSpy.confirm).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });

      tramiteApiSpy.iniciarRegistro.and.returnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 429,
              error: { error: 'ESPERA_REENVIO', message: 'Espera', reenviar_en_segundos: 33 }
            })
        )
      );

      await facade.iniciarSolicitudOtp({ cedula: '1012345678', placa: 'SXT482', celular: '3001234567' });
      expect(facade.snapshot.subpasoOtp).toBe('VERIFICACION');
      expect(facade.snapshot.reenviarEnSegundos).toBe(33);
    });

    it('verificarSolicitudOtp debe guardar sesión REGISTRO y rehidratar trámite', async () => {
      tramiteApiSpy.verificarRegistro.and.returnValue(
        of({
          accessToken: 'acc-new',
          tokenType: 'Bearer',
          expiraAt: '2026-11-28T00:00:00Z',
          refreshToken: 'ref-new',
          refreshExpiraAt: '2026-12-05T00:00:00Z',
          sesionId: 88,
          estado: 'REGISTRO',
          tramiteId: 45
        })
      );
      tramiteApiSpy.obtenerEstadoRegistro.and.returnValue(
        of({ estado: 'BORRADOR', tramite: baseTramite(), pasos: basePasos })
      );

      await facade.verificarSolicitudOtp({
        cedula: '1012345678',
        placa: 'sxt482',
        celular: '3001234567',
        codigo: '123456'
      });

      expect(sessionStoreSpy.setAldiaRegistroSession).toHaveBeenCalledWith(
        jasmine.objectContaining({ accessToken: 'acc-new', tramiteId: 45, estado: 'REGISTRO' }),
        '1012345678',
        'SXT482'
      );
      expect(facade.snapshot.estadoRegistro).toBe('BORRADOR');
    });
  });

  describe('mutaciones y navegación con prerrequisitos', () => {
    it('seleccionarEtapa debe bloquear salto a vehiculo si falta CONDUCTOR y conservar errores previos', async () => {
      const tramiteSoloPrecargado = baseTramite();
      tramiteApiSpy.obtenerEstadoRegistro.and.returnValue(
        of({ estado: 'BORRADOR', tramite: tramiteSoloPrecargado, pasos: basePasos })
      );
      await facade.inicializarFlujo();

      tramiteApiSpy.enviarTramite.and.returnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 422,
              error: {
                error: 'REGISTRO_INCOMPLETO',
                message: 'Faltan datos',
                faltan: [{ paso: 'conductor', campo: 'nombre', etiqueta: 'Nombres' }]
              }
            })
        )
      );
      uiSpy.confirm.and.resolveTo(true);
      await facade.solicitarEnvioFinal();

      facade.seleccionarEtapa('vehiculo');

      expect(facade.snapshot.etapaActual).toBe('conductor');
      expect(uiSpy.showToast).toHaveBeenCalledWith('Completa y guarda los pasos previos antes de continuar.', 'warning');
      expect(facade.snapshot.errorMensaje).toBe('Faltan datos');
      expect(facade.snapshot.faltanEnviar.length).toBe(1);
    });

    it('guardarEntidad conductor debe actualizar tramite, mostrar toast y avanzar a vehiculo', async () => {
      const tramiteConConductor = baseTramite({
        items: [
          {
            entidad: 'CONDUCTOR',
            accion: 'CREAR',
            llave: '1012345678',
            datos: { documento: '1012345678', nombre: 'Carlos', apellido: 'Pérez' }
          }
        ]
      });
      tramiteApiSpy.guardarItemTramite.and.returnValue(of(tramiteConConductor));

      await facade.guardarEntidad('conductor', { nombre: 'Carlos', apellido: 'Pérez' });

      expect(facade.snapshot.tramite).toEqual(tramiteConConductor);
      expect(facade.snapshot.etapaActual).toBe('vehiculo');
      expect(uiSpy.showToast).toHaveBeenCalledWith('Datos de conductor guardados', 'success');
    });

    it('eliminarEntidadOpcional no debe llamar DELETE si la entidad no existe en el trámite', async () => {
      tramiteApiSpy.obtenerEstadoRegistro.and.returnValue(
        of({ estado: 'BORRADOR', tramite: baseTramite(), pasos: basePasos })
      );
      await facade.inicializarFlujo();

      await facade.eliminarEntidadOpcional('trailer');

      expect(tramiteApiSpy.eliminarItemTramite).not.toHaveBeenCalled();
    });

    it('avanzarADocumentosDesdeOpcionales debe avanzar con CONDUCTOR + VEHICULO completos sin opcionales', async () => {
      const tramiteCompleto = baseTramite({
        items: [
          { entidad: 'CONDUCTOR', accion: 'CREAR', llave: '1012345678', datos: { nombre: 'Carlos' } },
          { entidad: 'VEHICULO', accion: 'CREAR', llave: 'SXT482', datos: { clase_vehiculo: 'TRACTOCAMION', marca: 'KENWORTH' } }
        ]
      });
      tramiteApiSpy.obtenerEstadoRegistro.and.returnValue(
        of({ estado: 'BORRADOR', tramite: tramiteCompleto, pasos: basePasos })
      );
      await facade.inicializarFlujo();
      facade.seleccionarEtapa('opcionales');

      facade.avanzarADocumentosDesdeOpcionales();

      expect(facade.snapshot.etapaActual).toBe('documentos');
    });
  });

  describe('soportes y envío final', () => {
    it('capturarYSubirSoporte debe subir archivo si hay base64 y no hacer nada si el usuario cancela', async () => {
      recursosSpy.capturarFotoBase64.and.resolveTo(null);
      await facade.capturarYSubirSoporte('conductor', 'cedula1', 'Cédula');
      expect(tramiteApiSpy.subirArchivoTramite).not.toHaveBeenCalled();

      const tramiteConFoto = baseTramite({
        archivos: [
          { id: 1, entidad: 'CONDUCTOR', tipo: 'cedula1', mime: 'image/jpeg', tamano: 1024, subidoAt: '2026-11-27' }
        ]
      });
      recursosSpy.capturarFotoBase64.and.resolveTo('data:image/jpeg;base64,ABC');
      tramiteApiSpy.subirArchivoTramite.and.returnValue(of(tramiteConFoto));

      await facade.capturarYSubirSoporte('conductor', 'cedula1', 'Cédula');

      expect(tramiteApiSpy.subirArchivoTramite).toHaveBeenCalledWith(45, {
        entidad: 'conductor',
        tipo: 'cedula1',
        data64: 'data:image/jpeg;base64,ABC'
      });
      expect(uiSpy.showToast).toHaveBeenCalledWith('Documento cargado correctamente', 'success');
    });

    it('solicitarEliminacionSoporte solo debe ejecutar DELETE cuando confirm resuelve true', async () => {
      uiSpy.confirm.and.resolveTo(false);
      await facade.solicitarEliminacionSoporte(9);
      expect(tramiteApiSpy.eliminarArchivoTramite).not.toHaveBeenCalled();

      uiSpy.confirm.and.resolveTo(true);
      tramiteApiSpy.eliminarArchivoTramite.and.returnValue(of(baseTramite()));
      await facade.solicitarEliminacionSoporte(9);
      expect(tramiteApiSpy.eliminarArchivoTramite).toHaveBeenCalledWith(45, 9);
      expect(uiSpy.showToast).toHaveBeenCalledWith('Documento eliminado', 'success');
    });

    it('solicitarEnvioFinal debe pasar a ENVIADO con 200 y poblar faltanEnviar con 422', async () => {
      uiSpy.confirm.and.resolveTo(true);
      tramiteApiSpy.enviarTramite.and.returnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 422,
              error: {
                error: 'REGISTRO_INCOMPLETO',
                message: 'Faltan campos obligatorios',
                faltan: [{ paso: 'vehiculo', campo: 'marca', etiqueta: 'Marca' }]
              }
            })
        )
      );

      await facade.solicitarEnvioFinal();

      expect(facade.snapshot.errorMensaje).toBe('Faltan campos obligatorios');
      expect(facade.snapshot.faltanEnviar).toEqual([{ paso: 'vehiculo', campo: 'marca', etiqueta: 'Marca' }]);

      tramiteApiSpy.enviarTramite.and.returnValue(of(baseTramite({ estado: 'ENVIADO' })));

      await facade.solicitarEnvioFinal();

      expect(facade.snapshot.estadoRegistro).toBe('ENVIADO');
      expect(facade.snapshot.faltanEnviar).toEqual([]);
      expect(uiSpy.showToast).toHaveBeenCalledWith('Registro enviado a revisión por operaciones ALDÍA', 'success');
    });
  });
});
