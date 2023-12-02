import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../api/user.service';
import { AlertController, ModalController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import { PhotoService } from '../api/photo.service';
import { log } from 'console';
import { Foto } from '../models/photo.interface';
import * as e from 'cors';

@Component({
  selector: 'app-datos',
  templateUrl: './datos.page.html',
  styleUrls: ['./datos.page.scss'],
})
export class DatosPage implements OnInit {
  @ViewChild('modal1') modal1!: ModalController;
  @ViewChild('modal2') modal2!: ModalController;
  @ViewChild('modal3') modal3!: ModalController;
  @ViewChild('modal4') modal4!: ModalController;

  dataForm: any = FormGroup;
  dataChange: any = FormGroup;
  dataTercero: any;
  cedula: any;
  nombres: any;
  apellidos: any;
  correo: any;
  celular: any;
  direccion: any;
  fecha: any;
  ciudad: any;
  conductor: any;
  nombre_contacto: any;
  celular_contacto: any;
  parentesco: any;
  nombre: any;
  estado: any;
  placa: any;
  marca: any;
  carroceria: any;
  clase_vehiculo: any;
  clase_estado: any;
  licencia: any = [];
  licencia2: any = [];
  cedula1: any = [];
  cedula2: any = [];
  seguridad_social: any = [];
  jsonDocs: any = [];
  jsonPhoto: any = [];
  params: any = [];
  dataFotoUser: any = [];
  fotoUser: any;
  apiCedula1: any;
  apiCedula2: any;
  apiLicencia1: any = [];
  apiLicencia2: any = [];
  apiSoat1: any = [];
  apiSoat2: any;
  apiTecno1: any = [];
  apiTecno2: any;
  apiFoto1: any;
  apiFoto2: any;
  apiFoto3: any;
  apiFoto4: any;
  dataUser:any;
  fechaxTecnicox:any;
  fechaxSoatxxxx:any;
  fechaxLicencia:any;
  searchTerm:any;
  placaChange:any;
  claseNewVh:any;
  marcaVeh:any;
  carroceVeh:any;
  isDisabled:any = false;
  isDisabled1:any = false;
  isDisabled2:any = false;
  aplicaPropietario:any;
  aplicaTenedro:any;



  dataCorrect: any = 'http://54.176.177.178/checklist/dataCorrect.png';
  dataInCorrect: any = 'http://54.176.177.178/checklist/dataInCorrect.png';

  modulos = [
    {
      id: 1,
      tag: 'personal-data',
      nombre: 'Datos Personales',
      icon: 'http://54.176.177.178/checklist/person.png',
      desc: 'Nombres, Telefono, Direccion, ',
      status: this.dataCorrect,
    },
    {
      id: 2,
      tag: 'document-data',
      nombre: 'Documentos',
      icon: 'http://54.176.177.178/checklist/document.png',
      desc: 'Licencia de conduccion, Seguridad social',
      status: this.dataCorrect,
    },
    {
      id: 3,
      tag: 'vehicle-data',
      nombre: 'Vehiculo',
      icon: 'http://54.176.177.178/checklist/vehicle.png',
      desc: 'Placa, Marca, Clase, Carroceria',
      status: this.dataCorrect,
    },
  ];

  constructor(
    private menu: MenuController,
    private alertController: AlertController,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private photo: PhotoService

  ) {}

  get f() {
    return this.dataForm.controls;
  }

  ngOnInit() {
    
    this.userService.getConductor().subscribe((data) => {
      this.dataTercero = data.data[0];
      this.cedula = this.dataTercero.documento;
      this.nombres = this.dataTercero.nombre;
      this.apellidos = this.dataTercero.apellido;
      this.correo = this.dataTercero.email;
      this.celular = this.dataTercero.telefono_1;
      this.direccion = this.dataTercero.direccion;
      this.fecha = this.dataTercero.fecha_nacimiento;
      this.ciudad = this.dataTercero.ciudad_expedicion;


      if (this.dataTercero.foto) {
        this.fotoUser = this.dataTercero.foto;
      }
     },
     (err) => {
      this.modulos[0].status = this.dataInCorrect
     });

    this.userService.getTercero3sL().subscribe(
      (data) => {
        console.log(data['data']);

        const dataUser = data['data'][0];
        this.dataUser = data['data'];
        console.log(dataUser);



        this.cedula = dataUser.codigoTercerox;
        this.fotoUser = dataUser.apiFotoConductor;
        this.dataFotoUser['webviewPath'] = dataUser.apiFotoConductor;
        this.apiFoto1 = dataUser.apiFoto1;
        this.apiFoto2 = dataUser.apiFoto2;
        this.apiSoat1['webviewPath'] = dataUser.apiSoat1;
        this.apiTecno1['webviewPath'] = dataUser.apiTecnico1;
        this.cedula1['webviewPath'] = dataUser.apiCedula1;
        this.cedula2['webviewPath'] = dataUser.apiCedula2;
        this.licencia['webviewPath'] = dataUser.apiLicencia1;
        this.licencia2['webviewPath'] = dataUser.apiLicencia2;
        this.fechaxTecnicox = dataUser.fechaxTecnicox;
        this.fechaxSoatxxxx  = dataUser.fechaxSoatxxxx;
        this.fechaxLicencia = dataUser.fechaxLicencia;

      },
      (err) => {
        this.modulos[1].status = this.dataInCorrect
      }
    );

    this.userService.getUser().subscribe((data) => {
      data = data.view.data[0];
      console.log('*******',data);

      this.conductor = data.conductor;
      this.nombre = this.conductor.split(' ')[0];
      this.estado = data.estado;
      this.placa = data.placa;
      this.carroceria = data.carroceria;
      this.marca = data.marca;
      this.clase_vehiculo = data.clase_vehiculo;
      this.estado = data.estado;


      if (this.estado == 'ACTIVO') {
        this.clase_estado = 'badge text-bg-success';
      } else {
        this.clase_estado = 'badge text-bg-danger';
      }
    });

    this.dataForm = this.formBuilder.group({
      cedula: ['', [Validators.required]],
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      correo: ['', [Validators.required]],
      celular: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      fecha_nacimeinto: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      nombre_contacto: ['', [Validators.required]],
      celular_contacto: ['', [Validators.required]],
      parentesco: ['', [Validators.required]],
      placa: ['', [Validators.required]],
      clase_vehiculo: ['', [Validators.required]],
      marca: ['', [Validators.required]],
      carroceria: ['', [Validators.required]],
      fechaxTecnicox: ['', [Validators.required]],
      fechaxSoatxxxx: ['', [Validators.required]],
      fechaxLicencia: ['', [Validators.required]],

    });
  }

  onSubmit() {
    this.presentAlert('Envio de datos a 3SL', '', '', 'Cerrar');

    const dataSubmit = this.dataForm.value;

    let datparams2: { [key: string]: any } = {
      codigoTercerox: this.cedula,
      numeroPlacaxxx: this.placa,
      codigoRxxxxxxx: '',
      codigoPropieta: '',
      codigoTenedorx: '',
      indicaIgualpro: '',
      indicaIgualten: '',
      nombreContacto: dataSubmit.nombre_contacto,
      movilxContacto: dataSubmit.celular_contacto,
      parentContacto: dataSubmit.parentesco,
      nombreReferen1: '',
      movilxReferen1: '',
      empresReferen1: '',
      fechaxTecnicox: this.fechaxTecnicox,
      fechaxSoatxxxx: this.fechaxSoatxxxx,
      indicaProptene: '',
      numeroEstadoxx: '',
      estadoSiatxx: '',
      usuariCreacion: '',
      fechaxCreacion: '',
      ciudadCreacion: '',
      apiSeguridad: '',
      apiFotoConductor: this.fotoUser,
      apiTarjeta1: '',
      apiCedula1: this.cedula1,
      apiCedula2: this.cedula2,
      apiLicencia1: this.apiLicencia1,
      apiLicencia2: this.apiLicencia2,
      apiTarjeta2: '',
      apiSoat1: this.apiSoat1,
      apiSoat2: '',
      apiRecibo: '',
      apiTrailer: '',
      apiRegistroTrailer: '',
      apiCertificadoTrailer: '',
      apiFoto1: '',
      apiFoto2: '',
      apiFoto3: '',
      apiFoto4: '',
      apiTecnico1: this.apiTecno1,
      apiTecnico2: '',
      indicaApruebax: '',
      usuariApruebax: '',
      fechaxApruebax: '',
      indicaSatelital: '',
      fechaxLicencia: this.fechaxLicencia,
      nombreTercerox: this.nombre,
      apell1Tercerox: this.apellidos,
      apell2Tercerox: '',
      codigoCiudadxx: '',
      movilxTercerox: this.celular,
      emailxTercerox: this.correo,
      numeroModeloxx: '',
      numeroRepotenc: '',
      fechaxTecnimec: this.fechaxTecnicox,
      codigoVehmarca: '',
      codigoVehlinea: '',
      codigoVehclase: '',
      codigoVehcolor: '',
      codigoVehcarro: '',
      sateliFechaxxx: '',
    };


    // console.log(datparams2);

    this.userService.registroApiAldia(datparams2).subscribe(
      (data) => {
        console.log(data);
        this.presentAlert('Envio Exitoso', '', '', 'Cerrar');
      },
      (err) => {
        this.presentAlert('Error al enviar', '', err.message, 'Cerrar');
      }
    );
  }

  saveDataProfile() {
    this.savePhoto();

    const dataSubmit = this.dataForm.value;

    this.celular = dataSubmit.celular;
    this.direccion = dataSubmit.direccion;
    this.ciudad = dataSubmit.ciudad;
    this.nombre_contacto = dataSubmit.nombre_contacto;
    this.celular_contacto = dataSubmit.celular_contacto;
    this.parentesco = dataSubmit.parentesco;

    this.modal1.dismiss();
  }

  savePhoto() {
    this.jsonPhoto = {
      files: [],
    };

    if (this.dataFotoUser) {
      const dataDoc = {
        codigo: this.cedula,
        tipo: 'foto',
        data64: this.dataFotoUser.base64,
      };
      console.log(dataDoc);

      this.jsonPhoto.files.push(dataDoc);

      this.userService.cargaDocumentos(this.jsonPhoto).subscribe(
        (data) => {
          console.log(data);

          const files = data.data;
          if (files.foto) {
            this.fotoUser = 'http://54.215.78.160' + files.foto;
          }
        },
        (err) => {
          this.presentAlert(
            'Error al cargan documentos',
            '',
            'Por favor validar documentos',
            'Cerrar'
          );
          console.log(err);
          console.log(this.jsonPhoto);
        }
      );
    }
  }

  saveDocumentos() {

    const dataSubmit = this.dataForm.value;


    this.fechaxLicencia = dataSubmit.fechaxLicencia;

    this.jsonDocs = {
      files: [],
    };

    if (this.cedula1.base64) {
      const dataDoc = {
        codigo: this.cedula,
        tipo: 'cedula1',
        data64: this.cedula1.base64,
      };
      this.jsonDocs.files.push(dataDoc);
    }

    if (this.cedula2.base64) {
      const dataDoc = {
        codigo: this.cedula,
        tipo: 'cedula2',
        data64: this.cedula2.base64,
      };
      this.jsonDocs.files.push(dataDoc);
    }

    if (this.licencia.base64) {
      const dataDoc = {
        codigo: this.cedula,
        tipo: 'licencia',
        data64: this.licencia.base64,
      };
      this.jsonDocs.files.push(dataDoc);
    }

    if (this.licencia2.base64) {
      const dataDoc = {
        codigo: this.cedula,
        tipo: 'licencia2',
        data64: this.licencia2.base64,
      };
      this.jsonDocs.files.push(dataDoc);
    }

    this.userService.cargaDocumentos(this.jsonDocs).subscribe(
      (data) => {
        const files = data.data;

        if (files.cedula1) {
          this.apiCedula1 = 'http://54.215.78.160' + files.cedula1;
        }

        if (files.cedula2) {
          this.apiCedula2 = 'http://54.215.78.160' + files.cedula2;
        }

        if (files.licencia) {
          this.apiLicencia1 = 'http://54.215.78.160' + files.licencia;
        }

        if (files.licencia2) {
          this.apiLicencia2 = 'http://54.215.78.160' + files.licencia2;
        }

        this.modal2.dismiss();
      },
      (err) => {
        this.presentAlert(
          'Error al cargan documentos',
          '',
          'Por favor validar documentos',
          'Cerrar'
        );
        console.log(err);
        console.log(this.jsonDocs);
      }
    );
  }

  datosVehiculo() {

    const dataSubmit = this.dataForm.value;

    this.fechaxSoatxxxx = dataSubmit.fechaxSoatxxxx;
    this.fechaxTecnicox = dataSubmit.fechaxTecnicox;
    

    this.jsonDocs = {
      files: [],
    };

    if (this.apiSoat1.base64) {
      const dataDoc = {
        codigo: this.cedula,
        tipo: 'soat1',
        data64: this.apiSoat1.base64,
      };
      this.jsonDocs.files.push(dataDoc);
    }

    if (this.apiTecno1.base64) {
      const dataDoc = {
        codigo: this.cedula,
        tipo: 'tecno1',
        data64: this.apiTecno1.base64,
      };
      this.jsonDocs.files.push(dataDoc);
    }

    this.userService.cargaDocumentos(this.jsonDocs).subscribe(
      (data) => {
        const files = data.data;

        if (files.soat1) {
          this.apiSoat1 = 'http://54.215.78.160' + files.soat1;
        }

        if (files.tecno1) {
          this.apiTecno1 = 'http://54.215.78.160' + files.tecno1;
        }

        this.modal3.dismiss();
      },
      (err) => {
        this.presentAlert(
          'Error al cargan documentos Vehiculo',
          '',
          'Por favor validar documentos',
          'Cerrar'
        );
        console.log(err);
        console.log(this.jsonDocs);
      }
    );
  }

  upperPlaca($event: any) {
    this.searchTerm = $event.detail.value.toUpperCase();
  }

  changeVehicle() {

    this.dataChange = this.formBuilder.group({
      clase_vehiculo : ['', [Validators.required]],
      marca : ['', [Validators.required]],
      carroceria : ['', [Validators.required]]
    });

    var cedulaConductor = this.userService.getCedula();

    const placa =  document.getElementById("placa") as HTMLInputElement | null;
    const placaText = placa?.value

    if (placaText?.length  && placaText?.length > 5) {

      this.placaChange = placaText;

      this.claseNewVh = "";
      this.marcaVeh = "";
      this.carroceVeh = "";
      this.isDisabled = false;
      this.isDisabled1 = false;
      this.isDisabled2 = false;
      

    this.userService.get3SLbyplaca(placaText).subscribe(
      data => {

        console.log(data);
        

        var status = data.status;
        if (status) {

          var cedula =  data.data[0].codigoTercerox;
          if (cedula != cedulaConductor) {
            this.presentAlert("Alerta", "", "La placa que intenta registrar esta asociada a otro conductor.", "Cerrar")
          }
          
        }

      }
    )

    this.userService.getVehiculoByPlaca(placaText).subscribe(
      data => {

        const dataApi = data.view.data[0];
        
        if (dataApi.clase_vehiculo.length > 3) {
          this.claseNewVh = dataApi.clase_vehiculo;
          this.isDisabled = true;
        }

        if (dataApi.marca.length > 3) {
          this.marcaVeh = dataApi.marca;
          this.isDisabled1 = true;
        }

        if (dataApi.carroceria.length > 3) {
          this.carroceVeh = dataApi.carroceria;
          this.isDisabled2 = true;
        }
      
      }, 
      err => {
        this.presentAlert("Alerta", "", "No registran datos para esa placa", "Cerrar")
        this.claseNewVh = "";
        this.marcaVeh = "";
        this.carroceVeh = "";
      }

    )

  }
    
   

  }


  checkPropietario(e:any) {

    console.log(e.target.checked);
    
  }

  checkTenedor(e:any) {

    console.log(e.target.checked);
    
  }

  onChange() {
    const dataForm = this.dataChange.value;
    console.log(dataForm)
  }

  cargaDatosfinal(params: any) {}

  changeInput(type: any): any {
    const fecha = document.querySelector('#fecha input') as HTMLInputElement;

    fecha.type = type;
  }

  getCedula1() {
    this.photo.addNewToGallery('cedula1').then((da) => {
      this.cedula1 = da;
    });
  }

  getCedula2() {
    this.photo.addNewToGallery('cedula2').then((da) => {
      this.cedula2 = da;
    });
  }

  getLicencia1() {
    this.photo.addNewToGallery('licencia').then((da) => {
      this.licencia = da;
    });
  }

  getLicencia2() {
    this.photo.addNewToGallery('licencia2').then((da) => {
      this.licencia2 = da;
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

  loadProfile() {
    this.photo.addNewToCamera('profile').then((da) => {
      this.dataFotoUser = da;
    });
  }

  async presentAlert(
    title: String,
    subheader: String,
    desc: String,
    botton: String
  ) {
    const alert = await this.alertController.create({
      header: '' + title,
      subHeader: '' + subheader,
      message: '' + desc,
      buttons: ['' + botton],
    });
    await alert.present();
  }
}
