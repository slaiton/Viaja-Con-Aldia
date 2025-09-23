import { Component, OnInit } from '@angular/core';
// import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';

import { GeodataService } from "../api/geodata.service";
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService } from "ngx-cookie-service";
import { AlertController, LoadingController } from '@ionic/angular';
import { getElement } from 'ionicons/dist/types/stencil-public-runtime';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../api/user.service';
import { RegistroService } from '../api/registro.service';
import { log } from 'console';
import { Geolocation } from '@capacitor/geolocation';
import { InAppReview } from '@capacitor-community/in-app-review';
import { AuthService } from '../api/auth.service';
import { LocalNotificationService } from '../api/local-notification.service';
import { AlertService } from '../api/alert.service';



@Component({
  selector: 'app-turnos',
  templateUrl: './turnos.page.html',
  styleUrls: ['./turnos.page.scss'],
})
export class TurnosPage implements OnInit {
  longitud: any;
  nombre: any;
  origen: any;
  token: any;
  respuesta: any;
  turnoForm: any = FormGroup;
  vehiculo: any = {
    tipo: ''
  }
  isSubmitting: any = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private geolocation: Geolocation,
    private geodata: GeodataService,
    private cookies: CookieService,
    private alertController: AlertController,
    private loading: LoadingController,
    private userService: UserService,
    private auth: AuthService,
    private alert: AlertService,
    private localNoti: LocalNotificationService,
    private reg: RegistroService) {

    this.token = this.userService.getToken();
    this.turnoForm = this.formBuilder.group({
      origen: [this.origen, [Validators.required]],
      destino1: ['', [Validators.required]],
      destino2: ['', [Validators.required]],
      destino3: ['', [Validators.required]],
      remolque: [''],
      vehiculovac: ['', [Validators.required]],
      nuevo: [false, [Validators.required]]
    });

  }

  public regionales = [
    { nombre: "REGIONAL ARAUCA" },
    { nombre: "REGIONAL ARMENIA" },
    { nombre: "REGIONAL BARRANQUILLA" },
    { nombre: "REGIONAL BOGOTA" },
    { nombre: "REGIONAL BUCARAMANGA" },
    { nombre: "REGIONAL BUENAVENTURA" },
    { nombre: "REGIONAL CALI" },
    { nombre: "REGIONAL CARTAGENA" },
    { nombre: "REGIONAL CUCUTA" },
    { nombre: "REGIONAL FLORENCIA" },
    { nombre: "REGIONAL IBAGUE" },
    { nombre: "REGIONAL IPIALES" },
    { nombre: "REGIONAL MANIZALES" },
    { nombre: "REGIONAL MEDELLIN" },
    { nombre: "REGIONAL MONTERIA" },
    { nombre: "REGIONAL NEIVA" },
    { nombre: "REGIONAL PASTO" },
    { nombre: "REGIONAL PEREIRA" },
    { nombre: "REGIONAL PERU" },
    { nombre: "REGIONAL POPAYAN" },
    { nombre: "REGIONAL RIOHACHA" },
    { nombre: "REGIONAL RIONEGRO" },
  ]



  async ngOnInit() {

    if (this.userService.getToken() == null) {
      this.router.navigate(['/login']);
    }

    const loading = await this.loading.create({
      message: 'Cargando Datos...'
    });

    try {

      loading.present();

      await this.getTurno();
      await this.getDataVehicle();
      await this.getLocation();

      loading.dismiss();

    } catch (err: any) {
      
      loading.dismiss();

      if (err.status == 401) {
        this.auth.logout()
      } else {
        this.presentAlert(
          'Error',
          'Fallo al cargar',
          err.message || 'Ha ocurrido un error inesperado.',
          'Reintentar'
        );
      }
    }
  }


  async onSubmit() {

    if (this.turnoForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    var text = "<ul>";
    var validate = true;
    // console.log(this.turnoForm.controls);

    for (const campo in this.turnoForm.controls) {
      if (this.turnoForm.controls[campo].invalid) {
        validate = false;
        text += "<li>" + campo.charAt(0).toUpperCase() + campo.slice(1) + "</li>";
      }
    }

    text += "</ul>";
    if (!validate) {
      this.presentAlert('Falta informacion', '', text, 'Aceptar');
      return;
    }

    if (this.turnoForm.value.origen == null) {
      this.presentAlert('Respuesta enturnamiento', '', 'Refrescando ubicacion GPS...', 'Aceptar');
    }

    if (this.turnoForm.value.origen != null) {

      try {

        this.origen = this.turnoForm.value.origen.normalize("NFD") // Normalizamos para obtener los códigos
          .replace(/[\u0300-\u036f|.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // Quitamos los acentos y símbolos de puntuación
          .replace(/ +/g, '-') // Reemplazamos los espacios por guiones
          .toLowerCase();


        const placa = localStorage.getItem("placa")?.toUpperCase();

        const turno = {
          "placa": placa,
          "ciudad_origen": this.origen,
          "ciudad_destino1": this.turnoForm.value.destino1,
          "ciudad_destino2": this.turnoForm.value.destino2,
          "ciudad_destino3": this.turnoForm.value.destino3,
          "desacorasado": this.turnoForm.value.vehiculovac,
          "estado_trailer": this.turnoForm.value.remolque,
          "nuevo": this.turnoForm.value.nuevo
        };

        const data = await this.geodata.turnoCreacion(turno);

        if (data['code'] == 200) {
          this.respuesta = JSON.stringify(data)
          this.respuesta = JSON.parse(this.respuesta);
          this.turnoForm.reset();
          this.isSubmitting = false;
          this.presentAlertRedirect('Respuesta enturnamiento', '', this.respuesta.data, 'Aceptar', '/home')
          this.localNoti.executeNotification(1,"IMPORTANTE","TURNO CREADO CON EXITO",this.respuesta.data, "");

          // this.router.navigateByUrl('/home')
          // this.router.navigate(['/home']);
          InAppReview.requestReview();
        }

      } catch (err: any) {
          this.isSubmitting = false;

        if (err.status === 401) {
          this.auth.logout();
          return;
        }


        this.presentAlert(
          'Error',
          'Fallo al cargar',
          err.error.data,
          'Cerrar'
        );

      }

    }

  }


  async getTurno() {

    const data:any = await this.userService.getTurnoUser();
    this.origen = data.data.origen_nombre

    this.turnoForm.patchValue({
      origen:data.data.origen_nombre,
      destino1: data.data.destino1,
      destino2: data.data.destino2,
      destino3: data.data.destino3,
      remolque: data.data.tiporemolque,
      vehiculovac: data.data.vacio,
    });

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
            
          }
        },
        {
          text: 'Cancelar',
          handler: async () => {
            this.router.navigate(['/home'])
          }
        }
      ]

      console.log(this.origen);
      console.log(this.nombre);
      


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


  async getCurrentPosition() {
    const origen = document.getElementById('origen') as HTMLInputElement | null;
    const origenLabel = document.getElementById('origenLabel') as HTMLInputElement | null;

    await Geolocation.getCurrentPosition().then(async (resp: any) => {

      console.log(resp);

      if (resp.coords) {  
       await this.geolocationService(resp.coords.latitude, resp.coords.longitude);
      }else {
      origenLabel!.innerHTML = "";
      origenLabel!.innerHTML = "Error al obtener GPS";
      }
        
    }).catch((error: any) => {
      origenLabel!.innerHTML = "";
      origenLabel!.innerHTML = "Error GPS Desactivado";
      console.log('Error getting location', error);
    });



    // if ((origen != null && origenLabel != null) && this.nombre == null) {
    //   await Geolocation.getCurrentPosition().then((resp: any) => {

    //     // origenLabel.innerHTML = "";
    //     // origen.innerHTML = "";

    //     this.geolocationService(resp.coords.latitude, resp.coords.longitude);

    //   }).catch((error: any) => {
    //     origenLabel.innerHTML = "";
    //     origenLabel.innerHTML = "Error al obtener GPS";
    //     console.log('Error getting location', error);
    //   });
    // }
  }

  async getDataVehicle() {
    const data = await this.reg.getDataVehiculo(this.userService.getPlaca())
    this.vehiculo.tipo = data.data[0].tipoxxVehiculo
    return data;
  }


  async presentAlert(title: String, subheader: String, desc: String, botton: String) {
    const alert = await this.alertController.create({
      header: '' + title,
      subHeader: '' + subheader,
      message: '' + desc,
      buttons: ['' + botton],
    });

    await alert.present();
  }

  async presentAlertRedirect(
    title: string,
    subheader: string,
    desc: string,
    button: string,
    redirectTo?: string // nuevo parámetro opcional
  ) {
    const alert = await this.alertController.create({
      header: title,
      subHeader: subheader,
      message: desc,
      buttons: [button],
    });
  
    await alert.present();
  
    await alert.onDidDismiss();
  
    if (redirectTo) {
      location.href = redirectTo;
      // this.router.navigateByUrl(redirectTo);
    }
  }

  async geolocationService(lat: Number, lon: Number) {

    const data = await this.geodata.getCityByLatLon(lat, lon, this.token)

    const origenLabel = document.getElementById('origenLabel') as HTMLInputElement | null;

    if (data.status) {
      this.nombre = data.data.ciudad_oigen_final
      origenLabel!.innerHTML =
        "<ion-icon name='location'> </ion-icon> <strong>" +
        this.nombre +
        '</strong>';
    } else {
      origenLabel!.innerHTML =
        "<ion-icon name='location'> </ion-icon> <strong> Sin Ubicacion </strong>";
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


}
