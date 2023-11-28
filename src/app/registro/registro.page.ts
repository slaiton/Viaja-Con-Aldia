import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { log } from 'console';
import { UserService } from '../api/user.service';
import { PhotoService } from '../api/photo.service';





@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  @ViewChild('modal') modal!: ModalController;

  registroForm: any = FormGroup;
  formNewVehicle:any = FormGroup;
  formNewDriver:any = FormGroup;
  newVehicle:any = false;
  checkVehicle:any = false;
  newTercero:any = false;
  checkTercero:any = false;
  alertVehiculo:any = false;
  alertTercero:any = false;
  checkImagen:any = false;


  isModalOpen:any = false;
  isModalOpen2:any = false;
  clase_vehiculo:any;
  carroceria:any;
  fechaxSoatxxxx:any;
  fechaxTecnicox:any;
  modelo:any;
  marca:any;
  apiSoat1: any = [];
  apiTecno1: any = [];
  dataVehiculo:any = {};
  fotoPerfil:any = [];

  constructor(
    private formBuilder : FormBuilder,
    private loading: LoadingController,
    private user: UserService,
    private alertController: AlertController,
    private photo: PhotoService ) 
    { 
      this.registroForm = this.formBuilder.group({
        placa: ['', [Validators.required]],
        cedula: ['', [Validators.required]],
      });
  
      this.formNewVehicle = this.formBuilder.group({
        clase_vehiculo: ['', [Validators.required]],
        carroceria: ['', [Validators.required]],
        fechaxSoatxxxx: ['', [Validators.required]],
        fechaxTecnicox: ['', [Validators.required]],
        marca: ['', [Validators.required]]
     });
    }

  ngOnInit() {

  }


  onSubmit(){

  }

  async searchVehicle(e:any)
  {
    let placaObj =  document.getElementById('placa') as HTMLInputElement;
    placaObj.value = e.target.value.toUpperCase()
    if (e.target.value.length > 5) {
      let placa = placaObj.value
      const loading = await this.loading.create({
        message: 'Buscado Vehiculo...',
        duration: 2000,
      });

      this.resetDataVehculo();

      this.user.getVehiculoByPlaca(placa).subscribe(data => {
         if (data.code == 200 && data.rows > 0) {
           const datos = data.view.data[0];
           console.log(datos);

           this.carroceria = datos.carroceria;
           this.clase_vehiculo = datos.clase_vehiculo;
           this.marca = datos.marca;
           this.fechaxSoatxxxx = datos.vigencia_soat;
           this.fechaxTecnicox = datos.vigencia_tecnomecanica;
           this.modelo = datos.modelo;
           this.apiSoat1.webviewPath = datos.soat1;
           this.apiTecno1.webviewPath = datos.soat1;

          //  this.getDataVehculo();
           
          this.newVehicle = false;

         }else{
          this.newVehicle = true;
          this.checkVehicle = false;
          // this.presentAlert("Alerta","","Vehiculo","Cerrar")
         }

         this.user.get3SLbyplaca(placa).subscribe(esl=> {

            this.presentAlert("Alerta","","Vehiculo ya registra en el app","Cerrar")
            this.checkVehicle = false;
            this.alertVehiculo = true;

        },
        err => {
          this.alertVehiculo = false;

          if (!this.newVehicle) {

            this.checkVehicle = true;
          }
        })
          
      }, 
      err => {
        console.log("ERROR", err);
      
      }
      );

      loading.present();
    }
  }

  async searchConductor (e:any){

    if (e.target.value.length > 7) {
      let cedula = e.target.value
      const loading = await this.loading.create({
        message: 'Buscado Cedula...',
        duration: 2000,
      });
      this.user.getTerceroByCedula(cedula).subscribe(data => {
         if (data.code == 200 && data.rows > 0) {
          // console.log(data);
          this.newTercero = false;
          this.checkTercero = true;
         }else{
          this.newTercero = true;
          this.checkTercero = false;
         }

         this.user.get3SLbyCedula(cedula).subscribe(cc => {
          
          this.presentAlert("Alerta","","Conductor ya registra en el app","Cerrar")
          this.checkTercero = false;
          this.alertTercero = true;

         },
         err => {
          this.alertTercero = false;
         })
          
      }, 
      err => {
        console.log("ERROR", err);
      
      }
      );

      loading.present();
    }
  }

  getDataVehculo(){
    this.dataVehiculo = {
      clase_vehiculo: this.clase_vehiculo,
      carroceria: this.carroceria,
      fechaxSoatxxxx: this.fechaxSoatxxxx,
      fechaxTecnicox: this.fechaxTecnicox,
      marca: this.marca
    }
  }

  resetDataVehculo(){
      this.clase_vehiculo = ''
      this.carroceria = ''
      this.fechaxSoatxxxx = ''
      this.fechaxTecnicox = ''
      this.marca = ''
  }


  nuevoVehiculo() {
    this.setOpenVeh(true);
  }
  
  setOpenVeh(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  setOpenTer(isOpen: boolean) {
    this.isModalOpen2 = isOpen;
  }

  onSubmitNewVehicle() {

  }


  onSubmitNewDriver() {
    
  }

  editVehiculo(){

    this.isModalOpen = true;
    // this.formNewVehicle.patchValue(this.dataVehiculo)

  }

  editTercero() {
    
    this.isModalOpen2 = true;
      
  }

  getSoat1() {
    this.photo.addNewToGallery('soat1').then((da) => {
      this.apiSoat1 = da;
    });
  }

  getTecno() {
    this.photo.addNewToGallery('tencno').then((da) => {
      this.apiTecno1 = da;
    });
  }

  getFoto() {
    this.photo.addNewToGallery('foto').then((da) => {
      this.fotoPerfil = da;
      this.checkImagen = true;
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


}
