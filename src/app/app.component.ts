import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from "ngx-cookie-service";
import { Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { AuthService } from './api/auth.service';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { Network } from '@capacitor/network';
import { PluginListenerHandle } from '@capacitor/core';
import { App,  URLOpenListenerEvent } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { UserService } from './api/user.service';
import { Platform } from '@ionic/angular';
import { PhotoService } from './api/photo.service';
import { log } from 'console';





@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();
  usserLogged: any;

  networkListener!: PluginListenerHandle;
  statusNet!: boolean;
  statusDoc:any = true;
  docs:any = []
  isMobile:any;

  public appPages = [
    { title: 'Inicio', url: '/home', icon: 'home', hidden: false },
    { title: 'Mis datos', url: '/datos', icon: 'person-circle', hidden: false },
    { title: 'Turnos', url: '/turnos', icon: 'archive', hidden: false },
    { title: 'Mis Vehiculos', url: '/vehiculos', icon: 'briefcase' },
    { title: 'Pre Operacional', url: '/preform', icon: 'clipboard' },
    // { title: 'Pruebas', url: '/pruebas', icon: 'flashlight' },
    // { title: 'Archived', url: '/folder/Archived', icon: 'archive' },
    // { title: 'Trash', url: '/folder/Trash', icon: 'trash' },
    // { title: 'Spam', url: '/folder/Spam', icon: 'warning' },
  ];
  // public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor(
    private auth: AuthService,
    private user: UserService,
    private router: Router,
    private photo: PhotoService,
    private ngZone: NgZone,
    private platform: Platform
  ) {
    defineCustomElements(window)
    this.isMobile = this.platform.is('mobile');
    this.initialize()
  }

  conductor: any;
  nombre: any;
  estado: any;
  placa: any;
  marca: any;
  carroceria: any;
  clase_vehiculo: any;
  clase_estado: any;
  token: any;
  public fotoUser: any = '';
  model: any = {}


  initialize() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.ngZone.run( () => {

        const domain = 'www.3slogistica.com';
        this.user.validateCap()
        const pathArray = event.url.split(domain);
        const appPath = pathArray.pop();

        if(appPath)
        {
          this.router.navigateByUrl(appPath)
        }

      })
    })
  }



  async ngOnInit() {

    // console.log(localStorage.getItem("placa"));
    this.token = this.auth.getToken();

    const network = await Network.addListener('networkStatusChange', status => {
      console.log('Network status changed', status);
      this.ngZone.run(() => {
        this.chageNetWorkStatus(status);
      })
    });

    const status = await Network.getStatus();
    this.chageNetWorkStatus(status);

    console.log(this.router.url);

      await this.getData();

    LocalNotifications.addListener('localNotificationActionPerformed', (res) => {
      console.log(res);
    });

  }

  ngOnDestroy(): void {
    if (this.networkListener) this.networkListener.remove();
  }

 async getData()
  {
    this.auth.onChange.subscribe(
      (data) => {
        this.token = this.auth.getToken();
      }
    );

     await this.getDataUser();
  }


 async getDataUser() {
    // this.router.navigate(['/login']);

    try {
    const data = await this.auth.getUser3sL(this.token)

      const datos = data.data[0];
      this.conductor = datos.nombreTercerox.toLowerCase();
      this.nombre = this.conductor.split(' ')[0];
      // this.estado = datos.estado;

      this.placa = datos.numeroPlacaxxx;
      // this.carroceria = datos.carroceria;
      // this.marca = datos.marca;
      // this.clase_vehiculo = datos.clase_vehiculo;
      // this.fotoUser = datos.apiFotoConductor;

     await this.getDocument(datos.codigoTercerox, 'fotoperfil', 'conductor').then(
        (doc: any) => {
          if (doc['code'] !== '204') {
            console.log(doc.data.fotoperfil);


            this.fotoUser = doc.data.fotoperfil;
          }
        }
      )
      console.log(this.placa);

      this.placa = datos.numeroPlacaxxx.substr(0, 3) + " - " + datos.numeroPlacaxxx.substr(3, 5);


      if (datos.numeroEstadoxx == 'ACTIVO') {
        this.estado = 'ACTIVO';
        this.clase_estado = "badge text-bg-success";
      } else {
        this.estado = 'INACTIVO';
        this.clase_estado = "badge text-bg-danger";
        this.appPages[2].hidden = true;
      }

    } catch (err: any) {
      console.error('Error en getData3SL:', err);
    } 

  }

  async getDocument(codigo: any, tipo: any, tipoRegistro: any): Promise<any> {
    const resp: any = await this.photo.getFotoTercero(codigo, tipo, tipoRegistro).toPromise()
    return resp;
  }



  checkStatus(status: any) {
    this.statusNet = status?.connected;
    this.getDataUser();
  }

  chageNetWorkStatus(status: any) {
    this.statusNet = status?.connected;
    if (!this.statusNet) {
      this.model = {
        background: 'assets/imgs/12.png',
        title: 'Sin Conexion',
        subtitle: 'No tienes conexion a internet',
        description: 'Intenta nuevamente',
        titleColor: 'dark',
        color: 'meduim',
        button: 'Cargar',
        buttonColor: 'dark'
      }
    }else{
      this.getDataUser();
    }

  }


  async executeNotification(id: any, title: any, body: any, largeBody:any, sumaryBody:any) {

    await LocalNotifications.schedule({
      notifications: [
        {
          id: id,
          title: title,
          body: body,
          largeBody: largeBody,
          summaryText: sumaryBody
        }
      ]
    });
  }



  statusLogin() {
    return this.auth.getToken();
  }

  logout() {
    return this.auth.logout();
  }



}
