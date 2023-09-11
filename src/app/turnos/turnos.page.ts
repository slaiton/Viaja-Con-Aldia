import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { GeodataService } from "../api/geodata.service";
import {FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService } from "ngx-cookie-service";
import { AlertController } from '@ionic/angular';
import { getElement } from 'ionicons/dist/types/stencil-public-runtime';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../api/user.service';



@Component({
  selector: 'app-turnos',
  templateUrl: './turnos.page.html',
  styleUrls: ['./turnos.page.scss'],
})
export class TurnosPage implements OnInit {
  longitud:any;
  nombre:any;
  ciudad:any;
  token:any;
  respuesta:any;
  turnoForm:any = FormGroup; 

  constructor(
    private router: Router,
     private formBuilder: FormBuilder,
     private geolocation: Geolocation,
      private geodata:GeodataService,
       private cookies:CookieService,
        private alertController: AlertController,
        private userService:UserService) {}
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
    
    onSubmit()
  {

    // console.log(this.turnoForm.value)
    if (this.turnoForm.value.origen == null) {
      this.presentAlert('Respuesta enturnamiento','', 'Refrescando ubicacion GPS...' ,'Aceptar');
    }

    if (this.turnoForm.value.origen != null) {


      // this.userService.nevoTurnoApi(
      //   this.turnoForm.value.origen, 
      //   this.turnoForm.value.destino1,
      //   this.turnoForm.value.destino3,this.turnoForm.value.vehiculovac,
      //   this.turnoForm.value.origen,
      //   this.turnoForm.value.remolque).subscribe(
      //     data => {
      //       this.respuesta = JSON.stringify(data)
      //       this.respuesta = JSON.parse(this.respuesta);
      //       this.presentAlert('Respuesta enturnamiento','',this.respuesta.data ,'Aceptar')          }
      //   )
      

   this.ciudad = this.turnoForm.value.origen.normalize("NFD") // Normalizamos para obtener los códigos
                .replace(/[\u0300-\u036f|.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // Quitamos los acentos y símbolos de puntuación
                .replace(/ +/g, '-') // Reemplazamos los espacios por guiones
                .toLowerCase();


    const placa = localStorage.getItem("placa")?.toUpperCase();
    // const turno = {
    //   "view": "enturnamiento",
    //   "params": {
    //     "placa": placa,
    //     "ciudad_destino1": this.turnoForm.value.destino1,
    //       "ciudad_destino2": this.turnoForm.value.destino2,
    //       "ciudad_destino3": this.turnoForm.value.destino3,
    //       "desacorasado": this.turnoForm.value.vehiculovac,
    //       "ciudad_origen": this.ciudad,
    //       "estado_trailer": this.turnoForm.value.remolque 
    //     }
    //   };

    const turno  = {
      "placa": placa,
      "ciudad_origen": this.ciudad,
      "ciudad_destino1": this.turnoForm.value.destino1,
      "ciudad_destino2":this.turnoForm.value.destino2,
      "ciudad_destino3":this.turnoForm.value.destino3,
      "desacorasado": this.turnoForm.value.vehiculovac,
      "estado_trailer":this.turnoForm.value.remolque
  };


      // this.geodata.tokenAcceso(user).subscribe(resp => { 
      //   this.token = JSON.stringify(resp);
      //   this.token = JSON.parse(this.token);
      //   this.token = this.token.access_token;
      //   console.log(this.token);
        
      this.geodata.turnoCreacion(turno).subscribe(data => { 
            
            //  console.log(data);

             this.respuesta = JSON.stringify(data)
             this.respuesta = JSON.parse(this.respuesta);
             this.presentAlert('Respuesta enturnamiento','',this.respuesta.data ,'Aceptar')
             this.turnoForm.reset();
             this.ngOnInit();
        });

      // });

    }

  }


  ngOnInit() {

    if (localStorage.getItem('token') == null) {
      this.router.navigate(['/login']);
   }
    
    this.geolocation.getCurrentPosition().then((resp) => {
      
      this.geolocationService(resp.coords.latitude,resp.coords.longitude);

    }).catch((error) => {
      console.log('Error getting location', error);
    });


    const origen = document.getElementById('origen') as HTMLInputElement | null;
    const origenLabel = document.getElementById('origenLabel') as HTMLInputElement | null;

    if ((origen != null && origenLabel != null) && this.nombre == null) {
      this.geolocation.getCurrentPosition().then((resp) => {

        origenLabel.innerHTML = "";
        // origen.innerHTML = "";
      
        this.geolocationService(resp.coords.latitude,resp.coords.longitude);
  
      }).catch((error) => {
        console.log('Error getting location', error);
      });
    }


    

     this.turnoForm = this.formBuilder.group({
      origen: ['', [Validators.required]],
      destino1: ['', [Validators.required]],
      destino2: ['', [Validators.required]],
      destino3: ['', [Validators.required]],
      remolque: ['', [Validators.required]],
      vehiculovac: ['', [Validators.required]]
      });

     
  }


  async presentAlert(title: String, subheader: String, desc: String, botton: String ) {
    const alert = await this.alertController.create({
      header: '' + title,
      subHeader: '' + subheader,
      message: '' + desc,
      buttons: ['' + botton],
    });

    await alert.present();
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

          if (origenLabel != null) {
            origenLabel.innerHTML = "<ion-icon name='location'> </ion-icon> <strong>" + this.nombre + "</strong>";
          }else{
            this.presentAlert("Error GPS", "", this.nombre, "Cerrar");
          }

      });
  
  }


}
