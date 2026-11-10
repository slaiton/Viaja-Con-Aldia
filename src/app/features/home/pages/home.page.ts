import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { CameraSource } from '@core/platform/camera-platform.service';
import { ViajeFacade } from '../viaje.facade';
import { TurnoFacade } from '../../turnos/turno.facade';
import { RegionalListItem } from '@core/models/turno.model';
import { RemesaPOD } from '@core/models/viaje.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonModal, LoadingController, ModalController, Platform } from '@ionic/angular';
import { GeodataService } from '../../../api/geodata.service';
import { AppComponent } from '../../../app.component';
import { PhotoService } from '../../../core/services/photo.service';
import { AuthService } from '@core/services/auth.service';
import {
  PlatformBrowserService,
  NotificationPlatformService,
  StatusBarPlatformService,
  Style,
  PushPermissionStatus
} from '@core/platform';
import { environment } from '@env/environment';
import { NotificationService } from '../../../api/notificaciones.service';
import { LocalNotificationService } from '../../../core/services/local-notification.service';
import { AlertService } from '../../../core/services/alert.service';
import { TurnosService } from '../../../api/turnos.service';
import { Turno } from '../../../core/models/turno.model';
import { alertCircleOutline } from 'ionicons/icons';
import { GlobalService } from '../../../api/global.service';
import { StorageService } from '@core/services/storage.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild(IonModal) modalTurno!: IonModal;
  @ViewChild(IonModal) modalTurno2!: IonModal;

  showAlerts: boolean = false;
  turnoExistente: boolean = false;
  statusDoc: boolean = true
  posicionTurno1: any;
  posicionTurno2: any;
  posicionTurno3: any;
  dataTercero: any;
  dataInCorrect: any;
  cedula: any;
  nombres: any;
  apellidos: any;
  correo: any;
  celular: any;
  direccion: any;
  fecha: any;
  ciudad: any;
  listTurnos: any = [];
  conductor: any;
  estado: any = false;
  botonInactivo: any = false;
  botonDocumentos: any = false;
  // Control Bloqueo Capacitaciones Obligatorias
  tieneCapacitacionesPendientes: boolean = false;
  verificandoCapacitaciones: boolean = false;
  cantidadCapacitaciones: number = 0;
  private initialCapCheckDone: boolean = false;
  event: any; //variable para cuenta regresiva
  marca: any;
  carroceria: any;
  clase_vehiculo: any;
  respuesta: any;
  turnoForm: any = FormGroup;
  turnoForm2: any = FormGroup;
  longitud: any;
  nombre: any;
  idModal: any;
  idTurno: any;
  destino1: any;
  destino2: any;
  destino3: any;
  placa: any;
  placaLetras: any;
  placaNum: any;
  origen: any;
  vacio: any;
  ejecutada: any;
  anulada: any;
  autorizada: any;
  observacion: any;
  fechaCreacion: any;
  fechaModifica: any;
  user: any;
  tipoRemolque: any;
  tiempoRestante: any;
  viewTurno: any;
  fotoUser: any;
  modulos: any;
  clase_estado: any;
  token: any;
  docs: any = []
  estadoBoton: any;
  permissionAttempts: any = 0;
  permissionStatus: any;
  loadingData: any;
  isSubmitting: any = false;

  get f() {
    return this.turnoForm.controls;
  }

  get nombreCorto(): string {
    if (!this.nombres) return 'Conductor';
    return this.nombres.trim().split(' ')[0];
  }

  get inicialesConductor(): string {
    if (!this.nombres) return 'CP';
    const n = (this.nombres || '').trim().split(' ')[0] || '';
    const a = (this.apellidos || '').trim().split(' ')[0] || '';
    const ini1 = n ? n.charAt(0) : 'C';
    const ini2 = a ? a.charAt(0) : 'P';
    return (ini1 + ini2).toUpperCase();
  }

  get fotoConductor(): string | null {
    return this.fotoUser || null;
  }

  get ubicacionActual(): string {
    return this.nombre || this.origen || this.ciudad || 'Colombia';
  }

  alertIcon: any = alertCircleOutline;
  secretsAldia: any = {}

  public readonly viajeActivo$ = this.viajeFacade.viajeActivo$;
  public readonly estadoOperativo$ = this.viajeFacade.estadoOperativo$;
  public readonly modalQROpen$ = this.viajeFacade.modalQROpen$;
  public readonly modalPODOpen$ = this.viajeFacade.modalPODOpen$;
  public readonly remesaSeleccionada$ = this.viajeFacade.remesaSeleccionada$;
  public readonly fotoPOD$ = this.viajeFacade.fotoPOD$;
  public readonly isUploadingPOD$ = this.viajeFacade.isUploading$;
  public readonly isOnline$ = this.viajeFacade.isOnline$;

  // Observables TurnoFacade (Mockup v4 - Pantalla 5 y 6)
  public readonly modalEnturnamientoOpen$ = this.turnoFacade.modalEnturnamientoOpen$;
  public readonly modalSelectorDestinosOpen$ = this.turnoFacade.modalSelectorDestinosOpen$;
  public readonly origenGps$ = this.turnoFacade.origenGps$;
  public readonly isLoadingGps$ = this.turnoFacade.isLoadingGps$;
  public readonly errorGps$ = this.turnoFacade.errorGps$;
  public readonly destinos$ = this.turnoFacade.destinos$;
  public readonly viajaVacio$ = this.turnoFacade.viajaVacio$;
  public readonly tipoRemolque$ = this.turnoFacade.tipoRemolque$;
  public readonly esArticulado$ = this.turnoFacade.esArticulado$;
  public readonly slotsDestinos$ = this.turnoFacade.slotsDestinos$;
  public readonly regionalesCalculadas$ = this.turnoFacade.regionalesCalculadas$;
  public readonly filtroBusqueda$ = this.turnoFacade.filtroBusqueda$;
  public readonly canSubmit$ = this.turnoFacade.canSubmit$;
  public readonly puedeGuardarDestinos$ = this.turnoFacade.puedeGuardarDestinos$;
  public readonly isSubmitting$ = this.turnoFacade.isSubmitting$;

  preoperacional: any = {}


  articulos = [
    {
      titulo: 'Es requerido el preoperacional, Click para continuar',
      descripcion: 'Para continuar con el viaje debe realizar el preoperacional',
      fecha: new Date(),
      hora: '',
      imagen: 'assets/img/userDefault.png',
      aprobado: '',
      placa: ''
    }
  ];


  constructor(
    public userService: UserService,
    public globalService: GlobalService,
    public auth: AuthService,
    private router: Router,
    private storage: StorageService,
    private photo: PhotoService,
    private formBuilder: FormBuilder,
    private geodata: GeodataService,
    private alert: AlertService,
    public turno: TurnosService,
    private loading: LoadingController,
    private platform: Platform,
    private localNoti: LocalNotificationService,
    private alertController: AlertController,
    public viajeFacade: ViajeFacade,
    public turnoFacade: TurnoFacade,
    private actionSheetCtrl: ActionSheetController,
    private readonly browserPlatform: PlatformBrowserService,
    private readonly notificationPlatform: NotificationPlatformService,
    private readonly statusBarPlatform: StatusBarPlatformService
  ) {
    this.secretsAldia = {
      'X-Client-Id': environment.aldia.client_id,
      'X-Client-Secret': environment.aldia.client_secret
    }

    this.turnoForm = this.formBuilder.group({
      origen: [this.ciudad, [Validators.required]],
      destino1: ['', [Validators.required]],
      destino2: ['', [Validators.required]],
      destino3: ['', [Validators.required]],
      remolque: [''],
      vehiculovac: [false, [Validators.required]],
      nuevo: [false, [Validators.required]],
    });

    this.token = this.storage.get('token');
    this.permissionStatus = this.storage.get('permissionNotify');
    this.placa = this.storage.get('placa');
    this.placaLetras = this.placa.substr(0, 3);
    this.placaNum = this.placa.substr(3, 5);
  }


  async ionViewWillEnter(): Promise<void> {
    if (!this.initialCapCheckDone) {
      this.initialCapCheckDone = true;
      return;
    }
    const token = this.token || this.userService.getToken();
    if (token) {
      await this.verificarCapacitaciones();
    }
  }

  async ngOnInit() {    
    this.fotoUser = this.storage.get<string>('fotoUser') || null;
    this.initializeApp()

    if (!this.token || this.userService.getToken() == null) {
      this.auth.logout();
      this.router.navigate(['/login']);
    }

    this.loadingData = await this.loading.create({
      message: 'Generando perfil.....',
    });

    this.estadoBoton = 'Cargando....'

    this.loadingData.present();

    try {

      if (this.permissionStatus !== 'granted') {
        this.initPushNotifications()
      }

      const [fechas, data3SL] = await Promise.all([
        this.userService.getFechasDocs(this.token),
        this.userService.getTercero3sL(this.token)
      ]);

      if (fechas) {
        this.docs = fechas.docs;
        this.statusDoc = fechas.status;
      }

      await this.processData3SL(data3SL);
      try {
        const viaje = await this.viajeFacade.cargarViaje(this.placa);
        if (!viaje || viaje.estado !== 'EN_VIAJE_RNDC') {
          this.viajeFacade.desactivarViaje();
        }
      } catch {
        this.viajeFacade.desactivarViaje();
      }

      await this.verificarCapacitaciones();
      this.initialCapCheckDone = true;

      this.loadingData.dismiss();

      setTimeout(async () => {
        // this.showAlerts = true;
        await this.getPreoperacional();
      }, 400);

    } catch (err: any) {

      this.loadingData.dismiss();


      if (err.status == 401) {
        // this.loadingData.dismiss()
        // this.auth.logout()
      } else {

        this.estadoBoton = 'Error al cargar.. Deslice para recargar..'

        this.alert.presentAlertRedirect(
          'Error',
          'Fallo al cargar',
          err.message || 'Ha ocurrido un error inesperado.',
          'Reintentar',
          '/home'
        );
      }
    } finally {
      this.loadingData.dismiss();
    }

  } // ngOninit



  async getPreoperacional() {

    try {
      const response: any = await this.globalService.get(
        environment.aldia.uri + 'tercero/preoperacional/ultimo?vehiculo=' + this.placa,
        {},
        undefined,
        this.secretsAldia
      );

      if (response.data) {
        this.showAlerts = true
      }


      this.preoperacional = response.data.data


      if (response.data.requerido == 'SI') {
        this.router.navigateByUrl('/preform');
      }

    } catch (error: any) {
      console.log(error);
    }

  }


  async verArticulo(articulo: any) {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: articulo.titulo,
      buttons: [
        {
          text: 'Cerrar',
          handler: () => {
            // 🔹 Redirige al cerrar
            this.router.navigateByUrl('/preform');
          },
        },
      ],
    });

    await alert.present();
  }


  goToPreform() {
    this.router.navigate(['/preform']);
  }


  async processData3SL(data: any) {
    if (!data || !data['data'] || data['data'].length === 0) {
      throw new Error('No se encontraron datos.');
    }

    const datos = data['data'][0];

    this.cedula = datos.codigoTercerox;
    this.nombres = datos.nombreTercerox;
    this.apellidos = (datos.apell1Tercerox || '') + ' ' + (datos.apell2Tercerox || '');
    this.correo = datos.emailxTercerox;
    this.celular = datos.movilxTercerox;
    this.direccion = datos.direccTercerox;
    this.fecha = datos.fechaxNacimien;
    this.ciudad = datos.ciudadCreacion;

    this.getDocument(this.cedula, 'fotoperfil', 'conductor').then(
      (doc: any) => {
        if (doc && doc['code'] !== '204' && doc.data && doc.data.fotoperfil) {
          this.fotoUser = doc.data.fotoperfil;
          this.storage.set('fotoUser', doc.data.fotoperfil);
        }
      }
    );

    const estadoVeh = (datos.numeroEstadoxx || '').toUpperCase();
    this.botonInactivo = estadoVeh !== 'ACTIVO';

    if (this.botonInactivo) {
      this.estado = false;
      this.turnoExistente = false;
      this.estadoBoton = 'Inactivo';
      this.clase_estado = 'color-red';
    } else if (this.statusDoc) {
      this.estado = true;
      this.getTurnoTecero();
    } else {
      this.estado = false;
      this.turnoExistente = false;
      this.estadoBoton = 'Documentos Vencidos';
      this.botonDocumentos = true;
      // Redirección forzosa eliminada: el conductor permanece en /home con advertencia visual
    }
  }

  async getData3SL() {
    const data = await this.userService.getTercero3sL(this.token);
    await this.processData3SL(data);
  }

  async validateFechas() {
    await this.userService.getFechasDocs(this.token).then(
      (fechas: any) => {
        this.docs = fechas.docs
        this.statusDoc = fechas.status
      }
    )
    //   .catch((error: any) => {

    //     if (error.status == 401) {
    //       this.loadingData.dismiss()
    //       this.auth.logout()
    //     }

    //     this.presentAlert(
    //       'Error',
    //       'Fallo al cargar',
    //       error.error.data,
    //       'Cerrar'
    //     );
    //   }
    // );

  }

  async initPushNotifications() {
    try {
      // Verificar permisos
      const permissionStatus: PushPermissionStatus = await this.notificationPlatform.checkPushPermissions();

      if (permissionStatus.receive !== 'granted') {
        const requestPermission = await this.notificationPlatform.requestPushPermissions();
        if (requestPermission.receive !== 'granted') {
          console.warn('Permisos de notificaciones no concedidos');
          return;
        }
      }

      // Registrar notificaciones
      await this.notificationPlatform.registerPush();

      this.notificationPlatform.addPushListener('registration', async (token) => {
        // console.log('Token FCM obtenido:', token.value);
        const json = { email: this.cedula, token_mobile: token.value }
        await this.userService.laodTokenMobile(json, this.token);
      });

      this.notificationPlatform.addPushListener('registrationError', (error) => {
        console.error('Error al registrar FCM:', error);
      });

      // Listener para recibir notificaciones
      this.notificationPlatform.addPushListener('pushNotificationReceived', (notification) => {
        console.log('Notificación recibida en foreground:', notification);
      });

      this.notificationPlatform.addPushListener('pushNotificationActionPerformed', (action) => {
        console.log('Acción realizada con la notificación:', action);
      });

    } catch (error) {
      console.error('Error en la configuración de notificaciones push:', error);
    }
  }


  async permissionsAlerts(permissionAttempts: any) {
    const permissions = await this.notificationPlatform.checkLocalPermissions();

    if (permissions.display !== 'granted') {
      if (permissionAttempts < 2) {
        const newPermissions = await this.notificationPlatform.requestLocalPermissions();
        console.log('requestPermissions result:', newPermissions);

        if (newPermissions.display === 'denied') {
          permissionAttempts++;
          await this.alert.presentAlert('Alerta', 'Para continuar', 'Debe aceptar permisos de notificaciones', 'Cerrar');
          await this.permissionsAlerts(permissionAttempts); // Volver a intentar
        }

        else {
          // await this.getFCMToken();
        }


      } else {

        const buttons = [
          {
            text: 'Aceptar Permisos',
            handler: async () => {
              this.userService.setItem('permissionNotify', 'granted')
            }
          },
          {
            text: 'Continuar sin Notificaciones',
            role: 'cancel',
            handler: () => {
              this.userService.setItem('permissionNotify', 'granted')
            }
          }
        ]

        this.alert.presentAlertButtons('Permisos de Notificación', '', 'Has rechazado los permisos varias veces. ¿Deseas continuar sin recibir notificaciones?', '', buttons);

      }
    } else {
      // await this.getFCMToken();
    }
  }


  initializeApp() {
    this.platform.ready().then(() => {
      console.log('ready');
      // this.setStatusBarColor();
    });
  }

  setStatusBarColor() {
    if (this.platform.is('android')) {
      this.statusBarPlatform.setBackgroundColor({ color: '#3c8ccd' });
    } else if (this.platform.is('ios')) {
      this.statusBarPlatform.setStyle({ style: Style.Dark });
    }
  }

  async executeNotification(id: any, title: any, body: any) {

    await this.notificationPlatform.scheduleLocal({
      notifications: [
        {
          id: id,
          title: title,
          body: body,
          largeBody: 'Soat y tecnomecanica',
          summaryText: 'Entra aqui para actualizarlos'
        }
      ]
    });

  }

  async onSubmit() {

    console.log(this.turnoForm.value);

    if (this.turnoForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    try {

      const ciudad = this.turnoForm.value.origen
        .normalize('NFD')
        .replace(/[\u0300-\u036f|.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .replace(/ +/g, '-')
        .toLowerCase();

      const placa = (this.storage.get<string>('placa') || '').toUpperCase();

      const turno: Turno = {
        placa: placa,
        ciudad_origen: ciudad,
        ciudad_destino1: this.turnoForm.value.destino1,
        ciudad_destino2: this.turnoForm.value.destino2,
        ciudad_destino3: this.turnoForm.value.destino3,
        desacorasado: this.turnoForm.value.vehiculovac,
        estado_trailer: this.turnoForm.value.remolque,
        nuevo: this.turnoForm.value.nuevo,
      };

      await this.turno.createTurno(turno)

      this.isSubmitting = false;
      this.turnoForm.reset();
      this.loadingData.dismiss();
      this.modalTurno.dismiss();
      // this.ngOnInit();

    } catch (err: any) {

      this.isSubmitting = false;

      // Si es error 401, cerrar sesión
      if (err.status === 401) {
        this.loadingData.dismiss();
        this.auth.logout();
        return;
      }

      this.alert.presentAlert(
        'Error',
        'Fallo al cargar',
        err.error.data,
        'Cerrar'
      );

    }
  }

  async getTurnoTecero() {

    const data: any = await this.userService.getTurnoUser()

    if (data['code'] == '200') {
      this.clase_estado = 'color-green';
      this.listTurnos = data;
      // console.log(this.listTurnos);
      this.turnoExistente = true;
      this.estadoBoton = 'Reenturnarse';
      this.idModal = 'open-modal2';
      this.destino1 = this.listTurnos.data.destino1;
      this.destino1 = this.listTurnos.data.destino1;
      this.destino2 = this.listTurnos.data.destino2;
      this.destino3 = this.listTurnos.data.destino3;
      this.origen = this.listTurnos.data.origen_nombre;
      this.posicionTurno1 = this.listTurnos.data.posicionDestino1;
      this.posicionTurno2 = this.listTurnos.data.posicionDestino2;
      this.posicionTurno3 = this.listTurnos.data.posicionDestino3;
    }

    if (data['code'] == '204') {
      this.turnoExistente = false;
      this.estadoBoton = 'Enturnase';
      this.clase_estado = 'color-red';
      this.alert.presentAlert(
        'Sin turnos',
        '',
        'Puedes agregar un turno en opcion',
        'Continuar'
      );
      this.idModal = 'open-modal';
    }

  }
  irAMisVehiculos(): void {
    this.router.navigate(['/vehiculos']);
  }

  async abrirEnturnamiento() {
    if (this.tieneCapacitacionesPendientes) {
      await this.mostrarAlertaCapacitacionesPendientes();
      return;
    }
    if (this.botonInactivo) {
      await this.mostrarAlertaVehiculoInactivo();
      return;
    }
    if (!this.statusDoc) {
      await this.mostrarAlertaDocsPendientes();
      return;
    }
    await this.turnoFacade.iniciarEnturnamiento(this.origen);
  }

  async nuevoTurno() {
    if (this.tieneCapacitacionesPendientes) {
      await this.mostrarAlertaCapacitacionesPendientes();
      return;
    }
    if (this.botonInactivo) {
      await this.mostrarAlertaVehiculoInactivo();
      return;
    }
    if (!this.statusDoc) {
      await this.mostrarAlertaDocsPendientes();
      return;
    }
    await this.turnoFacade.iniciarEnturnamiento(this.origen);
  }

  async verificarCapacitaciones(): Promise<boolean> {
    try {
      const data = await this.userService.validateCap();
      if (data && data.length > 0) {
        this.tieneCapacitacionesPendientes = true;
        this.cantidadCapacitaciones = data.length;
        return false;
      }
      this.tieneCapacitacionesPendientes = false;
      this.cantidadCapacitaciones = 0;
      return true;
    } catch {
      this.tieneCapacitacionesPendientes = false;
      return true;
    }
  }

  async abrirPlataformaCapacitacion(): Promise<void> {
    await this.browserPlatform.abrirCapacitaciones();
  }

  async revalidarCapacitaciones(): Promise<void> {
    if (this.verificandoCapacitaciones) return;
    this.verificandoCapacitaciones = true;

    try {
      const ok = await this.verificarCapacitaciones();
      if (ok) {
        const alert = await this.alertController.create({
          header: '¡Capacitaciones al Día!',
          message: 'Se ha verificado tu cumplimiento normativo con éxito. Ya puedes operar en el sistema.',
          buttons: ['Continuar']
        });
        await alert.present();
      } else {
        const alert = await this.alertController.create({
          header: 'Capacitaciones Pendientes',
          message: `Aún registras ${this.cantidadCapacitaciones} módulo(s) pendiente(s). Por favor completa todas las lecturas requeridas en la plataforma formativa.`,
          buttons: ['Entendido']
        });
        await alert.present();
      }
    } finally {
      this.verificandoCapacitaciones = false;
    }
  }

  async cerrarSesionCapacitacion(): Promise<void> {
    this.tieneCapacitacionesPendientes = false;
    await this.auth.logout();
    this.router.navigate(['/login']);
  }

  async mostrarAlertaCapacitacionesPendientes() {
    const alert = await this.alertController.create({
      header: 'Capacitación Pendiente',
      subHeader: 'Cumplimiento normativo requerido',
      message: `Tienes ${this.cantidadCapacitaciones || ''} capacitación(es) obligatoria(s) pendiente(s). Debes completarlas para realizar operaciones en la cabina.`,
      buttons: ['Entendido']
    });
    await alert.present();
  }

  async mostrarAlertaVehiculoInactivo() {
    const alert = await this.alertController.create({
      header: 'Vehículo Inactivo',
      subHeader: 'Operación no permitida',
      message: `Tu vehículo (${this.placa}) se encuentra inactivo en el sistema. Comunícate con el área de Tráfico para habilitarlo.`,
      buttons: ['Entendido']
    });
    await alert.present();
  }

  async mostrarAlertaDocsPendientes() {
    const alert = await this.alertController.create({
      header: 'Documentos Pendientes',
      subHeader: 'Atención requerida en 3SL',
      message: 'Tienes documentos pendientes o vencidos en 3SL. Para poder solicitar turno, debes tener tus documentos al día. ¿Deseas actualizarlos ahora?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Ir a Documentos',
          role: 'confirm',
          handler: () => {
            this.router.navigate(['/datos']);
          }
        }
      ]
    });
    await alert.present();
  }

  // Acciones TurnoFacade (Mockup v4 - Pantalla 5 & 6)
  cerrarEnturnamiento() {
    this.turnoFacade.cerrarEnturnamiento();
  }

  refrescarGps() {
    this.turnoFacade.detectarUbicacionGps();
  }

  abrirSelectorDestinos() {
    this.turnoFacade.abrirSelectorDestinos();
  }

  cerrarSelectorDestinos() {
    this.turnoFacade.cerrarSelectorDestinos();
  }

  onToggleDestino(reg: RegionalListItem) {
    if (!reg.bloqueada) {
      this.turnoFacade.toggleDestino(reg.nombre);
    }
  }

  removerDestinoPorIndice(index: number) {
    this.turnoFacade.removerDestinoPorIndice(index);
  }

  guardarDestinos() {
    this.turnoFacade.guardarDestinos();
  }

  limpiarDestinos() {
    this.turnoFacade.limpiarDestinos();
  }

  setViajaVacio(val: 'SI' | 'NO') {
    this.turnoFacade.setViajaVacio(val);
  }

  setTipoRemolque(val: 'CONTENEDOR' | 'PLANCHA') {
    this.turnoFacade.setTipoRemolque(val);
  }

  onFiltroInput(event: any) {
    this.turnoFacade.setFiltro(event?.target?.value || '');
  }

  limpiarFiltro() {
    this.turnoFacade.setFiltro('');
  }

  async confirmarTurno() {
    const res = await this.turnoFacade.confirmarTurno();
    if (res.success) {
      await this.getTurnoTecero();
    }
  }

  async _legacyNuevoTurno() {

    this.modalTurno?.present();

    await this.getLocation()

  }

  async getTurno() {

    const data: any = await this.userService.getTurnoUser();
    this.listTurnos = data;

    this.modalTurno?.present();

    this.loadForm(data);

    await this.getLocation();

  }


  redirect(page: any) {
    this.router.navigate(['/' + page]);
  }

  async getLocation() {
    try {
      const ciudad = await this.geodata.getCityFromCurrentLocation(this.token);
      this.nombre = ciudad

      const buttons = [
        {
          text: 'Nuevo turno',
          handler: async () => {
            this.turnoForm.patchValue({
              nuevo: true
            })
            console.log(this.turnoForm.value);

          }
        },
        {
          text: 'Cancelar',
          handler: async () => {
            this.modalTurno.dismiss();
          }
        }
      ]


      if (this.origen && (this.origen != this.nombre)) {
        this.alert.presentAlertButtons("Novedad GPS", "", "Tiene un turno activo para " + this.origen + " y su ubicacion actual es " + this.nombre, '', buttons)
      }

      const origenLabel = document.getElementById('origenLabel') as HTMLInputElement | null;

      if (ciudad) {
        this.nombre = ciudad;
        origenLabel!.innerHTML =
          "<ion-icon name='location'> </ion-icon> <strong>" +
          ciudad +
          '</strong>';
      } else {
        origenLabel!.innerHTML =
          "<ion-icon name='location'> </ion-icon> <strong> Sin Ubicacion </strong>";
      }
    } catch (error: any) {
      this.alert.presentAlertRedirect(
        'Error',
        'GPS Desactivado',
        error.message,
        'Reintentar',
        '/home'
      );
    }
  }


  validateDocs() {
    if (!this.statusDoc) {
      console.log(this.docs);
      this.router.navigate(['/datos'])
    }
  }

  async getZona(nombre: any) {

    try {
      const data = await this.geodata.getGeoZona(nombre, '', '', this.token).toPromise()
      return data

    } catch (error) {
      throw error
    }

  }

  async getDocument(codigo: any, tipo: any, tipoRegistro: any): Promise<any> {
    try {
      const resp: any = await this.photo.getFotoTercero(codigo, tipo, tipoRegistro).toPromise()
      return resp
    } catch (error) {
      throw error
    }
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }


  abrirQRDITRA(): void {
    this.viajeFacade.abrirQRDITRA();
  }

  cerrarQRDITRA(): void {
    this.viajeFacade.cerrarQRDITRA();
  }

  abrirCapturaPOD(remesa: RemesaPOD): void {
    this.viajeFacade.abrirCapturaPOD(remesa);
  }

  cerrarCapturaPOD(): void {
    this.viajeFacade.cerrarCapturaPOD();
  }

  async seleccionarFuentePOD(): Promise<void> {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Captura de Cumplido (POD)',
      subHeader: 'Selecciona el origen de la fotografía',
      buttons: [
        {
          text: 'Tomar Foto de Remesa (Cámara)',
          icon: 'camera-outline',
          handler: () => {
            this.viajeFacade.capturarFotoPOD(CameraSource.Camera);
          }
        },
        {
          text: 'Seleccionar de Galería',
          icon: 'image-outline',
          handler: () => {
            this.viajeFacade.capturarFotoPOD(CameraSource.Photos);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          icon: 'close-outline'
        }
      ]
    });
    await sheet.present();
  }

  async confirmarEnvioPOD(): Promise<void> {
    const res = await this.viajeFacade.confirmarEnvioPOD();
    const alert = await this.alertController.create({
      header: res.success ? (res.offline ? 'Cumplido Guardado Localmente' : 'Cumplido Enviado') : 'Atención',
      subHeader: res.offline ? 'Sin señal en muelle' : 'Entrega Legalizada',
      message: res.message,
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  toggleModoViajeDemo(): void {
    const actual = (this.viajeFacade as any).viajeActivoSubject?.getValue();
    if (actual) {
      this.viajeFacade.desactivarViaje();
    } else {
      this.viajeFacade.activarViajeDemo(this.placa, this.nombreCorto);
    }
  }

  loadForm(data: any) {
    this.turnoForm.patchValue({
      destino1: data.data.destino1,
      destino2: data.data.destino2,
      destino3: data.data.destino3,
      remolque: data.data.tiporemolque,
      vehiculovac: data.data.vacio,
    });
  }
}
