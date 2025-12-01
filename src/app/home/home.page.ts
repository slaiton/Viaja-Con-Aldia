import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../api/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { log } from 'console';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonModal, LoadingController, ModalController, Platform } from '@ionic/angular';
import { GeodataService } from '../api/geodata.service';
import { AppComponent } from '../app.component';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PhotoService } from '../api/photo.service';
import { AuthService } from '../api/auth.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Browser } from '@capacitor/browser';
import { environment } from 'src/environments/environment';
import { NotificationService } from '../api/notificaciones.service';
import { PushNotifications, PermissionStatus } from '@capacitor/push-notifications';
import { LocalNotificationService } from '../api/local-notification.service';
import { AlertService } from '../api/alert.service';
import { TurnosService } from '../api/turnos.service';
import { Turno } from '../models/turno.model';
import { alertCircleOutline } from 'ionicons/icons';
import { GlobalService } from '../api/global.service';


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

  alertIcon: any = alertCircleOutline;
  secretsAldia: any = {}

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
    private modalController: ModalController,
    private photo: PhotoService,
    private formBuilder: FormBuilder,
    private geodata: GeodataService,
    private alert: AlertService,
    public turno: TurnosService,
    private loading: LoadingController,
    private platform: Platform,
    private localNoti: LocalNotificationService,
    private alertController: AlertController
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


    this.token = this.userService.getToken();
    this.permissionStatus = this.userService.getItem('permissionNotify');
    this.placa = this.userService.getPlaca();
    this.placaLetras = this.placa.substr(0, 3);
    this.placaNum = this.placa.substr(3, 5);
  }


  async ngOnInit() {

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

      await this.validateFechas();

      await this.getData3SL()

      await this.userService.validateCap()

      this.loadingData.dismiss();

      setTimeout(async () => {
        // this.showAlerts = true;
        await this.getPreoperacional();
      }, 400);

    } catch (err: any) {

      this.loadingData.dismiss();


      if (err.status == 401) {
        this.loadingData.dismiss()
        this.auth.logout()
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


  async getData3SL() {

    const data = await this.userService.getTercero3sL(this.token);

    if (!data || !data['data'] || data['data'].length === 0) {
      throw new Error('No se encontraron datos.');
    }

    const datos = data['data'][0];

    this.cedula = datos.codigoTercerox
    this.nombres = datos.nombreTercerox
    this.apellidos = datos.apell1Tercerox + ' ' + datos.apell2Tercerox
    this.correo = datos.emailxTercerox
    this.celular = datos.movilxTercerox
    this.direccion = datos.direccTercerox
    this.fecha = datos.fechaxNacimien
    this.ciudad = datos.ciudadCreacion

    this.getDocument(this.cedula, 'fotoperfil', 'conductor').then(
      (doc: any) => {
        if (doc['code'] !== '204') {
          this.fotoUser = doc.data.fotoperfil;
        }
      }
    )

    if (this.statusDoc) {
      if (datos.numeroEstadoxx == 'ACTIVO') {
        this.estado = true
        this.getTurnoTecero();
      } else {
        this.estado = false
        this.turnoExistente = false;
        this.botonInactivo = true;
        this.estadoBoton = 'Inactivo';
        this.clase_estado = 'color-red';
      }
    } else {
      this.estadoBoton = 'Documentos Vencidos';
      this.botonDocumentos = true
      this.router.navigateByUrl('/datos')
    }

    // } catch (err: any) {
    //   console.log(err);

    //   this.loadingData.dismiss();

    //   this.presentAlert(
    //     'Error',
    //     'Fallo al cargar',
    //     err.message || 'Ha ocurrido un error inesperado.',
    //     'Reintentar'
    //   );
    // } finally {
    //   this.loadingData.dismiss();
    // }
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
      const permissionStatus: PermissionStatus = await PushNotifications.checkPermissions();

      if (permissionStatus.receive !== 'granted') {
        const requestPermission = await PushNotifications.requestPermissions();
        if (requestPermission.receive !== 'granted') {
          console.warn('Permisos de notificaciones no concedidos');
          return;
        }
      }

      // Registrar notificaciones
      await PushNotifications.register();

      PushNotifications.addListener('registration', async (token) => {
        // console.log('Token FCM obtenido:', token.value);
        const json = { email: this.cedula, token_mobile: token.value }
        await this.userService.laodTokenMobile(json, this.token);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error al registrar FCM:', error);
      });

      // Listener para recibir notificaciones
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Notificación recibida en foreground:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('Acción realizada con la notificación:', action);
      });

    } catch (error) {
      console.error('Error en la configuración de notificaciones push:', error);
    }
  }


  async permissionsAlerts(permissionAttempts: any) {
    const permissions = await LocalNotifications.checkPermissions();

    if (permissions.display !== 'granted') {
      if (permissionAttempts < 2) {
        const newPermissions = await LocalNotifications.requestPermissions();
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
      StatusBar.setBackgroundColor({ color: '#3c8ccd' });
    } else if (this.platform.is('ios')) {
      StatusBar.setStyle({ style: Style.Dark });
    }
  }

  async executeNotification(id: any, title: any, body: any) {

    await LocalNotifications.schedule({
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

      const placa = (localStorage.getItem('placa') || '').toUpperCase();

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
  async nuevoTurno() {

    this.modalTurno.present();

    await this.getLocation()

  }

  async getTurno() {

    const data: any = await this.userService.getTurnoUser();
    this.listTurnos = data;

    this.modalTurno.present();

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
