import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { log } from 'console';
import { UserService } from '../api/user.service';
import { PhotoService } from '../api/photo.service';

import { Router } from '@angular/router';
import { RegistroService } from '../api/registro.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';









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
  articulado:any = false;


  isModalOpen:any = false;
  isModalOpen2:any = false;
  cedula:any;
  jsonDocs:any = [];
  clase_vehiculo:any;
  carroceria:any;
  fechaxSoatxxxx:any;
  fechaxTecnicox:any;
  modelo:any;
  marca:any;
  remolque:any;

  tarjePro:any = [];
  apiSoat1:any = [];
  apiTecno1:any = [];
  fotovehi1:any = [];
  fotovehi2:any = [];
  fotovehi3:any = [];
  fotovehi4:any = [];

  fotoremol:any = [];
  tarjePror:any = [];

  dataVehiculo:any = {};
  fotoPerfil:any = [];

  dataClases:any = [];
  dataMarcas:any = [];
  dataCarroc:any = [];

  correo:any;
  celular:any;
  direccion:any;
  fecha_nacimeinto:any;
  nombre_contacto:any;
  celular_contacto:any;
  parentesco:any;

  codigoClase:any;
  filteredData:any = [];
  searchControl = new FormControl();

  keyword = 'name';
  itemTemplate:any;
  notFoundTemplate:any;

  public actionSheetButtons = [
    {
      text: 'Salir',
      role: 'destructive',
      data: {
        action: 'delete',
      },
    },
    {
      text: 'Cancelar',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];

  constructor(
    private formBuilder : FormBuilder,
    private loading: LoadingController,
    private user: UserService,
    private alertController: AlertController,
    private photo: PhotoService,
    private platform: Platform,
    private router: Router,
    private reg: RegistroService  ) 
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
        marca: ['', [Validators.required]],
        remolque: ['']
     });

     this.formNewDriver = formBuilder.group({
      correo: [''],
      celular: [''],
      direccion: [''],
      fecha_nacimeinto: [''],
      nombre_contacto: [''],
      celular_contacto: [''],
      parentesco: [''],
     })
    }

  ngOnInit() {
    this.platform.backButton.subscribeWithPriority(10, () => {
        this.router.navigate(['/login']);
    });

    this.getClases();
    this.getMarcas();

  }


  getClases() {
    this.reg.getClasevehiculo().subscribe(
      data => {
        if (data.status) {
          const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];

          this.dataClases.push({id:element.codigoVehclase, name:element.nombreSiatxxxx,tipo:element.tipoxxVehiculo});
        }
        // console.log(this.dataClases);
       }
      }
    )
  }

  getMarcas() {
    this.reg.getMarcas().subscribe(
      data => {
        if (data.status) {
          const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];

          this.dataMarcas.push({id:element.codigoVehmarca, name:element.nombreVehmarca});
        }
        // console.log(this.dataClases);
       }
      }
    )
  }

  getCarroc() {
    this.reg.getCarrocerias(this.codigoClase).subscribe(
      data => {
        if (data.status) {
          const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];

          this.dataCarroc.push({id:element.codigoVehcarro, name:element.nombrevehcarcl});
        }
        // console.log(this.dataClases);
       }
      }
    )
  }

  selectEvent(e:any) {
    this.formNewVehicle.patchValue({
      carroceria: ''
    });    

    if (e.tipo == "ARTICULADO") {
      this.articulado = true;
    }else{
      this.articulado = false;
    }

    this.codigoClase = e.id;
    this.clase_vehiculo = e.id
    this.getCarroc();
  }
  onChangeSearch(e:any) {

  }
  onFocused(e:any) {

  }


  selectMarca(e:any) {

  }
  onChangeMarca(e:any) {

  }
  onFocusedMarca(e:any) {

  }


  selectCarroceria (e:any) {

  }
  onChangeCarroceria (e:any) {

  }
  onFocusedCarroceria (e:any) {

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

      this.user.get3SLbyplaca(placa).subscribe(esl=> {

        this.presentAlert("Alerta","","Vehiculo ya registra en el app","Cerrar")
        this.checkVehicle = false;
        this.alertVehiculo = true;

    },
    err => {
      this.alertVehiculo = false;

    

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
            if (datos.tipo_vehiculo == "ARTICULADO") {
              this.articulado = true
            }else{
              this.articulado = false
            }
 
           //  this.getDataVehculo();
            
           this.newVehicle = false;
           this.checkVehicle = true;
 
          }else{
           this.newVehicle = true;
           this.checkVehicle = false;
           // this.modal.present();
           // this.presentAlert("Alerta","","Vehiculo","Cerrar")
          }
           
       }, 
       err => {
         console.log("ERROR", err);
       
       }
       );

    })

 

      loading.present();
    }
  }

  async searchConductor (e:any){

    if (e.target.value.length > 7) {
      let cedula = e.target.value
      this.cedula = e.target.value;
      const loading = await this.loading.create({
        message: 'Buscado Cedula...',
        duration: 2000,
      });

      this.user.get3SLbyCedula(cedula).subscribe(cc => {
          
        this.presentAlert("Alerta","","Conductor ya registra en el app","Cerrar")
        this.checkTercero = false;
        this.alertTercero = true;

       },
       err => {
        this.alertTercero = false;
        this.user.getTerceroByCedula(cedula).subscribe(data => {
          if (data.code == 200 && data.rows > 0) {
           console.log(data);
           const datos = data.data[0];

           this.correo = datos.email
           this.celular = datos.celular
           this.direccion = datos.direccion
           this.fecha_nacimeinto = datos.fecha_nacimiento
           this.nombre_contacto = datos.contacto_emergencia
           this.celular_contacto = datos.telefono_contacto
           this.parentesco = datos.parentesco_contacto



           this.newTercero = false;
           this.checkTercero = true;
          }else{
           this.newTercero = true;
           this.checkTercero = false;
          }
 
       }, 
       err => {
         console.log("ERROR", err);
       
       }
       );


       })






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
    if (!this.formNewVehicle.valid) {
      this.presentAlert("Error", "", "Todos los campos son requeridos", "Cerrar");
    }

    // console.log(this.tarjePro);
    

    this.saveDocument()
    



  }



  saveDocument() {

    this.jsonDocs = {
      files: [],
    };
    
    if (this.tarjePro.base64) {
      const dataDoc = {
        codigo: this.cedula,
        tipo: 'tarjePro',
        data64: this.tarjePro.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
  
    
    if (this.apiSoat1.base64) {
      const dataDoc = {
        codigo:this.cedula,
        tipo: 'soat1',
        data64: this.apiSoat1.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.apiTecno1.base64) {
      const dataDoc = {
        codigo:this.cedula,
        tipo: 'apiTecno1',
        data64: this.apiTecno1.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.fotovehi1.base64) {
      const dataDoc = {
        codigo:this.cedula,
        tipo: 'fotovehi1',
        data64: this.fotovehi1.data64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.fotovehi2.base64) {
      const dataDoc = {
        codigo:this.cedula,
        tipo: 'fotovehi2',
        data64: this.fotovehi2.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.fotovehi3.base64) {
      const dataDoc = {
        codigo:this.cedula,
        tipo: 'fotovehi3',
        data64: this.fotovehi3.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.fotovehi4.base64) {
      const dataDoc = {
        codigo:this.cedula,
        tipo: 'fotovehi4',
        data64: this.fotovehi4.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.fotoremol.base64) {
      const dataDoc = {
        codigo:this.cedula,
        tipo: 'fotoremol',
        data64: this.fotoremol.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.tarjePror.base64) {
      const dataDoc = {
        codigo:this.cedula,
        tipo: 'tarjePror',
        data64: this.tarjePror.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }

    console.log(this.jsonDocs);
    


    // this.user.cargaDocumentos(this.jsonDocs).subscribe(
    //   (data) => {
    //     return data.data;
    //   },
    //   (err) => {
    //     return err;
    //   }
    // )

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

  getTarPr() {
    this.photo.addNewToGallery('tarjeta-pro-veh').then((da) => {
      this.tarjePro = da;
    });
  }


  getfotoFrontal() {
    this.photo.addNewToGallery('foto-frontal').then((da) => {
      this.fotovehi1 = da;
    });
  }

  getfotoTrasera() {
    this.photo.addNewToGallery('foto-trasera').then((da) => {
      this.fotovehi2 = da;
    });
  }

  getfotoDer() {
    this.photo.addNewToGallery('foto-derecha').then((da) => {
      this.fotovehi3 = da;
    });
  }

  getfotoIzq() {
    this.photo.addNewToGallery('foto-izquierda').then((da) => {
      this.fotovehi4 = da;
    });
  }

  getfotoRemolque() {
    this.photo.addNewToGallery('remolque').then((da) => {
      this.fotoremol = da;
    });
  }

  getfotoTarPror() {
    this.photo.addNewToGallery('tarjeta-pro-rem').then((da) => {
      this.tarjePror = da;
    });
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
    this.photo.addNewToCamera('profile').then((da) => {
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
