import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../api/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { log } from 'console';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonModal, ModalController } from '@ionic/angular';
import { GeodataService } from '../api/geodata.service';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { AppComponent } from '../app.component';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild(IonModal) modalTurno!: IonModal;
  @ViewChild(IonModal) modalTurno2!: IonModal;

  constructor(
    public userService: UserService,
    private router: Router,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private geolocation: Geolocation,
    private geodata: GeodataService,
    private alert: AlertController,
    private app:AppComponent
  ) {}

  turnoExistente: boolean = false;
  posicionTurno1: any;
  posicionTurno2: any;
  posicionTurno3: any;
  dataTercero: any;
  dataInCorrect:any;
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
  estado: any;
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
  viewTurno:any;
  fotoUser:any;
  modulos:any; 
  clase_estado:any;
  token:any;

  get f() {
    return this.turnoForm.controls;
  }

  public regionales = [
    { nombre: 'REGIONAL ARAUCA' },
    { nombre: 'REGIONAL ARMENIA' },
    { nombre: 'REGIONAL BARRANQUILLA' },
    { nombre: 'REGIONAL BOGOTA' },
    { nombre: 'REGIONAL BUCARAMANGA' },
    { nombre: 'REGIONAL BUENAVENTURA' },
    { nombre: 'REGIONAL CALI' },
    { nombre: 'REGIONAL CARTAGENA' },
    { nombre: 'REGIONAL CUCUTA' },
    { nombre: 'REGIONAL FLORENCIA' },
    { nombre: 'REGIONAL IBAGUE' },
    { nombre: 'REGIONAL IPIALES' },
    { nombre: 'REGIONAL MANIZALES' },
    { nombre: 'REGIONAL MEDELLIN' },
    { nombre: 'REGIONAL MONTERIA' },
    { nombre: 'REGIONAL NEIVA' },
    { nombre: 'REGIONAL PASTO' },
    { nombre: 'REGIONAL PEREIRA' },
    { nombre: 'REGIONAL PERU' },
    { nombre: 'REGIONAL POPAYAN' },
    { nombre: 'REGIONAL RIOHACHA' },
    { nombre: 'REGIONAL RIONEGRO' },
  ];

  ngOnInit() {

    this.token = this.userService.getToken();

    if (this.userService.getToken() == null) {
      this.router.navigate(['/login']);
    }
    this.app.ngOnInit();

    // console.log(this.userService.getToken());
     
    this.placa = this.userService.getPlaca();
    this.placaLetras = this.placa.substr(0, 3);
    this.placaNum = this.placa.substr(3, 5);

    this.userService.getTercero3sL(this.token).subscribe(
      (data) => {
        const datos = data['data'][0];
         this.fotoUser = datos.apiFotoConductor;
         this.cedula = datos.codigoTercerox
         this.nombres = datos.nombreTercerox
         this.apellidos = datos.apell1Tercerox + ' ' + datos.apell2Tercerox
         this.correo = datos.emailxTercerox
         this.celular = datos.movilxTercerox
         this.direccion = datos.direccTercerox
         this.fecha = datos.fechaxNacimien
         this.ciudad = datos.ciudadCreacion
      },
      (err) => {
        if (err.status == 401) {
          this.userService.logout();
        }
        
      }
    );


    this.userService.getTurnoUser().subscribe(
      (data) => {          
        this.clase_estado = 'color-green';
        this.listTurnos = data;
        // console.log(this.listTurnos);
        this.turnoExistente = true;
        this.idModal = 'open-modal2';
        this.destino1 = this.listTurnos.data.destino1;
        this.destino1 = this.listTurnos.data.destino1;
        this.destino2 = this.listTurnos.data.destino2;
        this.destino3 = this.listTurnos.data.destino3;
        this.origen = this.listTurnos.data.origen_nombre;
        this.posicionTurno1 = this.listTurnos.data.posicionDestino1;
        this.posicionTurno2 = this.listTurnos.data.posicionDestino2;
        this.posicionTurno3 = this.listTurnos.data.posicionDestino3;
      },
      (err) => {          
        this.clase_estado = 'color-red';
        console.log(err);
        this.presentAlert(
          'Sin turnos',
          '',
          'Puedes agregar un turno en opcion',
          'Continuar'
        );
        this.idModal = 'open-modal';
      }
    );
  }

  onSubmit() {
    console.log(this.turnoForm.value);

    if (this.turnoForm.value.origen != null) {
      const ciudad = this.turnoForm.value.origen
        .normalize('NFD') // Normalizamos para obtener los códigos
        .replace(/[\u0300-\u036f|.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Quitamos los acentos y símbolos de puntuación
        .replace(/ +/g, '-') // Reemplazamos los espacios por guiones
        .toLowerCase();

      const placa = localStorage.getItem('placa')?.toUpperCase();
      const turno = {
        placa: placa,
        ciudad_origen: ciudad,
        ciudad_destino1: this.turnoForm.value.destino1,
        ciudad_destino2: this.turnoForm.value.destino2,
        ciudad_destino3: this.turnoForm.value.destino3,
        desacorasado: this.turnoForm.value.vehiculovac,
        estado_trailer: this.turnoForm.value.remolque,
      };
      this.geodata.turnoCreacion(turno).subscribe((data) => {
        this.respuesta = JSON.stringify(data);
        this.respuesta = JSON.parse(this.respuesta);
        this.presentAlert(
          'Respuesta enturnamiento',
          '',
          this.respuesta.data,
          'Aceptar'
        );
        this.turnoForm.reset();
        this.ngOnInit();
      });
    }
  }
  nuevoTurno() {
    console.log('click');
    
    this.turnoForm = this.formBuilder.group({
      origen: ['', [Validators.required]],
      destino1: ['', [Validators.required]],
      destino2: ['', [Validators.required]],
      destino3: ['', [Validators.required]],
      remolque: ['', [Validators.required]],
      vehiculovac: ['', [Validators.required]],
    });

    this.geolocation
      .getCurrentPosition()
      .then((resp) => {
        this.geolocationService(resp.coords.latitude, resp.coords.longitude);
      })
      .catch((error) => {
        console.log('Error getting location', error);
      });

    console.log('nuevo turno ejecutado');

    this.modalTurno.present();
  }

  getTurno() {

    // console.log('funcion que muestra modal con los turnos cargados');
    
    this.turnoForm = this.formBuilder.group({
      origen: ['', [Validators.required]],
      destino1: ['', [Validators.required]],
      destino2: ['', [Validators.required]],
      destino3: ['', [Validators.required]],
      remolque: ['', [Validators.required]],
      vehiculovac: ['', [Validators.required]],
    });

    const listTurnos = this.userService.getTurnoUser().subscribe((data) => {
      this.listTurnos = data;

      this.geolocation
        .getCurrentPosition()
        .then((resp) => {
          this.geolocationService(resp.coords.latitude, resp.coords.longitude);
        })
        .catch((error) => {
          console.log('Error getting location', error);
        });

      this.modalTurno.present();

      this.loadForm(data);
    });
  }

  redirect(page: any) {
    this.router.navigate(['/' + page]);
  }

  async geolocationService(lat: Number, lon: Number) {
    this.geodata.getCityByLatLon(lat, lon).subscribe((data) => {
      this.longitud = data.results.length;

      if (data.results[this.longitud - 1].address_components.length > 2) {
        this.nombre =
          data.results[this.longitud - 1].address_components[0].long_name;
      } else if (
        data.results[this.longitud - 2].address_components.length > 2
      ) {
        this.nombre =
          data.results[this.longitud - 2].address_components[0].long_name;
      } else if (
        data.results[this.longitud - 3].address_components.length > 2
      ) {
        this.nombre =
          data.results[this.longitud - 3].address_components[0].long_name;
      }

      const origenLabel = document.getElementById(
        'origenLabel'
      ) as HTMLInputElement | null;

      if (origenLabel != null) {

        this.getZona(this.nombre).then(
          (data:any) => {
            if (data.status) {
              console.log(data.data.ciudad_oigen_entrada);
              this.nombre = data.data.ciudad_oigen_final
              origenLabel.innerHTML =
              "<ion-icon name='location'> </ion-icon> <strong>" +
              this.nombre +
              '</strong>';
            }else{
              console.log('ERROR');
              console.log(data.data.ciudad_oigen_final);
            }
          }
        )
      } else {
        this.presentAlert('Error GPS', '', this.nombre, 'Cerrar');
      }
    });
  }

  async presentAlert(
    title: String,
    subheader: String,
    desc: String,
    botton: String
  ) {
    const alert = await this.alert.create({
      header: '' + title,
      subHeader: '' + subheader,
      message: '' + desc,
      buttons: ['' + botton],
    });

    await alert.present();
  }

  async getZona(nombre:any)
  {

    try {

      
      const data = await this.geodata.getGeoZona(nombre, '', '', this.token).toPromise()

      return data

      
    } catch (error) {
      throw error
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
