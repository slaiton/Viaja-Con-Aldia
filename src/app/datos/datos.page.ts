import { Component, ElementRef, Input, OnInit, ViewChild, Renderer2 } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../api/user.service';
import { AlertController, IonAccordionGroup, ModalController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import { PhotoService } from '../api/photo.service';
import { log } from 'console';
import { Foto } from '../models/photo.interface';
import * as e from 'cors';
import { RegistroService } from '../api/registro.service';
import {FaceApiService} from '../api/face-api.service';
import {VideoPlayerService} from '../api/video-player.service';
import { Photo } from '@capacitor/camera';




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
  @ViewChild('modal5') modal5!: ModalController;
  @ViewChild('modal6') modal6!: ModalController;
  @ViewChild('modal7') modal7!: ModalController;

  isModalOpen:any = false;
  isModalOpen1:any = false;
  isModalOpen2:any = false;
  isModalOpen3:any = false;
  isModalOpen4:any = false;
  isModalOpen5:any = false;
  isModalOpen6:any = false;
  isModalOpen7:any = false;

  // @ViewChild('videoElement',{ read: ElementRef, static: false }) videoElement: any;


  @ViewChild('accordionGroup', { static: true }) accordionGroup!: IonAccordionGroup;


  dataForm: any = FormGroup;
  dataChange: any = FormGroup;
  formDriver: any = FormGroup;
  formVehicle: any = FormGroup;
  formNewProp: any = FormGroup;
  formNewTene: any = FormGroup;
  formDocumentDriver:any = FormGroup;
  completeData:any = false;
  cedula: any;
  nombres: any;
  apellidos: any;
  correo: any;
  celular: any;
  direccion: any;
  fechaNacimiento: any;
  ciudad: any;
  nombreContacto: any;
  celularContacto: any;
  parentesco: any;
  nombre: any;
  estado: any;
  // placa: any;
  checkVehicle:any = false;
  checkDatos:any = false;
  checkDocs:any = false;
  openDocs:any;
  dataTercero: any = [];


  propietario:any = {
    cedula: '',
    nombres: '',
    apellidos: '',
    correo: '',
    celular: '',
    direccion: '',
    fechaNacimiento: '',
    nombreContacto: '',
    celularContacto: '',
    parentesco: ''
  }

  tenedor:any = {
    cedula: '',
    nombres: '',
    apellidos: '',
    correo: '',
    celular: '',
    direccion: '',
    fechaNacimeinto: '',
    nombreContacto: '',
    celularContacto: '',
    parentesco: '' 
  }

  vehiculo:any = {
    placa:'',
    cedulaProp: '',
    cedulaTene: '',
    claseVehiculo: '',
    codigoClase: '',
    carroceria: '',
    codigoCarroceria: '',
    fechaSoat: '',
    fechaTecno: '',
    color: '',
    codigoColor: '',
    linea: '',
    codigoLinea: '',
    modelo: '',
    repoten:'',
    articulado:'',
    marca: '',
    codigoMarca: '',
    remolque: '',
  }

  conductor:any = {
    cedula:'',
    nombres:'',
    apellidos:'',
    correo:'',
    celular:'',
    direccion:'',
    fechaNacimeinto:'',
    nombreContacto:'',
    celularContacto:'',
    parentesco:'',
    codigoParentesco:'',
    fechaSeguridad:'',
    fechaLicencia:''
  }


  marca: any;
  codigoMarca:any
  carroceria: any;
  codigoCarroceria:any;
  claseVehiculo: any;
  codigoClase:any;
  clase_estado: any;
  linea:any;
  codigoLinea:any;
  color:any;
  codigoColor:any;
  
  modelo:any;
  licencia: any = [];
  licencia2: any = [];
  cedula1: any = [];
  cedula2: any = [];
  seguridad_social: any = [];
  jsonDocs: any = [];
  jsonPhoto: any = [];
  params: any = [];
  dataFotoUser: any = [];
  fotoUser: any = false;
  apiCedula1: any;
  apiCedula2: any;
  apiLicencia1: any = [];
  apiLicencia2: any = [];
  soat1: any = [];
  apiSoat2: any;
  apiTecno1: any = [];
  apiTecno2: any;
  dataUser:any;
  fechaxTecnicox:any;
  fechaxSoatxxxx:any;
  fechaLicencia:any;
  fechaSeguridad:any;
  remolque:any;

  cedulaProp:any = false;
  cedulaTene:any = false;

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
  isPropietario:any = true
  isTenedor:any = true
  
  nombresTene:any;
  apellidosTene:any;
  correoTene:any;
  celularTene:any;
  direccionTene:any;
  fechaNacimeintoTene:any;

  nombresProp:any;
  apellidosProp:any;
  correoProp:any;
  celularProp:any;
  direccionProp:any;
  fechaNacimeintoProp:any;

  dataClases:any = [];
  dataMarcas:any = [];
  dataCarroc:any = [];
  dataLineas:any = [];
  dataColores:any = [];
  dataVehiculos:any = [];

  filteredData:any = [];
  searchControl = new FormControl();

  keyword = 'name';
  itemTemplate:any;
  notFoundTemplate:any;
  articulado:any =  false;
  token:any;

  documents_vehiculo:any;
  documents_conductor:any;

  
  // Terminos

  terms:any = {
    con_rec_pub: [],
    grd_pod_pub: [],
    rec_pub_gnr: [],
    vin_per_pub: [],
    per_tri_eco: [],
    gre_rec_pub: [],
    gre_rec_pub_pro: [],
    gre_rec_pub_ten: []
  }

  hubImag:any = {
    licencia1: {webviewPath: false},
    licencia2: {webviewPath: false},
    cedula1: {webviewPath: false},
    cedula2: {webviewPath: false},
    tarjePro: {webviewPath: false},
    soat1: {webviewPath: false},
    tecnomecanica: {webviewPath: false},
    fotoremol: {webviewPath: false},
    tarjePror: {webviewPath: false},
    cedula_pro1: {webviewPath: false},
    cedula_pro2: {webviewPath: false},
    cedula_ten1: {webviewPath: false},
    cedula_ten2: {webviewPath: false},
    fotovehi1: {webviewPath: false},
    fotovehi2: {webviewPath: false},
    fotovehi3: {webviewPath: false},
    fotovehi4: {webviewPath: false},
    fotoperfil: {webviewPath:false},
    seguridadsocial: {webviewPath:false}
  };


  dataCorrect: any = 'http://54.176.177.178/checklist/dataCorrect.png';
  dataInCorrect: any = 'http://54.176.177.178/checklist/dataInCorrect.png';

  modulos = [
    {
      id: 1,
      tag: 'personal-data',
      nombre: 'Datos Personales',
      icon: 'http://54.176.177.178/checklist/person.png',
      desc: 'Nombres, Telefono, Direccion, ',
      img: this.dataCorrect,
      status: true
    },
    {
      id: 2,
      tag: 'document-data',
      nombre: 'Documentos',
      icon: 'http://54.176.177.178/checklist/document.png',
      desc: 'Licencia de conduccion, Seguridad social',
      img: this.dataCorrect,
      status: true
    },
    {
      id: 3,
      tag: 'propietario-data',
      nombre: 'Propietario',
      icon: 'http://54.176.177.178/checklist/person.png',
      desc: 'Nombres, Telefono, Direccion',
      img: this.dataCorrect,
      status: false
    },
    {
      id: 4,
      tag: 'tenedor-data',
      nombre: 'Tenedor',
      icon: 'http://54.176.177.178/checklist/person.png',
      desc: 'Nombres, Telefono, Direccion',
      img: this.dataCorrect,
      status: false
    },
    {
      id: 5,
      tag: 'my-vehicles',
      nombre: 'Vehiculo',
      icon: 'http://54.176.177.178/checklist/vehicle.png',
      desc: 'Placa, Marca, Clase, Carroceria',
      img: this.dataCorrect,
      status: true
    }
    
  ];

  constructor(
    private menu: MenuController,
    private alertController: AlertController,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private photo: PhotoService,
    private reg: RegistroService
    

  ) {

    this.formDriver = formBuilder.group({
      nombres: ['',[Validators.required]],
      apellidos: ['',[Validators.required]],
      correo: ['',[Validators.required]], 
      celular: ['',[Validators.required]],
      direccion: ['',[Validators.required]],
      fechaNacimeinto: [''],
      nombreContacto: [''],
      celularContacto: [''],
      parentesco: [''],
     });


     this.formVehicle = this.formBuilder.group({
      claseVehiculo: ['', [Validators.required]],
      carroceria: ['', [Validators.required]],
      linea: ['', [Validators.required]],
      color: ['', [Validators.required]],
      fechaSoat: ['', [Validators.required]],
      fechaTecno: ['', [Validators.required]],
      marca: ['', [Validators.required]],
      modelo: ['', [Validators.required]],
      remolque: ['']
    });

    this.dataForm = this.formBuilder.group({
      cedula: ['', [Validators.required]],
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      correo: ['', [Validators.required]],
      celular: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      fechaNacimeinto: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      nombreContacto: ['', [Validators.required]],
      celularContacto: ['', [Validators.required]],
      parentesco: ['', [Validators.required]],
      placa: ['', [Validators.required]],
      claseVehiculo: ['', [Validators.required]],
      marca: ['', [Validators.required]],
      carroceria: ['', [Validators.required]],
      fechaTecno: ['', [Validators.required]],
      fechaSoat: ['', [Validators.required]],
      fechaLicencia: ['', [Validators.required]],

    });

    this.formNewProp = formBuilder.group({
      cedula: ['',[Validators.required]],
      nombres: ['',[Validators.required]],
      apellidos: ['',[Validators.required]],
      correo: ['',[Validators.required]], 
      celular: ['',[Validators.required]],
      direccion: ['',[Validators.required]],
      fechaNacimeinto: [''],
      nombreContacto: [''],
      celularContacto: [''],
      parentesco: [''],
     });


     this.formNewTene = formBuilder.group({
      cedula: ['',[Validators.required]],
      nombres: ['',[Validators.required]],
      apellidos: ['',[Validators.required]],
      correo: ['',[Validators.required]], 
      celular: ['',[Validators.required]],
      direccion: ['',[Validators.required]],
      fechaNacimiento: [''],
      nombreContacto: [''],
      celularContacto: [''],
      parentesco: [''],
     });

     this.formDocumentDriver = formBuilder.group({
      fechaLicencia: ['', [Validators.required]],
      fechaSeguridad: ['', [Validators.required]]
     });

     this.documents_vehiculo = this.userService.documents_vehiculo
     this.documents_conductor = this.userService.documents_conductor

  }

  get f() {
    return this.dataForm.controls;
  }

  ngOnInit() {

    this.token = this.userService.getToken();

    if (this.userService.getToken() == null) {
      this.router.navigate(['/login']);
    }

    // this.listenerEvents();


    this.getClases();
    this.getMarcas();
    this.getColores();


    this.userService.getTercero3sL(this.token).subscribe(
      (data) => {
        // console.log(data['data']);

        const dataUser = data['data'][0];
        this.dataUser = data['data'];
        // console.log(dataUser);



        this.conductor.cedula = dataUser.codigoTercerox;
        this.vehiculo.placa = dataUser.numeroPlacaxxx;
        this.conductor.nombres = dataUser.nombreTercerox;
        this.conductor.apellidos = dataUser.apell1Tercerox + ' ' + dataUser.apell2Tercerox
        this.conductor.correo = dataUser.emailxTercerox
        this.conductor.celular = dataUser.movilxTercerox
        this.conductor.direccion = dataUser.direccTercerox
        this.conductor.fechaNacimiento = dataUser.fechaxNacimien
        this.conductor.ciudad = dataUser.ciudadCreacion
        this.conductor.nombreContacto = dataUser.nombreContacto
        this.conductor.celularContacto = dataUser.movilxContacto
        this.conductor.parentesco = dataUser.parentContacto
        this.vehiculo.modelo = dataUser.numeroModeloxx
        this.hubImag.fotoperfil['webviewPath'] = dataUser.apiFotoConductor;
        this.hubImag.soat1['webviewPath'] = dataUser.apiSoat1;
        this.hubImag.fotoremol['webviewPath'] = dataUser.apiTrailer;
        this.hubImag.tarjePro['webviewPath'] = dataUser.apiTarjeta1
        this.hubImag.tecnomecanica['webviewPath'] = dataUser.apiTecnico1;
        this.hubImag.cedula1['webviewPath'] = dataUser.apiCedula1;
        this.hubImag.cedula2['webviewPath'] = dataUser.apiCedula2;
        this.hubImag.licencia1['webviewPath'] = dataUser.apiLicencia1;
        this.hubImag.licencia2['webviewPath'] = dataUser.apiLicencia2;
        this.hubImag.fotovehi1['webviewPath'] = dataUser.apiFoto1;
        this.hubImag.fotovehi2['webviewPath'] = dataUser.apiFoto2;
        this.hubImag.fotovehi3['webviewPath'] = dataUser.apiFoto3;
        this.hubImag.fotovehi4['webviewPath'] = dataUser.apiFoto4;
        this.vehiculo.fechaTecno = dataUser.fechaxTecnimec;
        this.vehiculo.fechaSoat  = dataUser.fechaxSoatxxxx;
        this.vehiculo.fechaLicencia = dataUser.fechaxLicencia;

         this.vehiculo.codigoMarca = dataUser.codigoVehmarca
         this.vehiculo.codigoLinea = dataUser.codigoVehlinea
         this.vehiculo.codigoClase = dataUser.codigoVehclase
         this.vehiculo.codigoColor = dataUser.codigoVehcolor
         this.vehiculo.codigoCarroceria = dataUser.codigoVehcarro
         this.vehiculo.marca = dataUser.nombreVehmarca
         this.vehiculo.carroceria = dataUser.nombreVehcarro
         this.vehiculo.claseVehiculo = dataUser.nombreSiatxxxx
         this.vehiculo.linea = dataUser.nombreVehlinea
         this.vehiculo.color = dataUser.nombreVehcolor
         //  = dataUser.nombreVehcolor

          if (dataUser.estadoSiatxx == 'ACTIVO')
              {
                this.clase_estado = 'badge text-bg-success';
                this.estado = 'ACTIVO'
              } else {
                this.clase_estado = 'badge text-bg-danger';
                this.estado = 'INACTIVO'
              }
          if(dataUser.codigoPropieta != null)
          {
            if (dataUser.codigoPropieta != this.cedula) {
              this.isPropietario = false;
              this.modulos[2].status = true;
              this.propietario.cedula = dataUser.codigoPropieta;
            }
            // this.checkPropietario()
          }

          if(dataUser.codigoTenedorx)
          {
            if (dataUser.codigoTenedorx != this.cedula) {
                const a:any = {target:{value:dataUser.codigoTenedorx}};
                a.target.value = dataUser.codigoTenedorx
                this.isTenedor = false;
                this.modulos[3].status = true;
                this.tenedor.cedula = dataUser.codigoTenedorx
                this.searchInfoTen(a);
            }
          }

        this.getCarroc(dataUser.codigoVehclase);
        this.getClaseLinea(dataUser.codigoVehlinea);
        // this.loadDocuments();
        this.getVehiculos(this.conductor.cedula).then(
          (data:any) => {
            if (data) {

              console.log(this.dataVehiculos);
              
              
            }else{

            }
          }
        )

      },
      (err) => {
        if (err.status == 401) {
          this.userService.logout();
        }
      }
    );

    // this.userService.getUser().subscribe((data) => {
    //   data = data.view.data[0];
    //   console.log('*******',data);
    //   this.conductor = data.conductor;
    //   this.nombre = this.conductor.split(' ')[0];
    //   this.estado = data.estado;
    //   this.placa = data.placa;
    //   this.carroceria = data.carroceria;
    //   this.marca = data.marca;
    //   this.claseVehiculo = data.claseVehiculo;
    //   this.estado = data.estado;
    // });

  }


  
  openDocumentController(doc:any, tipo:any)
  {

    if (tipo == 'cedula' && doc != ''){
      this.dataTercero['cedula'] = doc
      this.dataTercero['placa'] = '';
      this.dataTercero['docs'] = this.documents_conductor

      this.openDocs = true;

      
    }else if (tipo == 'placa' && doc != ''){
      this.dataTercero['placa'] = doc
      this.dataTercero['cedula'] = ''
      this.dataTercero['docs'] = this.documents_vehiculo

   
      this.openDocs = true;

    }

  }



  loadDocuments()
  {

    if (!this.hubImag.cedula1['webviewPath']) {

      this.getDocument(this.conductor.cedula, 'cedula1').then(
        (data:any) => {
          if(data['code'] !== '204')
          {
            this.hubImag.cedula1['webviewPath'] = data['data'];
          }
        }
      )
      
    }
    if (!this.hubImag.cedula2['webviewPath']) {

      this.getDocument(this.conductor.cedula, 'cedula2').then(
        (data1:any) => {
          if(data1['code'] !== '204')
          {
            this.hubImag.cedula2['webviewPath'] = data1['data'];
          }
        }
      )
      
    }
    if (!this.hubImag.licencia1['webviewPath']) {

      this.getDocument(this.conductor.cedula, 'licencia1').then(
        (data2:any) => {
          if(data2['code'] !== '204')
          {
            this.hubImag.licencia1['webviewPath'] = data2['data'];
          }
        }
      )
      
    }
    if (!this.hubImag.licencia2['webviewPath']) {

      this.getDocument(this.conductor.cedula, 'licencia2').then(
        (data3:any) => {
          if(data3['code'] !== '204')
          {
            this.hubImag.licencia2['webviewPath'] = data3['data'];
          }
        }
      )
      
    }
    if (!this.hubImag.seguridadsocial['webviewPath']) {

      this.getDocument(this.conductor.cedula, 'seguridadsocial').then(
        (data4:any) => {
          if(data4['code'] !== '204')
          {
            this.hubImag.seguridadsocial['webviewPath'] = data4['data'];
          }
        }
      )
      
    }


    if (!this.hubImag.fotoperfil['webviewPath']) {
    
    this.getDocument(this.vehiculo.placa,'fotoperfil').then(
      (data5:any) => {
        if (data5['code'] !== '204') {
          this.hubImag.fotoperfil['webviewPath'] = data5['data'];
        }
      }
      )
    }

     
    if (!this.hubImag.soat1['webviewPath']) {
      
      this.getDocument(this.vehiculo.placa,'soat1').then(
         (data6:any) => {
           if (data6['code'] !== '204') {
             this.hubImag.soat1['webviewPath'] = data6['data'];
            }
          }
          )
        }

     
        if (!this.hubImag.fotoremol['webviewPath']) {
      
      this.getDocument(this.vehiculo.placa,'fotoremol').then(
         (data7:any) => {
           if (data7['code'] !== '204') {
             this.hubImag.fotoremol['webviewPath'] = data7['data'];
            }
          }
          )
        }

     
        if (!this.hubImag.tarjePro['webviewPath']) {
      
      this.getDocument(this.vehiculo.placa,'tarjePro').then(
         (data8:any) => {
           if (data8['code'] !== '204') {
             this.hubImag.tarjePro['webviewPath'] = data8['data'];
            }
          }
          )
        }

     
        if (!this.hubImag.tecnomecanica['webviewPath']) {
      
      this.getDocument(this.vehiculo.placa,'tecnomecanica').then(
         (data9:any) => {
           if (data9['code'] !== '204') {
             this.hubImag.tecnomecanica['webviewPath'] = data9['data'];
            }
          }
          )
        }


     
        if (!this.hubImag.fotovehi1['webviewPath']) {
      
      this.getDocument(this.vehiculo.placa,'fotovehi1').then(
         (data:any) => {
           if (data['code'] !== '204') {
             this.hubImag.fotovehi1['webviewPath'] = data['data'];
            }
          }
          )
        }

     
        if (!this.hubImag.fotovehi2['webviewPath']) {
      
      this.getDocument(this.vehiculo.placa,'fotovehi2').then(
         (data:any) => {
           if (data['code'] !== '204') {
             this.hubImag.fotovehi2['webviewPath'] = data['data'];
            }
          }
          )
        }

     
        if (!this.hubImag.fotovehi3['webviewPath']) {
      
      this.getDocument(this.vehiculo.placa,'fotovehi3').then(
         (data:any) => {
           if (data['code'] !== '204') {
             this.hubImag.fotovehi3['webviewPath'] = data['data'];
            }
          }
          )
        }

     
        if (!this.hubImag.fotovehi4['webviewPath']) {
      
      this.getDocument(this.vehiculo.placa,'fotovehi4').then(
         (data:any) => {
           if (data['code'] !== '204') {
             this.hubImag.fotovehi4['webviewPath'] = data['data'];
            }
          }
          )
        }

     
  }

  ngAfterViewInit() {


  }

  setOpenVehiculo(isOpen: boolean) {
    this.isModalOpen3 = isOpen;
  }

  setOpenHubVehicles(isOpen: boolean)
  {
    this.isModalOpen7 = isOpen;
    this.modal7.dismiss()
  }


  selectEvent(e:any) {
    this.formVehicle.patchValue({
      carroceria: ''
    });    

    if (e.tipo == "ARTICULADO") {
      this.articulado = true;
    }else{
      this.articulado = false;
    }
    this.vehiculo.claseVehiculo = e.name;
    this.codigoClase = e.id;
    this.getCarroc(e.id);
  }
  onChangeSearch(e:any) {

  }
  onFocused(e:any) {

  }


  selectMarca(e:any) {
    this.codigoMarca = e.id
    this.marca = e.name
  }
  onChangeMarca(e:any) {

  }
  onFocusedMarca(e:any) {

  }


  selectLinea(e:any)
  {
    this.linea = e.name
    this.codigoLinea = e.id
  }
  onChangeLinea(e:any)
  {

  }
  onFocusedLinea(e:any)
  {

  }

  selectColor(e:any)
  {
    this.color = e.name
    this.codigoColor = e.id
  }

  onChangeColor(e:any)
  {

  }

  onFocusedColor(e:any)
  {

  }


  selectCarroceria (e:any) {
    this.codigoCarroceria = e.id;
    this.carroceria = e.name;

  }

  onChangeCarroceria (e:any) {

  }

  onFocusedCarroceria (e:any) {

  }

  onEditVehicle()
  {
    
  }


  getClases() {
    this.reg.getClasevehiculo(this.token).subscribe(
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
    this.reg.getMarcas(this.token).subscribe(
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

  getCarroc(id:any) {
    this.dataCarroc = []
    this.reg.getCarrocerias(id, this.token).subscribe(
      data => {
        if (data.status) {
          const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];

          this.dataCarroc.push({id:element.codigoVehcarro, name:element.nombrevehcarcl});
        }
        // console.log(this.dataCarroc);
       }
      }
    )
  }

  getClaseLinea(id:any) {
    this.dataLineas = []
    this.reg.getLineas(id,'', this.token).subscribe(
      data => {        
        if (data.status) {
          const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];

          this.dataLineas.push({id:element.codigoVehlinea, name:element.nombreVehlinea});
        }
        // console.log(this.dataLineas);
       }
      }
    )
  }


  getColores() {
    this.reg.getColores(this.token).subscribe(
      data => {
        if (data.status) {
          const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];

          this.dataColores.push({id:element.codigoVehcolor, name:element.nombreVehcolor});
        }
        // console.log(this.dataClases);
       }
      }
    )
  }

 async getVehiculos(cedula:any)
  {
    try {
      var status = true;
      const data = await this.reg.getVehiculos('', cedula, this.token).toPromise();
      if (data.status) {
        const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];

          if (dataArray[a].numeroPlacaxxx == this.vehiculo.placa) 
          { dataArray[a].status = true } else { dataArray[a].status = false }

          if(dataArray[a].hojaVidaApp) { dataArray[a].estado = 'En Uso'; dataArray[a].color = 'danger'; } 
          else { dataArray[a].estado = 'Disponible'; dataArray[a].color = 'success'; }

          this.getDocument(dataArray[a].numeroPlacaxxx, 'fotovehi1').then(
            (data:any) => {

              if (data.data) {
                dataArray[a].foto = data.data;
              }else{
                dataArray[a].foto = false;
              }

            }
          )

          
          this.dataVehiculos.push(dataArray[a]);
        }
        
        
      }else{
        status = false;
      }
      
      console.log(this.dataClases);


      return status;
      
    } catch (error) {
      return error
    }
      
  }

  onSubmit() {
    this.presentAlert('Envio de datos a 3SL', '', '', 'Cerrar');

    const dataSubmit = this.dataForm.value;

    let datparams2: { [key: string]: any } = {
      codigoTercerox: this.conductor.cedula,
      numeroPlacaxxx: this.vehiculo.placa,
      codigoRxxxxxxx: '',
      codigoPropieta: this.propietario.cedula,
      codigoTenedorx: this.tenedor.cedula,
      indicaIgualpro: this.isPropietario,
      indicaIgualten: this.isTenedor,
      nombreContacto: dataSubmit.nombreContacto,
      movilxContacto: dataSubmit.celularContacto,
      parentContacto: dataSubmit.parentesco,
      nombreReferen1: '',
      movilxReferen1: '',
      empresReferen1: '',
      fechaxTecnicox: this.vehiculo.fechaTecno,
      fechaxSoatxxxx: this.vehiculo.fechaSoat,
      indicaProptene: '',
      numeroEstadoxx: '',
      estadoSiatxx: '',
      usuariCreacion: '',
      fechaxCreacion: '',
      ciudadCreacion: '',
      apiSeguridad: '',
      apiFotoConductor: this.hubImag.fotoperfil.webviewPath,
      apiTarjeta1: this.hubImag.tarjePro.webviewPath,
      apiCedula1: this.hubImag.cedula1.webviewPath,
      apiCedula2: this.hubImag.cedula2.webviewPath,
      apiLicencia1: this.hubImag.licencia1.webviewPath,
      apiLicencia2: this.hubImag.licencia2.webviewPath,
      apiTarjeta2: '',
      apiSoat1: this.hubImag.soat1.webviewPath,
      apiSoat2: '',
      apiRecibo: '',
      apiTrailer: this.hubImag.fotoremol.webviewPath,
      apiRegistroTrailer: '',
      apiCertificadoTrailer: '',
      apiFoto1: this.hubImag.fotovehi1.webviewPath,
      apiFoto2: this.hubImag.fotovehi2.webviewPath,
      apiFoto3: this.hubImag.fotovehi3.webviewPath,
      apiFoto4: this.hubImag.fotovehi4.webviewPath,
      apiTecnico1: this.hubImag.tecnomecanica.webviewPath,
      apiTecnico2: '',
      indicaApruebax: '',
      usuariApruebax: '',
      fechaxApruebax: '',
      indicaSatelital: '',
      fechaxLicencia: this.vehiculo.fechaLicencia,
      nombreTercerox: this.conductor.nombre,
      apell1Tercerox: this.conductor.apellidos.split(' ')[0],
      apell2Tercerox: this.conductor.apellidos.split(' ')[1],
      codigoCiudadxx: '',
      movilxTercerox: this.conductor.celular,
      emailxTercerox: this.conductor.correo,
      numeroModeloxx: '',
      numeroRepotenc: '',
      fechaxTecnimec: this.vehiculo.fechaTecno,
      codigoVehmarca: '',
      codigoVehlinea: '',
      codigoVehclase: '',
      codigoVehcolor: '',
      codigoVehcarro: '',
      sateliFechaxxx: '',
      propietario: {
        indicaIgualpro: !this.isPropietario,
        codigoTercerox: this.propietario.cedula,
        nombreTercerox: this.propietario.nombres,
        apell1Tercerox: this.propietario.apellidos,
        apell2Tercerox: '',
        codigoCiudadxx: '',
        movilxTercerox: this.propietario.celular,
        emailxTercerox: this.propietario.correo,
        AppGrerecpubPro : this.terms['gre_rec_pub_pro'],
      },
      tenedor: {
        indicaIgualten: !this.isTenedor,
        codigoTercerox: this.propietario.cedula,
        nombreTercerox: this.propietario.nombres,
        apell1Tercerox: this.propietario.apellidos,
        apell2Tercerox: '',
        codigoCiudadxx: '',
        movilxTercerox: this.propietario.celular,
        emailxTercerox: this.propietario.correo,
        AppGrerecpubTen : this.terms['gre_rec_pub_ten'],
      }
    };


    console.log(this.hubImag.cedula1);

    this.userService.registroApiAldia(datparams2, this.token).subscribe(
      (data) => {
        console.log(data);
        this.presentAlert('Envio Exitoso', '', '', 'Cerrar');
      },
      (err) => {
        this.presentAlert('Error al enviar', '', err.message, 'Cerrar');
      }
    );
  }

 async onSubmitDriver()
  {

    if (this.hubImag.fotoperfil.base64) { 
      this.savePhoto();
    }

    var validate = true;
    var jsonApi:any = {};
    
     
    var text = "<ul>";
    for (const campo in this.formDriver.controls) 
    {
      if (this.formDriver.controls[campo].invalid) 
      {
         validate = false;
         text += "<li>" + campo.charAt(0).toUpperCase() + campo.slice(1) + "</li>";
      }else{
        // if (campo == 'fechaSeguridad' || campo == 'fechaLicencia') {
          // var fecha = new Date(this.formDriver.value[campo]); 
          // this.conductor[campo] = fecha.toISOString().split('T')[0];
          // jsonApi[campo] = fecha.toISOString().split('T')[0];
        // }else{
          this.conductor[campo] =  this.formDriver.value[campo] 
          jsonApi[campo] = this.formDriver.value[campo] 
        // }
      }

    }

    jsonApi['codigoTercerox'] = this.conductor.cedula
    jsonApi['conductor'] = true

    if (!validate) {
      this.checkDatos = true;
      
      this.presentAlert("Error", "Es necesario ingresar:", text, "Cerrar");
    }else{
      const data = await this.reg.sendDataTercero(jsonApi);
      console.log(data);
      this.modal1.dismiss();
    }

  }

  async onSubmitVehicle()
  {

    var validate = true;
    var jsonApi:any = {}
    jsonApi['placa'] = this.vehiculo.placa;

    var text = "<ul>";

    for (const campo in this.formVehicle.controls) 
    {
      if (this.formVehicle.controls[campo].invalid) 
      {
         validate = false;
         text += "<li>" + campo.charAt(0).toUpperCase() + campo.slice(1) + "</li>";
      }else{
        if (campo == 'fechaSoat' || campo == 'fechaTecno') {
          var fecha = new Date(this.formVehicle.value[campo]); 
          this.vehiculo[campo] = fecha.toISOString().split('T')[0];
          jsonApi[campo] = fecha.toISOString().split('T')[0];
        }else{
          this.vehiculo[campo] =  this.formVehicle.value[campo] 
          jsonApi[campo] = this.formVehicle.value[campo] 
        }
      }
    }

    if (this.vehiculo.articulado) {

      if (!this.formVehicle.value.remolque) {
        validate = false;
        text += "<li> Placa Remolque </li>";
      }else{
        this.vehiculo.remolque = this.formVehicle.value.remolque
      }


      if (!this.hubImag.tarjePror.webviewPath) {
        validate = false;
        text += "<li> Terjeta de propiedad Remolque </li>";
      }

      if (!this.hubImag.fotoremol.webviewPath) {
        validate = false;
        text += "<li> Foto Remolque </li>";
      }
    }
    

    if (!this.hubImag.tarjePro.webviewPath) {
      validate = false;
      text += "<li> Terjeta de propiedad </li>";
    }

    if (!this.hubImag.soat1.webviewPath) {

      validate = false;
      text += "<li> Soat </li>";
    }

    if (!this.hubImag.tecnomecanica.webviewPath) {
      validate = false;
      text += "<li> Tecnomecanica </li>";
    }

    if (!this.hubImag.fotovehi1.webviewPath) {
      validate = false;
      text += "<li> Foto Frontal </li>";
    }

    if (!this.hubImag.fotovehi2.webviewPath) {
      validate = false;
      text += "<li> Foto Lateral </li>";
    }

    if (!this.hubImag.fotovehi3.webviewPath) {
      validate = false;
      text += "<li> Foto Motor </li>";
    }

    if (!this.hubImag.fotovehi4.webviewPath) {
      validate = false;
      text += "<li> Foto Posterior </li>";
    }

    text += "</ul>";


    if (validate) {
      const envio = await this.reg.sendDataVehiculo(jsonApi);
      this.checkVehicle = true;
      this.saveDocumentVehicle();
    }else{
      this.checkVehicle = false;  
      this.presentAlert("Error", "Es necesario ingresar:", text, "Cerrar");
    }

  }


  saveDocumentVehicle()
  {
    this.jsonDocs = {
      files: [],
    };

    if (this.hubImag.tarjePro.base64) {
      const dataDoc = {
        codigo: this.vehiculo.placa,
        tipo: 'tarjePro',
        data64: this.hubImag.tarjePro.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }

    
    if (this.hubImag.soat1.base64) {
      const dataDoc = {
        codigo:this.vehiculo.placa,
        tipo: 'soat1',
        data64: this.hubImag.soat1.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    
    if (this.hubImag.tecnomecanica.base64) {
      const dataDoc = {
        codigo:this.vehiculo.placa,
        tipo: 'tecnomecanica',
        data64: this.hubImag.tecnomecanica.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.hubImag.fotovehi1.base64) {
      const dataDoc = {
        codigo:this.vehiculo.placa,
        tipo: 'fotovehi1',
        data64: this.hubImag.fotovehi1.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.hubImag.fotovehi2.base64) {
      const dataDoc = {
        codigo:this.vehiculo.placa,
        tipo: 'fotovehi2',
        data64: this.hubImag.fotovehi2.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.hubImag.fotovehi3.base64) {
      const dataDoc = {
        codigo:this.vehiculo.placa,
        tipo: 'fotovehi3',
        data64: this.hubImag.fotovehi3.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.hubImag.fotovehi4.base64) {
      const dataDoc = {
        codigo:this.vehiculo.placa,
        tipo: 'fotovehi4',
        data64: this.hubImag.fotovehi4.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.hubImag.fotoremol.base64) {
      const dataDoc = {
        codigo:this.vehiculo.placa,
        tipo: 'fotoremol',
        data64: this.hubImag.fotoremol.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.hubImag.tarjePror.base64) {
      const dataDoc = {
        codigo:this.vehiculo.placa,
        tipo: 'tarjePror',
        data64: this.hubImag.tarjePror.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }

    if (this.isPropietario) {

    }

    // console.log(this.jsonDocs);


    
    this.userService.cargaDocumentos(this.jsonDocs).subscribe(
      (data) => {
        const files = data.data;

        if (files.soat1) {
          this.hubImag.soat1.webviewPath = files.soat1;
       }

       if (files.tecno1) {
          this.hubImag.tecno1.webviewPath = files.tecno1;
       }

       if (files.tarjePro) {
         this.hubImag.tarjePro.webviewPath = files.tarjePro;
       }
       
       if (files.soat1) {
         this.hubImag.soat1.webviewPath = files.soat1;
       }
       
       if (files.tecno) {
         this.hubImag.tecno.webviewPath = files.tecno;
       }
       
       if (files.fotovehi1) {
         this.hubImag.fotovehi1.webviewPath = files.fotovehi1;
       }
       
       if (files.fotovehi2) {
         this.hubImag.fotovehi2.webviewPath = files.fotovehi2;
       }
       
       if (files.fotovehi3) {
         this.hubImag.fotovehi3.webviewPath = files.fotovehi3;
       }
       
       if (files.fotovehi4) {
         this.hubImag.fotovehi4.webviewPath = files.fotovehi4;
       }
       
       if (files.fotoremol) {
         this.hubImag.fotoremol.webviewPath = files.fotoremol;
       }
       
       if (files.tarjePror) {
         this.hubImag.tarjePror.webviewPath = files.tarjePror;
       }


      },
      (err) => {
        return err;
      },
      () => {
        this.setOpenVehiculo(false);
      }
    )
    
  }


  onSubmitNewProp() {
  }


  onSubmitNewTen() {
  }




  checkTenedor() {
    var item = document.getElementById('tenedor') as HTMLIonCardElement; 

    if (!this.isTenedor) { 
      item.classList.add('select-card');
      this.isTenedor = true;
      this.modulos[3].status = false;
      this.formNewTene.reset()
      if (this.isPropietario) {
        this.completeData = true;
      }
    }else{
      item.classList.remove('select-card');
      this.isTenedor = false;
      this.completeData = false;
      this.modulos[3].status = true;
    }

  }

  checkPropietario() {
    var item = document.getElementById('propietario') as HTMLIonCardElement;
    

    if (!this.isPropietario) { 
      item.classList.add('select-card');
      this.isPropietario = true;
      this.modulos[2].status = false;
      this.formNewProp.reset()
      if (this.isTenedor) {
        this.completeData = true;
      }
    }else{
      item.classList.remove('select-card');
      this.isPropietario = false;
      this.completeData = false;
      this.modulos[2].status = true
      ;
    }
    
  }

   async savePhoto() {


    if (this.hubImag.fotoperfil.base64) {


      const base64Image = this.hubImag.fotoperfil.base64;
      // const cropX = 100; // Coordenada x de recorte
      // const cropY = 100; // Coordenada y de recorte
      // const cropWidth = 00; // Ancho de recorte
      // const cropHeight = 300; // Alto de recorte
      // const newWidth = 200; // Nuevo ancho
      // const newHeight = 200; // Nuevo alto
      const desiredSizeX = 350;
      const desiredSizeY = 350;
      
  
      try {
        
        const processedImageDataUrl = await this.photo.processAndCropImage(base64Image, desiredSizeX, desiredSizeY, 0);
        console.log('Imagen procesada:', processedImageDataUrl);
        this.hubImag.fotoperfil.webviewPath = processedImageDataUrl;

        const dataPhoto:Photo = {
          webPath:processedImageDataUrl, 
          format:'jpeg', 
          saved:false
        };

        const data64 = await this.photo.readAsBase64(dataPhoto)
        // console.log(data64);
        this.hubImag.fotoperfil.base64 = data64;

        const jsonPhoto = {
          files: [{
            codigo: this.conductor.cedula,
            tipo: 'foto',
            data64: this.hubImag.fotoperfil.base64,
          }],
        };
        
        this.saveFotoApi(jsonPhoto)
        
      } catch (error) {
        console.error('Error al procesar la imagen:', error);
      }

    }
  }

  saveFotoApi(jsonPhoto:any){
    this.userService.cargaDocumentos(jsonPhoto).subscribe(
      (data) => {
        console.log(data);

        const files = data.data;
        if (files.foto) {
          this.hubImag.fotoperfil.webviewPath = files.foto;
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
        console.log(jsonPhoto);
      }
    );
  }

  saveDocumentos() {
    var validate =  true;
    var text =  "";

    // const dataSubmit = this.formDocumentDriver.value;
    // console.log(dataSubmit);

    text += "<ul>";

    console.log(this.formDocumentDriver.controls);
    for (const campo in this.formDocumentDriver.controls) 
    {
      if (this.formDocumentDriver.controls[campo].invalid) 
      {
         validate = false;
         console.log(campo);
         
         text += "<li>" + campo.charAt(0).toUpperCase() + campo.slice(1) + "</li>";
      }else{
        this.conductor[campo] = this.formDocumentDriver.value[campo]
      }

    }

    this.jsonDocs = {
      files: [],
    };

    if (this.hubImag.cedula1.base64) {
      const dataDoc = {
        codigo: this.conductor.cedula,
        tipo: 'cedula1',
        data64: this.hubImag.cedula1.base64,
      };
      this.jsonDocs.files.push(dataDoc);
    }

    if (this.hubImag.cedula2.base64) {
      const dataDoc = {
        codigo: this.conductor.cedula,
        tipo: 'cedula2',
        data64: this.hubImag.cedula2.base64,
      };
      this.jsonDocs.files.push(dataDoc);
    }

    if (this.hubImag.licencia1.base64) {
      const dataDoc = {
        codigo: this.conductor.cedula,
        tipo: 'licencia1',
        data64: this.hubImag.licencia1.base64,
      };
      this.jsonDocs.files.push(dataDoc);
    }

    if (this.hubImag.licencia2.base64) {
      const dataDoc = {
        codigo: this.conductor.cedula,
        tipo: 'licencia2',
        data64: this.hubImag.licencia2.base64,
      };
      this.jsonDocs.files.push(dataDoc);
    }

    if (this.hubImag.seguridadsocial.base64) {
      const dataDoc = {
        codigo: this.conductor.cedula,
        tipo: 'seguridadsocial',
        data64: this.hubImag.seguridadsocial.base64,
      };
      this.jsonDocs.files.push(dataDoc);
    }

    text += "<ul>";

    if (!validate) {
      this.presentAlert(
        'Error',
        'Es Necesario ingresar: ',
        text,
        'Cerrar'
      );
      return;
    }

    this.userService.cargaDocumentos(this.jsonDocs).subscribe(
      (data) => {
        const files = data.data;

        if (files.cedula1) {
          this.hubImag.cedula1.webviewPath = files.cedula1;
        }

        if (files.cedula2) {
          this.hubImag.cedula2.webviewPath = files.cedula2;
        }

        if (files.licencia1) {
          this.hubImag.licencia1.webviewPath = files.licencia1;
        }

        if (files.licencia2) {
          this.hubImag.licencia2.webviewPath = files.licencia2;
        }

        if (files.seguridadsocial) {
          this.hubImag.seguridadsocial.webviewPath = files.seguridadsocial;
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

    this.vehiculo.fechaSoat = dataSubmit.fechaSoat;
    this.vehiculo.fechaTecno = dataSubmit.fechaTecno;
    

    this.jsonDocs = {
      files: [],
    };

    if (this.hubImag.soat1.base64) {
      const dataDoc = {
        codigo: this.cedula,
        tipo: 'soat1',
        data64: this.hubImag.soat1.base64,
      };
      this.jsonDocs.files.push(dataDoc);
    }

    if (this.hubImag.apiTecno1.base64) {
      const dataDoc = {
        codigo: this.cedula,
        tipo: 'tecno1',
        data64: this.hubImag.apiTecno1.base64,
      };
      this.jsonDocs.files.push(dataDoc);
    }

    this.userService.cargaDocumentos(this.jsonDocs).subscribe(
      (data) => {
        const files = data.data;

        if (files.soat1) {
          this.hubImag.soat1.webviewPath = files.soat1;
        }

        if (files.tecno1) {
          this.hubImag.apiTecno1.webviewPath = files.tecno1;
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
      claseVehiculo : ['', [Validators.required]],
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
      

    this.userService.get3SLbyplaca(placaText, this.token).subscribe(
      data => {

        console.log(data);
        

        var status = data.status;
        if (status) {

          var cedula =  data.data[0].codigoTercerox;
          if (cedula != cedulaConductor) {
            this.presentAlert("Alerta", "", "La placa que intenta registrar esta asociada a otro conductor.", "Cerrar")
          }
          
        }

      },
      err => {
        if (err.status == 401) {
          this.userService.logout();
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


  searchInfoVeh(clase:any,marca:any,carro:any)
  {

    const objeto2 =  this.dataClases.find((objeto2:any) => objeto2.name === clase);
    this.codigoClase = objeto2?.id;
    
    const objeto1 =  this.dataMarcas.find((objeto1:any) => objeto1.name === marca);
    this.codigoMarca = objeto1?.id;

    this.getCarroc(objeto2?.id);
    var carropro = carro.toString();
    carropro = carropro.replace(/\s/g, "");
    const objeto =  this.dataCarroc.find((objeto:any) => objeto.name === carropro);
    if (objeto == undefined) {
      this.carroceria = ''
      this.codigoCarroceria = ''
      this.formVehicle.patchValue({
        carroceria: ''
      })

    return false;
      
    }else{
      this.codigoCarroceria = objeto?.id;
      this.carroceria = carropro;
    }

    return true;
    
  }

  searchInfoTen(e:any)
  {
    const cedula = e.target.value
    if (cedula.length > 6) {
      this.userService.getTerceroByCedula(cedula).subscribe(
        data => {
          console.log(data);
          
          const datos = data.data[0];

          this.tenedor.cedula = cedula;
          this.tenedor.nombres = datos.nombre
          this.tenedor.apellidos = datos.apellido
          this.tenedor.correo = datos.email
          this.tenedor.celular = datos.celular
          this.tenedor.direccion = datos.direccion
          this.tenedor.fechaNacimiento = datos.fecha_nacimiento
        },
        err => {

        }
      )
      
    }

  }


  searchInfoPro(e:any)
  {
    var validate = true;
    const cedula = e.target.value
    if (cedula.length > 6) {
      this.userService.getTerceroByCedula(cedula).subscribe(
        data => {
          console.log(data);
          
          const datos = data.data[0];

          this.propietario.cedula = cedula;
          this.propietario.nombres = datos.nombre
          this.propietario.Apellidos = datos.apellido
          this.propietario.correo = datos.email
          this.propietario.celular = datos.celular
          this.propietario.direccion = datos.direccion
          this.propietario.fechaNacimiento = datos.fecha_nacimiento

          if (datos.cedula1) {
            this.hubImag.cedula_pro1.webviewPath = datos.cedula1
          }else{
            validate = false;
          }

          if (datos.cedula2) {
            this.hubImag.cedula_pro2.webviewPath = datos.cedula2
          }else{
            validate = false;
          }

        },
        err => {

          this.formNewProp.reset()

        }
      )
      
    }

  }


  validateDocument(e:any){

      // this.accordionGroup.toggle(0)
      
      // console.log(nativeEl);
      
  }


  async getDocument(codigo:any, tipo:any): Promise<any>
  {
    const resp:any = await this.photo.getFotoTercero(codigo,tipo).toPromise()
    return resp;
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
  
  addToGalery(name:any) {
    this.photo.addNewToGallery(name).then((da) => {
      this.hubImag[name] = da;
    });
  }

  addToCamera(name:any){
    this.photo.addNewToCamera(name).then((da) => {
      this.hubImag[name] = da;
    });
  }


  loadProfile() {
    this.photo.addNewToCameraProfile('profile').then((da) => {
      this.hubImag.fotoperfil = da;
      this.fotoUser = true;
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
