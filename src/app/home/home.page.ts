import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from "../api/user.service";
import { ActivatedRoute, Router } from '@angular/router';
import { log } from 'console';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonModal, ModalController } from '@ionic/angular';
import { GeodataService } from "../api/geodata.service";
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';






@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild(IonModal) modalTurno!:IonModal;
  @ViewChild(IonModal) modalTurno2!:IonModal;
  // @ViewChild('modalTurno') modalTurno!:ModalController;
  // @ViewChild('modalTurno2') modalTurno2!:ModalController;


  constructor(
    public userService: UserService,
    private router:Router,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private geolocation: Geolocation,
    private geodata:GeodataService,
    private alert:AlertController

    ) {}

  turnoExistente:boolean=false;
  listTurnos:any = [];
  conductor:any;
  estado:any;
  placa:any;
  marca:any;
  carroceria:any;
  clase_vehiculo:any;
  respuesta:any;
  turnoForm:any = FormGroup;
  longitud:any;
  nombre:any;
  idModal: any;

  get f() { return this.turnoForm.controls; }



  public regionales =[
    { nombre: "REGIONAL ARAUCA"},
    { nombre: "REGIONAL ARMENIA"},
    { nombre: "REGIONAL BARRANQUILLA"},
    { nombre: "REGIONAL BOGOTA"},
    { nombre: "REGIONAL BUCARAMANGA"},
    { nombre: "REGIONAL BUENAVENTURA"},
    { nombre: "REGIONAL CALI"},
    { nombre: "REGIONAL CARTAGENA"},
    { nombre: "REGIONAL CUCUTA"},
    { nombre: "REGIONAL FLORENCIA"},
    { nombre: "REGIONAL IBAGUE"},
    { nombre: "REGIONAL IPIALES"},
    { nombre: "REGIONAL MANIZALES"},
    { nombre: "REGIONAL MEDELLIN"},
    { nombre: "REGIONAL MONTERIA"},
    { nombre: "REGIONAL NEIVA"},
    { nombre: "REGIONAL PASTO"},
    { nombre: "REGIONAL PEREIRA"},
    { nombre: "REGIONAL PERU"},
    { nombre: "REGIONAL POPAYAN"},
    { nombre: "REGIONAL RIOHACHA"},
    { nombre: "REGIONAL RIONEGRO"},
]




  ngOnInit(){

    if (localStorage.getItem('token') == null) {
      this.router.navigate(['/login']);
   }


    this.userService.getUser().subscribe(data => {
      data = data.view.data[0];
      // console.log(data);

      this.conductor = data.conductor.toLowerCase();
      this.estado = data.estado;
      this.placa = data.placa;
      this.carroceria = data.carroceria;
      this.marca = data.marca;
      this.clase_vehiculo = data.clase_vehiculo;
      // console.log(data)

      this.placa = this.placa.substr(0,3)+" - "+this.placa.substr(3,5);

    },
    err => {
      console.log(err);

      this.presentAlert('Error al Consultar','', err.message ,'Continuar')
    }
    );






     this.userService.getTurnoUser().subscribe(data=>{
        this.listTurnos = data;
        console.log(this.listTurnos);
        this.turnoExistente = true;
        this.idModal = "open-modal2"

      },
      err => {
        console.log(err);
        this.presentAlert('Sin turnos','', 'Puedes agregar un turno con el boton Rojo' ,'Continuar')
        this.idModal = "open-modal"
      });









    // this.userService.getTurnoUser().subscribe(
    //   data => {
    //     console.log(data);

    //   },
    //   err => {

    //   this.presentAlert('Error al Consultar','', err.message ,'Continuar')

    //   }
    //   );

  }

  onSubmit(){


    if (this.turnoForm.value.origen != null) {

      const ciudad = this.turnoForm.value.origen.normalize("NFD") // Normalizamos para obtener los códigos
      .replace(/[\u0300-\u036f|.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // Quitamos los acentos y símbolos de puntuación
      .replace(/ +/g, '-') // Reemplazamos los espacios por guiones
      .toLowerCase();

      const placa = localStorage.getItem("placa")?.toUpperCase();

      const turno  = {
        "placa": placa,
        "ciudad_origen": ciudad,
        "ciudad_destino1": this.turnoForm.value.destino1,
        "ciudad_destino2":this.turnoForm.value.destino2,
        "ciudad_destino3":this.turnoForm.value.destino3,
        "desacorasado": this.turnoForm.value.vehiculovac,
        "estado_trailer":this.turnoForm.value.remolque
    };
        this.geodata.turnoCreacion(turno).subscribe(data => {
               this.respuesta = JSON.stringify(data)
               this.respuesta = JSON.parse(this.respuesta);
               this.presentAlert('Respuesta enturnamiento','',this.respuesta.data ,'Aceptar')
               this.turnoForm.reset();
               this.ngOnInit();
          });

      // this.userService.nevoTurnoApi(
      //                         this.turnoForm.value.origen,
      //                         this.turnoForm.value.destino1,
      //                         this.turnoForm.value.destino3,this.turnoForm.value.vehiculovac,
      //                         this.turnoForm.value.origen,
      //                         this.turnoForm.value.remolque).subscribe(
      //                           data => {
      //                             this.respuesta = JSON.stringify(data)
      //                             this.respuesta = JSON.parse(this.respuesta);
      //                             this.presentAlert('Respuesta enturnamiento','',this.respuesta.data ,'Aceptar')
      //                           }
      //                         )
    }


  }

   nuevoTurno()
    {
      this.turnoForm = this.formBuilder.group({
        origen: ['', [Validators.required]],
        destino1: ['', [Validators.required]],
        destino2: ['', [Validators.required]],
        destino3: ['', [Validators.required]],
        remolque: ['', [Validators.required]],
        vehiculovac: ['', [Validators.required]]
        });

      this.geolocation.getCurrentPosition().then((resp) => {

        this.geolocationService(resp.coords.latitude,resp.coords.longitude);

      }).catch((error) => {
        console.log('Error getting location', error);
      });

      console.log('nuevo turno ejecutado');

       this.modalTurno.present();

    }

    getTurno(){

      console.log('funcion que muestra modal con los turnos cargados');

      // this.userService.getTurno().subscribe(data => {
      //   this.dataTercero = data.data[0];
      //   this.cedula = this.dataTercero.documento;
      //   this.nombres = this.dataTercero.nombre;
      //   this.apellidos = this.dataTercero.apellido;





      // this.turnoForm = this.formBuilder.group({
      //   origen: ['', [Validators.required]],
      //   destino1: ['', [Validators.required]],
      //   destino2: ['', [Validators.required]],
      //   destino3: ['', [Validators.required]],
      //   remolque: ['', [Validators.required]],
      //   vehiculovac: ['', [Validators.required]]
      //   });


      // this.modalTurno.dismiss();
      // this.modalTurno2.present();


    }


  redirect(page:any)
  {
    this.router.navigate(["/"+page])
  }


  async geolocationService(lat: Number, lon: Number) {


    this.geodata.getCityByLatLon(lat,lon).subscribe(data => {
      this.longitud = data.results.length;
      console.log(data.results)



        if(data.results[this.longitud-1].address_components.length > 2)
        {
          // console.log(data.results[11].address_components)
          this.nombre = data.results[this.longitud-1].address_components[0].long_name;
        }
        else if (data.results[this.longitud-2].address_components.length > 2)
        {
          // console.log(data.results[10].address_components)
          this.nombre = data.results[this.longitud-2].address_components[0].long_name;
        }
        else if (data.results[this.longitud-3].address_components.length > 2)
        {
          // console.log(data.results[9].address_components)
          this.nombre = data.results[this.longitud-3].address_components[0].long_name;
        }

        const origenLabel = document.getElementById('origenLabel') as HTMLInputElement | null;

        console.log(origenLabel);



        if (origenLabel != null) {
          origenLabel.innerHTML = "<ion-icon name='location'> </ion-icon> <strong>" + this.nombre + "</strong>";
        }else{
          this.presentAlert("Error GPS", "", this.nombre, "Cerrar");
        }

    });

}


async presentAlert(title: String, subheader: String, desc: String, botton: String ) {
  const alert = await this.alert.create({
    header: '' + title,
    subHeader: '' + subheader,
    message: '' + desc,
    buttons: ['' + botton],
  });

  await alert.present();
}




}
