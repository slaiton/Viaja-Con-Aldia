import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from "ngx-cookie-service";
import { Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { AuthService } from './api/auth.service';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { Network } from '@capacitor/network';
import { PluginListenerHandle } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { UserService } from './api/user.service';
import { Platform } from '@ionic/angular';




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
    private cookies: CookieService,
    private ngZone: NgZone,
    private platform: Platform
  ) {
    defineCustomElements(window)
    this.isMobile = this.platform.is('mobile');
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
  fotoUser: any = false;
  model: any = {}



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

    this.auth.onChange.subscribe(
      (data) => {
        this.token = this.auth.getToken();
      }
    );


    if (localStorage.getItem("token") != null) {
      this.getDataUser();
    }

    LocalNotifications.addListener('localNotificationActionPerformed', (res) => {
      console.log(res);
    });

  }

  ngOnDestroy(): void {
    if (this.networkListener) this.networkListener.remove();
  }

  async getFechas() {
    this.docs = []
    var text:any = []
    const data =  await this.user.getFechas(this.token).toPromise()
    if (data.status)  {
      this.statusDoc = true;
      this.docs = {}
      text = []
    }else{
      this.statusDoc = false;

      if (data.data.vehiculo && data.data.vehiculo.length > 0) {
        for (let a = 0; a < data.data.vehiculo.length; a++) {
          const element  = data.data.vehiculo[a];

          const json = {
            nombre: element.nombre,
            fecha: element.fecha
          }

          const palabra = this.separarCamelCase(element.nombre);
          text.push(palabra);
          this.docs.push(json);
        }
      }

      if (data.data.conductor && data.data.conductor.length > 0) {
        for (let a = 0; a < data.data.conductor.length; a++) {
          const element  = data.data.conductor[a];

          const json = {
            nombre: element.nombre,
            fecha: element.fecha
          }

          const palabra = this.separarCamelCase(element.nombre);
          text.push(palabra);
          this.docs.push(json);
        }
      }

      if (text.length > 0) {
        this.executeNotification(1,"IMPORTANTE","Documentos Vencidos",text.join(','), "Actualiza tus documentos para continuar");
      }
    }
  }

  getDataUser() {
    // this.router.navigate(['/login']);
    this.auth.getUser3sL(this.token).subscribe(data => {
      const datos = data.data[0];
      this.conductor = datos.nombreTercerox.toLowerCase();
      this.nombre = this.conductor.split(' ')[0];
      // this.estado = datos.estado;
      this.placa = datos.numeroPlacaxxx;
      // this.carroceria = datos.carroceria;
      // this.marca = datos.marca;
      // this.clase_vehiculo = datos.clase_vehiculo;
      this.fotoUser = datos.apiFotoConductor;

      this.placa = this.placa.substr(0, 3) + " - " + this.placa.substr(3, 5);


      if (datos.numeroEstadoxx == '1') {
        this.estado = 'ACTIVO';
        this.clase_estado = "badge text-bg-success";
      } else {
        this.estado = 'INACTIVO';
        this.clase_estado = "badge text-bg-danger";
        this.appPages[2].hidden = true;
      }
      console.log(this.statusNet)
    });
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


   separarCamelCase(cadena: any): string {
    const regex = /([a-z])([A-Z])/g;
    let nuevaCadena:any = cadena.replace(regex, '$1 $2');
    nuevaCadena = nuevaCadena.toLowerCase();
    nuevaCadena = nuevaCadena.charAt(0).toLowerCase() + nuevaCadena.slice(1);
    return nuevaCadena;
}


  statusLogin() {
    return this.auth.getToken();
  }

  logout() {
    return this.auth.logout();
  }



}
