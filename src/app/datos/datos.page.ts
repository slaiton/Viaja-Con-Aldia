import { Component, ElementRef, Input, OnInit, ViewChild, Renderer2, Output, EventEmitter } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../api/user.service';
import { ActionSheetController, AlertController, IonAccordionGroup, LoadingController, ModalController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import { PhotoService } from '../api/photo.service';
import { log } from 'console';
import { Foto } from '../models/photo.interface';
import * as e from 'cors';
import { RegistroService } from '../api/registro.service';
import { FaceApiService } from '../api/face-api.service';
import { VideoPlayerService } from '../api/video-player.service';
import { Photo } from '@capacitor/camera';
import { forEach } from 'lodash';
import { Platform } from '@ionic/angular';
import { AppComponent } from '../app.component';
import { StatusBar, Style } from '@capacitor/status-bar';
import * as faceapi from 'face-api.js';
import { AuthService } from '../api/auth.service';




@Component({
  selector: 'app-datos',
  templateUrl: './datos.page.html',
  styleUrls: ['./datos.page.scss'],
})
export class DatosPage implements OnInit {

  private canDismissOverride = false;
  presentingElement: any = undefined
  @Output() dismissChange = new EventEmitter<boolean>();

  @ViewChild('modal1') modal1!: ModalController;
  @ViewChild('modal2') modal2!: ModalController;
  @ViewChild('modal3') modal3!: ModalController;
  @ViewChild('modal4') modal4!: ModalController;
  @ViewChild('modal5') modal5!: ModalController;
  @ViewChild('modal6') modal6!: ModalController;
  @ViewChild('modal7') modal7!: ModalController;
  @ViewChild('videoContainer', { static: false }) videoContainer!: ElementRef;
  isModalOpen: any = false;
  isModalOpen1: any = false;
  isModalOpen2: any = false;
  isModalOpen3: any = false;
  isModalOpen4: any = false;
  isModalOpen5: any = false;
  isModalOpen6: any = false;
  isModalOpen7: any = false;

  startCamera: any = false;

  // @ViewChild('videoElement',{ read: ElementRef, static: false }) videoElement: any;


  @ViewChild('accordionGroup', { static: true }) accordionGroup!: IonAccordionGroup;
  @Input() dataTercero: any = [];


  dataForm: any = FormGroup;
  dataChange: any = FormGroup;
  formDriver: any = FormGroup;
  formVehicle: any = FormGroup;
  formNewProp: any = FormGroup;
  formNewTene: any = FormGroup;
  formDocumentDriver: any = FormGroup;
  completeData: any = false;
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
  checkVehicle: any = false;
  checkDatos: any = false;
  checkDocs: any = false;
  hiddenDocs: any = true;
  numDocs: any = 0;
  loadingData: any;

  public openDocs: boolean = false;
  public editDataItem: any | undefined = undefined;
  public isNew: boolean | undefined = undefined;

  documents_conductor: any = [];
  documents_vehiculo: any = [];


  propietario: any = {
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

  tenedor: any = {
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

  vehiculo: any = {
    placa: '',
    cedulaProp: '',
    nombreProp: '',
    cedulaTene: '',
    nombreTene: '',
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
    repoten: '',
    articulado: '',
    marca: '',
    codigoMarca: '',
    remolque: '',
    empresaSatelital: '',
    codigoSatelital: '',
    usuarioSatelital: '',
    claveSatelital: '',
    cuentaSatelital: '',
    isPropietario: true,
    isTenedor: true
  }

  conductor: any = {
    cedula: '',
    nombres: '',
    apellidos: '',
    correo: '',
    celular: '',
    direccion: '',
    fechaNacimiento: '',
    nombreContacto: '',
    celularContacto: '',
    parentesco: '',
    codigoParentesco: '',
    fechaSeguridad: '',
    fechaLicencia: ''
  }


  marca: any;
  codigoMarca: any
  carroceria: any;
  codigoCarroceria: any;
  claseVehiculo: any;
  codigoClase: any;
  clase_estado: any;
  linea: any;
  codigoLinea: any;
  color: any;
  codigoColor: any;

  modelo: any;
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
  dataUser: any;
  fechaxTecnicox: any;
  fechaxSoatxxxx: any;
  fechaLicencia: any;
  fechaSeguridad: any;
  remolque: any;

  cedulaProp: any = false;
  cedulaTene: any = false;

  searchTerm: any;
  placaChange: any;
  claseNewVh: any;
  marcaVeh: any;
  carroceVeh: any;
  isDisabled: any = false;
  isDisabled1: any = false;
  isDisabled2: any = false;
  aplicaPropietario: any;
  aplicaTenedro: any;


  nombresTene: any;
  apellidosTene: any;
  correoTene: any;
  celularTene: any;
  direccionTene: any;
  fechaNacimientoTene: any;
  newTenedor: any;
  checkTened: any;
  incompletoTenedor: any;
  alertTened: any;

  nombresProp: any;
  apellidosProp: any;
  correoProp: any;
  celularProp: any;
  direccionProp: any;
  fechaNacimientoProp: any;
  newPropiet: any;
  checkPropi: any;
  incompletoPropiet: any;
  alertPropi: any;

  dataClases: any = [];
  dataMarcas: any = [];
  dataCarroc: any = [];
  dataLineas: any = [];
  dataColores: any = [];
  dataParentes: any = [];
  dataVehiculos: any = [];
  dataSatelital: any = [];

  filteredData: any = [];
  searchControl = new FormControl();

  keyword = 'name';
  itemTemplate: any;
  notFoundTemplate: any;
  articulado: any = false;
  token: any;

  statusDoc: any;
  docs: any = []





  // Terminos

  terms: any = {
    con_rec_pub: [],
    grd_pod_pub: [],
    rec_pub_gnr: [],
    vin_per_pub: [],
    per_tri_eco: [],
    gre_rec_pub: [],
    gre_rec_pub_pro: [],
    gre_rec_pub_ten: []
  }

  hubImag: any = {
    licencia1: { webviewPath: false },
    licencia2: { webviewPath: false },
    cedula1: { webviewPath: false },
    cedula2: { webviewPath: false },
    tarjePro1: { webviewPath: false },
    tarjePro2: { webviewPath: false },
    soat1: { webviewPath: false },
    tecnomecanica: { webviewPath: false },
    remolque: {
      fotoremol: { webviewPath: false },
      tarjePro1: { webviewPath: false },
      tarjePro2: { webviewPath: false },
    },
    cedula_pro1: { webviewPath: false },
    cedula_pro2: { webviewPath: false },
    cedula_ten1: { webviewPath: false },
    cedula_ten2: { webviewPath: false },
    fotovehi1: { webviewPath: false },
    fotovehi2: { webviewPath: false },
    fotovehi3: { webviewPath: false },
    fotovehi4: { webviewPath: false },
    fotoperfil: { webviewPath: false },
    seguridadsocial: { webviewPath: false }
  };


  dataCorrect: any = 'https://3slogistica.com/tr_aldia/files/checklist/dataCorrect.png';
  dataInCorrect: any = 'https://3slogistica.com/tr_aldia/files/checklist/dataInCorrect.png';

  modulos = [
    {
      id: 1,
      tag: 'personal-data',
      nombre: 'Datos Personales',
      icon: 'https://3slogistica.com/tr_aldia/files/checklist/person.png',
      desc: 'Nombres, Telefono, Direccion, ',
      img: this.dataCorrect,
      status: true
    },
    {
      id: 2,
      tag: false,
      nombre: 'Documentos',
      icon: 'https://3slogistica.com/tr_aldia/files/checklist/document.png',
      desc: 'Cerdula, Licencia de conduccion, Seguridad social',
      img: this.dataCorrect,
      status: true
    },
    {
      id: 3,
      tag: 'propietario-data',
      nombre: 'Propietario',
      icon: 'https://3slogistica.com/tr_aldia/files/checklist/person.png',
      desc: 'Nombres, Telefono, Direccion',
      img: this.dataCorrect,
      status: false
    },
    {
      id: 4,
      tag: 'tenedor-data',
      nombre: 'Tenedor',
      icon: 'https://3slogistica.com/tr_aldia/files/checklist/person.png',
      desc: 'Nombres, Telefono, Direccion',
      img: this.dataCorrect,
      status: false
    },
    {
      id: 5,
      tag: 'my-vehicles',
      nombre: 'Vehiculo',
      icon: 'https://3slogistica.com/tr_aldia/files/checklist/vehicle.png',
      desc: 'Placa, Marca, Clase, Carroceria',
      img: this.dataCorrect,
      status: false
    }

  ];

  constructor(
    private menu: MenuController,
    private alertController: AlertController,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private photo: PhotoService,
    private reg: RegistroService,
    private loading: LoadingController,
    private app: AppComponent,
    private actionSheetCtrl: ActionSheetController,
    private platform: Platform,
    public auth: AuthService,
  ) {

    this.initializeApp()

    this.formDriver = formBuilder.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      correo: ['', [Validators.required]],
      celular: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      nombreContacto: ['', [Validators.required]],
      celularContacto: ['', [Validators.required]],
      parentesco: ['', [Validators.required]],
      fechaSeguridad: [],
      fechaLicencia: []
    });


    this.formVehicle = this.formBuilder.group({
      claseVehiculo: ['', [Validators.required]],
      carroceria: ['', [Validators.required]],
      linea: ['', [Validators.required]],
      color: ['', [Validators.required]],
      fechaSoat: [''],
      fechaTecno: [''],
      marca: ['', [Validators.required]],
      modelo: ['', [Validators.required]],
      remolque: [''],
      empresaSatelital: ['', [Validators.required]],
      usuarioSatelital: ['', Validators.required],
      claveSatelital: ['', Validators.required],
      cuentaSatelital: [''],
      isPropietario: [''],
      propietario: [''],
      codigoPropietario: [''],
      isTenedor: [''],
      tenedor: [''],
      codigoTenedor: ['']
    });

    this.dataForm = this.formBuilder.group({
      cedula: ['', [Validators.required]],
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      correo: ['', [Validators.required]],
      celular: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
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
      cedula: ['', [Validators.required]],
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      correo: ['', [Validators.required]],
      celular: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      fechaNacimiento: [''],
      nombreContacto: [''],
      celularContacto: [''],
      parentesco: [''],
    });


    this.formNewTene = formBuilder.group({
      cedula: ['', [Validators.required]],
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      correo: ['', [Validators.required]],
      celular: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
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

  async ngOnInit() {

    this.token = this.userService.getToken();
    this.conductor.cedula = this.userService.getCedula()
    this.vehiculo.placa = this.userService.getPlaca();
    this.numDocs = 0;

    await this.userService.validateCap()

    // this.startVideo()

    if (this.userService.getToken() == null) {
      this.router.navigate(['/login']);
    }

    const loadingData = await this.loading.create({
      message: 'Generando Datos...',
    });

    loadingData.present();

    var validate = true;
    var validateDocs = true;
    var mensaje = '<ul>';


    this.reg.getDataTercero(this.conductor.cedula).subscribe(cc => {

      this.getParentesco().then(
        data => {
          const objeto2 = this.dataParentes.find((objeto2: any) => objeto2.name === cc.data[0].nombreParentes);
          // console.log(objeto2);

          if (objeto2 != undefined) {
            this.conductor.codigoParentesco = objeto2.id;
            this.conductor.parentesco = objeto2.name

          } else {
            validate = false;
            mensaje += '<li>Parentesco </li>'
          }
        },
        err => {
          if (err.status == 401) {
            this.auth.logout()
          }
        }
      )

      const placa = cc.data[0].numeroPlacaxxx;

      if (placa != this.vehiculo.placa) {
        this.presentAlert("Alerta", "El vehiculo ha cambiado vuelva a iniciar sesion", "", "Cerrar");
        this.userService.logout();
        loadingData.dismiss();
      }

      if (cc.data[0].nombreTercerox) { this.conductor.nombres = cc.data[0].nombreTercerox }
      else { validate = false; mensaje += '<li>Nombres</li>' }
      if (cc.data[0].apell1Tercerox || cc.data[0].apell2Tercerox) { this.conductor.apellidos = cc.data[0].apell1Tercerox + ' ' + cc.data[0].apell2Tercerox }
      else { validate = false; mensaje += '<li>Apellidos</li>' }
      if (cc.data[0].emailxTercerox) { this.conductor.correo = cc.data[0].emailxTercerox }
      else { validate = false; mensaje += '<li>Correo</li>' }
      if (cc.data[0].movilxContacto) { this.conductor.celular = cc.data[0].movilxContacto }
      else { validate = false; mensaje += '<li>Celular </li>' }
      if (cc.data[0].direccTercerox) { this.conductor.direccion = cc.data[0].direccTercerox }
      else { validate = false; mensaje += '<li>Direccion </li>' }
      if (cc.data[0].fechaxNacimien) { this.conductor.fechaNacimiento = cc.data[0].fechaxNacimien }
      else { validate = false; mensaje += '<li>Fecha Nacimiento </li>' }
      if (cc.data[0].nombreContacto) { this.conductor.nombreContacto = cc.data[0].nombreContacto }
      else { validate = false; mensaje += '<li>Nombre Contacto</li>' }
      if (cc.data[0].movilxContacto) { this.conductor.celularContacto = cc.data[0].movilxContacto }
      else { validate = false; mensaje += '<li>Celular Contacto</li>' }
      if (cc.data[0].nombreParentes) { this.conductor.parentesco = cc.data[0].nombreParentes }
      else { validate = false; mensaje += '<li>Parentesco</li>' }

      if (cc.data[0].tipoxxVehiculo == "ARTICULADO") {
        this.vehiculo.articulado = true
        this.dataTercero.articulado = true;

      } else {
        this.vehiculo.articulado = false;
        this.dataTercero.articulado = false;
      }

      if (cc.data[0].fechaxLicencia) { this.conductor.fechaLicencia = cc.data[0].fechaxLicencia }
      if (cc.data[0].foto) { this.hubImag.fotoperfil['webviewPath'] = cc.data[0].foto }

      // this.terms['con_rec_pub'] = cc.data[0].AppConrecpub
      // this.terms['grd_pod_pub'] = cc.data[0].AppGrdpodpub
      // this.terms['rec_pub_gnr'] = cc.data[0].AppRecpubgnr
      // this.terms['vin_per_pub'] = cc.data[0].AppVinperpub
      // this.terms['per_tri_eco'] = cc.data[0].AppPertrieco
      // this.terms['gre_rec_pub'] = cc.data[0].AppGrerecpub
      // this.terms['gre_rec_pub_pro'] = cc.data[0].AppGrerecpubPro
      // this.terms['gre_rec_pub_ten'] = cc.data[0].AppGrerecpubTen

      mensaje += "</ul>"

      this.getDocument(this.conductor.cedula, 'fotoperfil', 'conductor').then(
        (doc: any) => {
          if (doc['code'] !== '204') {
            console.log(doc.data.fotoperfil);


            this.hubImag.fotoperfil.webviewPath = doc.data.fotoperfil;
          }
        }
      )

      if (!validate) {
        this.presentAlert("Alerta", "Es necesario ingresar:", mensaje, "Cerrar")
        loadingData.dismiss();
      } else {
        var text: any = '<ul>'
        var docsFinal: any = []
        var docsVehiculo = false;
        var status: any = true;
        this.userService.getFechasDocs(this.token).then(
          (data: any) => {
            console.log(data);

            this.checkDocs = data.statusDoc;
            this.hiddenDocs = false;
            var docs = data.docs;

            if (docs.length > 0) {
              status = false;
              for (let a = 0; a < docs.length; a++) {
                const element = docs[a];
                const palabra = this.separarCamelCase(element.nombre);
                text += "<li>" + palabra + "</li>"

                const doc = this.buscarCodigoEnDocumentos(element.nombre)

                if (doc) {
                  docsFinal.push(doc);
                } else {
                  docsVehiculo = true
                }
              }
              text += '<ul>';
            }

            if (docsFinal.length > 0) {
              this.openDocumentController(docsFinal);
            } else if (docsVehiculo) {
              console.log('datos vehiculo');

              this.loadVehicle();
            }


            this.numDocs = docs.length
            loadingData.dismiss();

            if (!status) {
              this.presentAlert("Alerta", "Documento pendientes por actualizar", text, "Cerrar")
            }
          },
          err => {
            if (err.status == 401) {
              this.auth.logout()
            }
          }
        )


        // var cadena = tipos.join(',');
        //   this.photo.getFotosTercero(this.conductor.cedula, cadena, 'conductor').toPromise().then(
        //     data =>{
        //      if (data.code == '201') {
        //        this.hiddenDocs = false;
        //        this.checkDocs = false;
        //        const entries = Object.entries(data.data);
        //        entries.forEach(([key, value]) => {
        //          if (!value) {
        //           this.numDocs += 1;
        //          }
        //        });
        //       }else{
        //         this.checkDocs = true;
        //       }
        //     tipos = []
        //     this.documents_vehiculo.forEach((documento:any) => {
        //       documento.docs.forEach((doc:any) => {
        //           tipos.push(doc.codigo);
        //       });
        //     });
        //     var cadena = tipos.join(',');
        //          // this.getDriverApi(cedula, false);
        //          this.photo.getFotosTercero(this.vehiculo.placa, cadena, 'vehiculo').toPromise().then(
        //           data =>{
        //           loadingData.dismiss()
        //            if (data.code == '201') {
        //             this.hiddenDocs = false;
        //             this.checkDocs = false;
        //              const entries = Object.entries(data.data);
        //              entries.forEach(([key, value]) => {
        //                if (!value) {
        //                 this.numDocs += 1;
        //                }
        //              });
        //             }else{
        //               if(this.checkDocs)
        //               {
        //                 this.hiddenDocs = true;
        //               }
        //             }
        //           });
        //       });

      }


    },
      err => {

        if (err.status == 401) {
          this.auth.logout()
        }
        this.presentAlert("ERROR", "Error en servicio", err, "Cerrar")
      })



    // this.listenerEvents();




    // this.userService.getTercero3sL(this.token).subscribe(
    //   (data) => {
    //     // console.log(data['data']);

    //     const dataUser = data['data'][0];
    //     this.dataUser = data['data'];
    //     // console.log(dataUser);



    //     this.conductor.cedula = dataUser.codigoTercerox;
    //     this.vehiculo.placa = dataUser.numeroPlacaxxx;
    //     this.conductor.nombres = dataUser.nombreTercerox;
    //     this.conductor.apellidos = dataUser.apell1Tercerox + ' ' + dataUser.apell2Tercerox
    //     this.conductor.correo = dataUser.emailxTercerox
    //     this.conductor.celular = dataUser.movilxTercerox
    //     this.conductor.direccion = dataUser.direccTercerox
    //     this.conductor.fechaNacimiento = dataUser.fechaxNacimien
    //     this.conductor.ciudad = dataUser.ciudadCreacion
    //     this.conductor.nombreContacto = dataUser.nombreContacto
    //     this.conductor.celularContacto = dataUser.movilxContacto
    //     this.conductor.parentesco = dataUser.parentContacto
    //     this.vehiculo.modelo = dataUser.numeroModeloxx
    //     // this.hubImag.fotoperfil['webviewPath'] = dataUser.apiFotoConductor;
    //     // this.hubImag.soat1['webviewPath'] = dataUser.apiSoat1;
    //     // this.hubImag.fotoremol['webviewPath'] = dataUser.apiTrailer;
    //     // this.hubImag.tarjePro['webviewPath'] = dataUser.apiTarjeta1
    //     // this.hubImag.tecnomecanica['webviewPath'] = dataUser.apiTecnico1;
    //     // this.hubImag.cedula1['webviewPath'] = dataUser.apiCedula1;
    //     // this.hubImag.cedula2['webviewPath'] = dataUser.apiCedula2;
    //     // this.hubImag.licencia1['webviewPath'] = dataUser.apiLicencia1;
    //     // this.hubImag.licencia2['webviewPath'] = dataUser.apiLicencia2;
    //     // this.hubImag.fotovehi1['webviewPath'] = dataUser.apiFoto1;
    //     // this.hubImag.fotovehi2['webviewPath'] = dataUser.apiFoto2;
    //     // this.hubImag.fotovehi3['webviewPath'] = dataUser.apiFoto3;
    //     // this.hubImag.fotovehi4['webviewPath'] = dataUser.apiFoto4;
    //     this.vehiculo.fechaTecno = dataUser.fechaxTecnimec;
    //     this.vehiculo.fechaSoat  = dataUser.fechaxSoatxxxx;
    //     this.vehiculo.fechaLicencia = dataUser.fechaxLicencia;

    //      this.vehiculo.codigoMarca = dataUser.codigoVehmarca
    //      this.vehiculo.codigoLinea = dataUser.codigoVehlinea
    //      this.vehiculo.codigoClase = dataUser.codigoVehclase
    //      this.vehiculo.codigoColor = dataUser.codigoVehcolor
    //      this.vehiculo.codigoCarroceria = dataUser.codigoVehcarro
    //      this.vehiculo.marca = dataUser.nombreVehmarca
    //      this.vehiculo.carroceria = dataUser.nombreVehcarro
    //      this.vehiculo.claseVehiculo = dataUser.nombreSiatxxxx
    //      this.vehiculo.linea = dataUser.nombreVehlinea
    //      this.vehiculo.color = dataUser.nombreVehcolor
    //      //  = dataUser.nombreVehcolor

    //       if (dataUser.estadoSiatxx == 'ACTIVO')
    //           {
    //             this.clase_estado = 'badge text-bg-success';
    //             this.estado = 'ACTIVO'
    //           } else {
    //             this.clase_estado = 'badge text-bg-danger';
    //             this.estado = 'INACTIVO'
    //           }
    //       if(dataUser.codigoPropieta != null)
    //       {
    //         if (dataUser.codigoPropieta != this.cedula) {
    //           this.isPropietario = false;
    //           this.modulos[2].status = true;
    //           this.propietario.cedula = dataUser.codigoPropieta;
    //         }
    //         // this.checkPropietario()
    //       }

    //       if(dataUser.codigoTenedorx)
    //       {
    //         if (dataUser.codigoTenedorx != this.cedula) {
    //             const a:any = {target:{value:dataUser.codigoTenedorx}};
    //             a.target.value = dataUser.codigoTenedorx
    //             this.isTenedor = false;
    //             this.modulos[3].status = true;
    //             this.tenedor.cedula = dataUser.codigoTenedorx
    //             this.searchInfoTen(a);
    //         }
    //       }

    //     this.getCarroc(dataUser.codigoVehclase);
    //     this.getClaseLinea(dataUser.codigoVehlinea);
    //     // this.loadDocuments();
    //     this.getVehiculos(this.conductor.cedula).then(
    //       (data:any) => {
    //         if (data) {

    //           console.log(this.dataVehiculos);


    //         }else{

    //         }
    //       }
    //     )

    //   },
    //   (err) => {
    //     if (err.status == 401) {
    //       this.userService.logout();
    //     }
    //   }
    // );

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

  initializeApp() {
    this.platform.ready().then(() => {
      this.setStatusBarColor();
    });
  }

  setStatusBarColor() {
    if (this.platform.is('android')) {
      StatusBar.setBackgroundColor({ color: '#3c8ccd' });
    } else if (this.platform.is('ios')) {
      StatusBar.setStyle({ style: Style.Dark });
    }
  }


  async loadVehicle() {

    let documentos = [
      'fotoremol',
      'tarjePro1',
      'tarjePro2',
    ]

    var validate = true;
    const loadingData = await this.loading.create({
      message: 'Generando datos...',
    });

    const docs = this.app.docs

    loadingData.present();

    const esl = await this.reg.getDataVehiculo(this.vehiculo.placa)
    var mensaje = '<ul>';
    const datos = esl.data[0];
    const cedulaTer = datos['codigoTercerox']

    this.vehiculo.codigoMarca = datos.codigoVehmarca
    this.vehiculo.codigoLinea = datos.codigoVehlinea
    this.vehiculo.codigoClase = datos.codigoVehclase
    this.vehiculo.codigoColor = datos.codigoVehcolor
    this.vehiculo.codigoCarroceria = datos.codigoVehcarro
    this.vehiculo.marca = datos.nombreVehmarca
    this.vehiculo.carroceria = datos.nombreVehcarro
    this.vehiculo.claseVehiculo = datos.nombreClaseVeh
    this.vehiculo.linea = datos.nombreVehlinea
    this.vehiculo.color = datos.nombreVehcolor
    this.vehiculo.modelo = datos.numeroModeloxx
    this.vehiculo.usuarioSatelital = datos.sateliUsuariox
    this.vehiculo.claveSatelital = datos.satelContrasen
    this.vehiculo.codigoSatelital = datos.sateliEmpresax
    this.vehiculo.empresaSatelital = datos.nombreAppempgp
    this.vehiculo.cuentaSatelital = datos.satelCuentaxx
    this.vehiculo.remolque = datos.placaRemolque
    this.propietario.cedula = datos.codigoPropieta
    this.tenedor.cedula = datos.codigoTenedorx
    this.tenedor.nombres = datos.nombreTenedor
    this.tenedor.apellidos = datos.apellidoTenedor
    this.tenedor.correo = datos.emailTenedor
    this.tenedor.celular = datos.movilTenedor
    this.tenedor.direccion = datos.direccionTenedor
    this.propietario.nombres = datos.nombrePropietario
    this.propietario.apellidos = datos.apellidoPropietario
    this.propietario.correo = datos.emailPropietario
    this.propietario.celular = datos.movilPropietario
    this.propietario.direccion = datos.direccionPropietario

    if (datos.codigoPropieta) {
      this.vehiculo.isPropietario = false
      this.checkPropi = true;
    } else {
      this.vehiculo.isPropietario = true
      this.checkPropi = false;
    }
    if (datos.codigoTenedorx) {
      this.vehiculo.isTenedor = false
      this.checkTened = true
    } else {
      this.vehiculo.isTenedor = true
      this.checkTened = false
    }


    this.formVehicle.patchValue({
      isPropietario: datos.indicaIgualpro,
      codigoPropietario: datos.codigoPropieta,
      isTenedor: datos.indicaIgualten,
      codigoTenedor: datos.codigoTenedorx
    })



    if (docs.length > 0) {
      for (const a of docs) {
        if (a.nombre == 'fechaSatelital') {
          this.vehiculo.usuarioSatelital = '';
          this.vehiculo.claveSatelital = '';
          this.vehiculo.codigoSatelital = '';
          this.vehiculo.empresaSatelital = '';
          this.vehiculo.cuentaSatelital = '';
        }
      }
    }

    if (datos.numeroModeloxx) { this.vehiculo.modelo = datos.numeroModeloxx; }
    else { validate = false; mensaje += '<li> Modelo </li>' }
    if (datos.fechaxSoatxxxx) { this.vehiculo.fechaSoat = datos.fechaxSoatxxxx; }
    if (datos.fechaxTecnimec) { this.vehiculo.fechaTecno = datos.fechaxTecnimec; }

    if (datos.tipoxxVehiculo == "ARTICULADO") {
      console.log('ARTICULADO');

      this.vehiculo.articulado = true
      this.dataTercero.articulado = true;

    } else {
      this.vehiculo.articulado = false;
      this.dataTercero.articulado = false;
    }


    const dataClases = this.getClases();
    const dataMarcas = this.getMarcas();
    const dataColores = this.getColores();
    const dataSatelitalpo = this.getSatelital();



    Promise.all([dataClases, dataMarcas, dataColores,]).then(
      ([doc1, doc2, doc3]) => {

        loadingData.dismiss();
        this.setOpenVehiculo(true)


        const objeto2 = this.dataClases.find((objeto2: any) => objeto2.name === datos.nombreClaseVeh);
        // console.log(objeto2);

        if (objeto2 != undefined) {
          this.vehiculo.codigoClase = objeto2.id;
          this.vehiculo.claseVehiculo = objeto2.name

          this.getCarroc(objeto2.id);
        } else {
          validate = false;
          mensaje += '<li>Clase Vehiculo</li>'
        }


        const objeto1 = this.dataMarcas.find((objeto1: any) => objeto1.name === datos.nombreVehmarca);
        // console.log(objeto1);

        if (objeto1 != undefined) {
          this.getClaseLinea(objeto1.id);
          this.vehiculo.codigoMarca = objeto1.id;
          this.vehiculo.marca = objeto1.name
        } else {
          validate = false;
          mensaje += '<li>Marca</li>'
          this.vehiculo.marca = ''
          this.vehiculo.codigoMarca = ''

        }

      })

    //Documentos remolque

    documentos.forEach(async element => {
      await this.processDocuments(this.vehiculo.remolque, element, 'remolque');
    });

    console.log(this.hubImag);


  }



  async processDocuments(doc: any, code: any, type: any) {
    await this.getDocument(doc, code, type).then(
      (doc: any) => {
        if (doc['code'] !== '204') {
          this.hubImag.remolque[code].webviewPath = doc['data'][code];
        }
      }
    )
  }




  async startVideo() {
    try {
      this.startCamera = true
      var video = await navigator.mediaDevices.getUserMedia({ video: true });

      await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/assets/models');
      await faceapi.nets.ageGenderNet.loadFromUri('/assets/models');


      let stream = this.videoContainer.nativeElement;
      stream.srcObject = video;

      stream.addEventListener('loadedmetadata', () => this.PlayEvn());

    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
    }
  }

  PlayEvn() {
    this.videoContainer.nativeElement.addEventListener('play', () => {
      const canvas = faceapi.createCanvasFromMedia(this.videoContainer.nativeElement)
      document.body.append(canvas)
      const displaySize = { width: this.videoContainer.nativeElement.width, height: this.videoContainer.nativeElement.height }
      faceapi.matchDimensions(canvas, displaySize)

      setInterval(async () => {
        const detections = await faceapi.detectAllFaces(this.videoContainer.nativeElement, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender()

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        resizedDetections.forEach(detection => {
          const box = detection.detection.box
          const drawBox = new faceapi.draw.DrawBox(box, { label: Math.round(detection.age) + " year old " + detection.gender })
          drawBox.draw(canvas)
        })


      }, 1000)
    })
  }


  async getParentesco() {
    try {
      const data = await this.reg.getParent(this.token).toPromise();
      if (data.status) {
        const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];

          this.dataParentes.push({ id: element.codigoParentes, name: element.nombreParentes });
        }
        // console.log(this.dataParentes);
      }
    } catch (error) {
      console.log(error);
    }
  }


  saveDocs(e: any) {

  }

  cancelDocs() {

  }

  loadDocs() {

    var tipos: any = []

    this.documents_vehiculo.forEach((documento: any) => {
      // documento.docs.forEach((doc:any) => {
      // if (!documento.fecha && !documento.fechaTag) {
      tipos.push(documento);
      // }
      // });
    });


    this.documents_conductor.forEach((documento: any) => {
      // documento.docs.forEach((doc:any) => {
      // if (!documento.fecha && !documento.fechaTag) {
      tipos.push(documento);
      // }
      // });
    });
    console.log(tipos);


    this.openDocumentController(tipos);
  }




  openDocumentController(docs: any) {

    // if (tipo == 'cedula' && doc != '') {
    //   console.log(this.documents_conductor);

    this.dataTercero['cedula'] = this.conductor.cedula
    this.dataTercero['placa'] = this.vehiculo.placa;
    this.dataTercero['docs'] = docs

    //   // this.setOpenTer(false)
    //   // this.modal2.dismiss();
    //   this.openDocs = true;

    // } else if (tipo == 'placa' && doc != '') {
    //   this.dataTercero['placa'] = doc
    //   this.dataTercero['cedula'] = ''
    //   this.dataTercero['docs'] = this.documents_vehiculo

    //   // this.setOpenVeh(false);
    //   // this.modal.dismiss()
    this.openDocs = true;
    // }

  }


  ngAfterViewInit() {

  }

  changePropietario(event: any) {
  this.vehiculo.isPropietario = event.detail.checked;
}

  changeTenedor(event: any) {
    this.vehiculo.isTenedor = event.detail.checked;
  }

  setOpenPropietario(isOpen: boolean) {
    this.isModalOpen5 = isOpen;
  }

  setOpenTenedor(isOpen: boolean) {
    this.isModalOpen6 = isOpen;
  }


  setOpenVehiculo(isOpen: boolean) {
    this.isModalOpen3 = isOpen;
  }

  setOpenHubVehicles(isOpen: boolean) {
    this.isModalOpen7 = isOpen;
    this.modal7.dismiss()
  }


  async selectEvent(e: any) {

    const loading = await this.loading.create({
      message: 'Cargando Datos...'
    });

    loading.present();

    this.formVehicle.patchValue({
      carroceria: ''
    });

    if (e.tipo == "ARTICULADO") {
      this.vehiculo.articulado = true;
      this.dataTercero.articulado = true;
      this.documents_vehiculo[3].hidden = false;
      this.formVehicle.get('remolque').setValidators(Validators.required);
    } else {
      this.vehiculo.articulado = false;
      this.vehiculo.remolque = ''
      this.dataTercero.articulado = false;
      this.formVehicle.patchValue({
        remolque: ''
      });
    }

    this.vehiculo.claseVehiculo = e.name;
    this.vehiculo.codigoClase = e.id;

    this.getCarroc(e.id).then(
      data => {
        loading.dismiss();
      }
    )
  }
  onChangeSearch(e: any) {

  }
  onFocused(e: any) {

  }


  async selectMarca(e: any) {

    const loading = await this.loading.create({
      message: 'Cargando Datos...'
    });

    loading.present();

    this.formVehicle.patchValue({
      linea: ''
    });
    this.vehiculo.codigoMarca = e.id
    this.vehiculo.marca = e.name
    this.getClaseLinea(e.id).then(
      data => {
        loading.dismiss();
      }
    )
  }
  onChangeMarca(e: any) {

  }
  onFocusedMarca(e: any) {

  }


  selectLinea(e: any) {
    this.vehiculo.linea = e.name
    this.vehiculo.codigoLinea = e.id
  }
  onChangeLinea(e: any) {

  }
  onFocusedLinea(e: any) {

  }

  selectColor(e: any) {
    this.vehiculo.color = e.name
    this.vehiculo.codigoColor = e.id
  }

  onChangeColor(e: any) {

  }

  onFocusedColor(e: any) {

  }


  selectCarroceria(e: any) {
    this.vehiculo.codigoCarroceria = e.id;
    this.vehiculo.carroceria = e.name;

  }

  onChangeCarroceria(e: any) {

  }

  onFocusedCarroceria(e: any) {

  }

  onEditVehicle() {

  }

  selectParente(e: any) {
    this.conductor.parentesco = e.name
    this.conductor.codigoParentesco = e.id
  }

  onChangeParente(e: any) {

  }

  onFocusedParente(e: any) {

  }

  selectSatelital(e: any) {
    this.vehiculo.empresaSatelital = e.name
    this.vehiculo.codigoSatelital = e.id
  }

  onChangeSatelital(e: any) {

  }

  onFocusedSatelital(e: any) {

  }


  async getSatelital() {
    try {
      const data = await this.reg.getSatelital(this.token).toPromise();

      if (data.status) {
        const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];
          this.dataSatelital.push({ id: element.codigoVehgpsxx, name: element.nombreVehgpsxx });
        }
      }

      console.log(this.dataSatelital);


    } catch (error) {
      console.log(error);
    }
  }




  async getClases() {
    try {
      const data = await this.reg.getClasevehiculo(this.token).toPromise();

      if (data.status) {
        const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];
          this.dataClases.push({ id: element.codigoVehclase, name: element.nombreSiatxxxx, tipo: element.tipoxxVehiculo });
        }
      }

    } catch (error) {
      console.log(error);
    }
  }

  async getMarcas() {
    try {
      const data = await this.reg.getMarcas(this.token).toPromise();

      if (data.status) {
        const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];

          this.dataMarcas.push({ id: element.codigoVehmarca, name: element.nombreVehmarca });
        }
        // console.log(this.dataClases);
      }

    } catch (error) {
      console.log(error);
    }
  }

  async getCarroc(id: any) {
    try {

      this.dataCarroc = []
      const data = await this.reg.getCarrocerias(id, this.token).toPromise();

      if (data.status) {
        const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];

          this.dataCarroc.push({ id: element.codigoVehcarro, name: element.nombrevehcarcl });
        }
        // console.log(this.dataCarroc);+
      }

    } catch (error) {
      console.log(error);
    }
  }

  async getClaseLinea(id: any) {
    this.dataLineas = []
    const data = await this.reg.getLineas(id, '', this.token).toPromise();
    if (data.status) {
      const dataArray = data.data;
      for (let a = 0; a < dataArray.length; a++) {
        const element = dataArray[a];
        this.dataLineas.push({ id: element.codigoVehlinea, name: element.nombreVehlinea });
      }
    }

  }


  async getColores() {
    try {
      const data = await this.reg.getColores(this.token).toPromise();
      if (data.status) {
        const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];

          this.dataColores.push({ id: element.codigoVehcolor, name: element.nombreVehcolor });
        }
        // console.log(this.dataClases);
      }
    } catch (error) {
      console.log(error);
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
      indicaIgualpro: this.vehiculo.isPropietario,
      indicaIgualten: this.vehiculo.isTenedor,
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
      // apiTarjeta1: this.hubImag.tarjePro.webviewPath,
      // apiCedula1: this.hubImag.cedula1.webviewPath,
      // apiCedula2: this.hubImag.cedula2.webviewPath,
      // apiLicencia1: this.hubImag.licencia1.webviewPath,
      // apiLicencia2: this.hubImag.licencia2.webviewPath,
      // apiTarjeta2: '',
      // apiSoat1: this.hubImag.soat1.webviewPath,
      // apiSoat2: '',
      // apiRecibo: '',
      // apiTrailer: this.hubImag.fotoremol.webviewPath,
      // apiRegistroTrailer: '',
      // apiCertificadoTrailer: '',
      // apiFoto1: this.hubImag.fotovehi1.webviewPath,
      // apiFoto2: this.hubImag.fotovehi2.webviewPath,
      // apiFoto3: this.hubImag.fotovehi3.webviewPath,
      // apiFoto4: this.hubImag.fotovehi4.webviewPath,
      // apiTecnico1: this.hubImag.tecnomecanica.webviewPath,
      // apiTecnico2: '',
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
        indicaIgualpro: !this.vehiculo.isPropietario,
        codigoTercerox: this.propietario.cedula,
        nombreTercerox: this.propietario.nombres,
        apell1Tercerox: this.propietario.apellidos,
        apell2Tercerox: '',
        codigoCiudadxx: '',
        movilxTercerox: this.propietario.celular,
        emailxTercerox: this.propietario.correo,
        AppGrerecpubPro: this.terms['gre_rec_pub_pro'],
      },
      tenedor: {
        indicaIgualten: !this.vehiculo.isTenedor,
        codigoTercerox: this.propietario.cedula,
        nombreTercerox: this.propietario.nombres,
        apell1Tercerox: this.propietario.apellidos,
        apell2Tercerox: '',
        codigoCiudadxx: '',
        movilxTercerox: this.propietario.celular,
        emailxTercerox: this.propietario.correo,
        AppGrerecpubTen: this.terms['gre_rec_pub_ten'],
      }
    };

    // console.log(this.hubImag.cedula1);

    this.userService.registroApiAldia(datparams2, this.token).then(
      (data) => {
        console.log(data);
        this.presentAlert('Envio Exitoso', '', '', 'Cerrar');
      },
      (err) => {
        this.presentAlert('Error al enviar', '', err.message, 'Cerrar');
      }
    );
  }

  async onSubmitDriver() {
    try {
      if (this.hubImag.fotoperfil.base64) {
        await this.saveFotoApi();
        this.saveData();
      } else {
        this.saveData();
      }

    } catch (error) {
      console.error('Error al ejecutar saveFotoApi', error);
    }
  }

  async saveData() {

    const loadingData = await this.loading.create({
      message: 'Guardando Datos...',
    });

    loadingData.present();

    var validate = true;
    var jsonApi: any = {};

    var text = "<ul>";
    for (const campo in this.formDriver.controls) {
      if (this.formDriver.controls[campo].invalid) {
        validate = false;
        text += "<li>" + campo.charAt(0).toUpperCase() + campo.slice(1) + "</li>";
      } else {
        this.conductor[campo] = this.formDriver.value[campo]
        jsonApi[campo] = this.formDriver.value[campo]
      }
    }

    jsonApi['codigoTercerox'] = this.conductor.cedula
    jsonApi['conductor'] = true
    if (this.hubImag.fotoperfil.base64) {
      jsonApi['fotoperfil'] = this.hubImag.fotoperfil.webviewPath
    }

    if (!validate) {
      this.checkDatos = true;
      this.presentAlert("Error", "Es necesario ingresar:", text, "Cerrar");
      loadingData.dismiss();
    } else {
      const data = await this.reg.sendDataTercero(jsonApi);
      loadingData.dismiss();
      this.router.navigate(['/home'])
    }
  }

  async onSubmitVehicle() {

    var validate = true;
    var jsonApi: any = {}
    jsonApi['placa'] = this.vehiculo.placa;

    const loadingData = await this.loading.create({
      message: 'Guardando Datos...',
    });

    loadingData.present();


    try {


      if (this.vehiculo.isPropietario) {
        this.formVehicle.patchValue({
          codigoPropietario: ''
        })
      }

      if (this.vehiculo.isTenedor) {
        this.formVehicle.patchValue({
          codigoTenedor: ''
        })
      }

      var text = "<ul>";

      for (const campo in this.formVehicle.controls) {
        if (this.formVehicle.controls[campo].invalid) {
          validate = false;
          text += "<li>" + campo.charAt(0).toUpperCase() + campo.slice(1) + "</li>";
        } else {

          this.vehiculo[campo] = this.formVehicle.value[campo]
          jsonApi[campo] = this.formVehicle.value[campo]
        }
      }



      if (this.vehiculo.articulado) {

        if (!this.formVehicle.value.remolque) {
          validate = false;
          text += "<li> Placa Remolque </li>";
        } else {
          this.vehiculo.remolque = this.formVehicle.value.remolque
        }


        if (!this.hubImag.remolque.tarjePro1.webviewPath) {
          validate = false;
          text += "<li> Terjeta de propiedad Remolque Frontal </li>";
        }

        if (!this.hubImag.remolque.tarjePro2.webviewPath) {
          validate = false;
          text += "<li> Terjeta de propiedad Remolque Posterior </li>";
        }


        if (!this.hubImag.remolque.fotoremol.webviewPath) {
          validate = false;
          text += "<li> Foto Remolque </li>";
        }

      }

      if (this.vehiculo.articulado && validate) {
        // console.log(this.hubImag);
        await this.saveDocumentVehicle()
      }


      text += "</ul>";

      console.log(this.hubImag);


       
        this.hubImag.cedula_pro1 = {}
        this.hubImag.cedula_pro2 = {}
        this.hubImag.remolque = {}
      



      if (validate) {
        const envio = await this.reg.sendDataVehiculo(jsonApi);
        this.checkVehicle = true;
        this.onDismissChange(true);
        this.setOpenVehiculo(false)
      } else {
        this.checkVehicle = false;
        this.presentAlert("Error", "Es necesario ingresar:", text, "Cerrar");
      }

    } catch (e) {
      console.error("Error en onSubmitVehicle", e);
      this.presentAlert("Error", "Ocurrió un error inesperado.", "", "Cerrar");
    } finally {

      loadingData.dismiss();
    }

  }


  async saveDocumentVehicle() {
    let status = false;
    this.jsonDocs = {
      files: [],
    };

    if (this.hubImag?.tarjePro?.base64) {
      const dataDoc = {
        codigo: this.vehiculo.placa,
        tipo: 'tarjePro',
        tipoRegistro: 'vehiculo',
        data64: this.hubImag.tarjePro.base64
      }

      this.jsonDocs.files.push(dataDoc);
      status = true;

    }


    if (this.hubImag?.soat1?.base64) {
      const dataDoc = {
        codigo: this.vehiculo.placa,
        tipo: 'soat1',
        tipoRegistro: 'vehiculo',
        data64: this.hubImag.soat1.base64
      }

      this.jsonDocs.files.push(dataDoc);
      status = true;

    }

    if (this.hubImag?.tecnomecanica?.base64) {
      const dataDoc = {
        codigo: this.vehiculo.placa,
        tipo: 'tecnomecanica',
        tipoRegistro: 'vehiculo',
        data64: this.hubImag.tecnomecanica.base64
      }

      this.jsonDocs.files.push(dataDoc);
      status = true;

    }
    if (this.hubImag?.fotovehi1?.base64) {
      const dataDoc = {
        codigo: this.vehiculo.placa,
        tipo: 'fotovehi1',
        tipoRegistro: 'vehiculo',
        data64: this.hubImag.fotovehi1.base64
      }

      this.jsonDocs.files.push(dataDoc);
      status = true;

    }
    if (this.hubImag?.fotovehi2?.base64) {
      const dataDoc = {
        codigo: this.vehiculo.placa,
        tipo: 'fotovehi2',
        tipoRegistro: 'vehiculo',
        data64: this.hubImag.fotovehi2.base64
      }

      this.jsonDocs.files.push(dataDoc);
      status = true;

    }
    if (this.hubImag?.fotovehi3?.base64) {
      const dataDoc = {
        codigo: this.vehiculo.placa,
        tipo: 'fotovehi3',
        tipoRegistro: 'vehiculo',
        data64: this.hubImag.fotovehi3.base64
      }

      this.jsonDocs.files.push(dataDoc);
      status = true;

    }
    if (this.hubImag?.fotovehi4?.base64) {
      const dataDoc = {
        codigo: this.vehiculo.placa,
        tipo: 'fotovehi4',
        tipoRegistro: 'vehiculo',
        data64: this.hubImag.fotovehi4.base64
      }

      this.jsonDocs.files.push(dataDoc);
      status = true;

    }
    if (this.hubImag.remolque.fotoremol?.base64) {
      const dataDoc = {
        codigo: this.vehiculo.remolque,
        tipo: 'fotoremol',
        tipoRegistro: 'remolque',
        data64: this.hubImag.remolque.fotoremol.base64
      }

      this.jsonDocs.files.push(dataDoc);
      status = true;

    }
    if (this.hubImag.remolque.tarjePro1.base64) {
      const dataDoc = {
        codigo: this.vehiculo.remolque,
        tipo: 'tarjePro1',
        tipoRegistro: 'remolque',
        data64: this.hubImag.remolque.tarjePro1.base64
      }

      this.jsonDocs.files.push(dataDoc);
      status = true;

    }

    if (this.hubImag.remolque.tarjePro2.base64) {
      const dataDoc = {
        codigo: this.vehiculo.remolque,
        tipo: 'tarjePro2',
        tipoRegistro: 'remolque',
        data64: this.hubImag.remolque.tarjePro2.base64
      }

      this.jsonDocs.files.push(dataDoc);
      status = true;

    }



    if (status) {

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
            this.hubImag.remolque.fotoremol.webviewPath = files.fotoremol;
          }

          if (files.tarjePro1) {
            this.hubImag.remolque.tarjePro1.webviewPath = files.tarjePror;
          }

          if (files.tarjePro2) {
            this.hubImag.remolque.tarjePro2.webviewPath = files.tarjePror;
          }


        },
        (err) => {
          return err;
        },
        () => {
          this.setOpenVehiculo(false);

        });

    }
  }


  async onSubmitNewProp() {

    const loadingData = await this.loading.create({
      message: 'Guardando Datos...',
    });

    loadingData.present();

    try {

      var validate = true;
      var jsonApi: any = {};

      var text = "<ul>";
      for (const campo in this.formNewProp.controls) {
        if (this.formNewProp.controls[campo].invalid) {
          validate = false;
          text += "<li>" + campo.charAt(0).toUpperCase() + campo.slice(1) + "</li>";
        } else {
          this.propietario[campo] = this.formNewProp.value[campo]
          jsonApi[campo] = this.formNewProp.value[campo]
        }
      }

      if (!validate) {

        this.presentAlert("Error", "Es necesario ingresar:", text, "Cerrar");

      } else {

        jsonApi['codigoTercerox'] = this.formNewProp.value['cedula']
        jsonApi['conductor'] = true


        await this.reg.sendDataTercero(jsonApi)

        this.formVehicle.patchValue({
          codigoPropietario: this.formNewProp.value['cedula']
        })
        this.setOpenPropietario(false)
        this.vehiculo.isPropietario = false;

        await this.saveDocumentTercero('cedula_pro1', 'cedula_pro2', this.formNewProp.value['cedula']);

      }

    } catch (err: any) {
      this.presentAlert("Error", "", err.error?.message || "Error inesperado", "Cerrar");

    } finally {
      loadingData.dismiss();
    }
  }


  async onSubmitNewTen() {
    const loadingData = await this.loading.create({
      message: 'Guardando Datos...',
    });

    loadingData.present();

    try {


      var validate = true;
      var jsonApi: any = {};

      var text = "<ul>";
      for (const campo in this.formNewTene.controls) {
        if (this.formNewTene.controls[campo].invalid) {
          validate = false;
          text += "<li>" + campo.charAt(0).toUpperCase() + campo.slice(1) + "</li>";
        } else {
          this.conductor[campo] = this.formNewTene.value[campo]
          jsonApi[campo] = this.formNewTene.value[campo]
        }
      }

      if (!validate) {
        this.presentAlert("Error", "Es necesario ingresar:", text, "Cerrar");

      } else {

        jsonApi['codigoTercerox'] = this.formNewTene.value['cedula']
        jsonApi['conductor'] = true

        await this.reg.sendDataTercero(jsonApi)

        this.formVehicle.patchValue({
          codigoTenedor: this.formNewTene.value['cedula']
        })

        this.setOpenTenedor(false)

        this.vehiculo.isTenedor = false;

        await this.saveDocumentTercero('cedula_ten1', 'cedula_ten2', this.formNewTene.value['cedula']);

      }

    } catch (err: any) {
      this.presentAlert("Error", "", err.error?.message || "Error inesperado", "Cerrar");

    } finally {
      loadingData.dismiss(); // SOLO UNA VEZ
    }
  }

  async saveDocumentTercero(name: string, name2: any, cedula: any) {
    const jsonDocs: any = { files: [] }


    if (this.hubImag[name].base64) {
      const dataDoc = {
        codigo: cedula,
        tipo: name,
        tipoRegistro: 'conductor',
        data64: this.hubImag[name].base64,
      };
      jsonDocs.files.push(dataDoc);
    }

    if (this.hubImag[name2].base64) {
      const dataDoc = {
        codigo: cedula,
        tipo: name2,
        tipoRegistro: 'conductor',
        data64: this.hubImag[name2].base64,
      };
      jsonDocs.files.push(dataDoc);
    }


    return new Promise((resolve, reject) => {
      this.userService.cargaDocumentos(jsonDocs).subscribe(
        (data) => resolve(data),
        (err) => {
          this.presentAlert('Error al cargar documentos', '', 'Por favor validar documentos', 'Cerrar');
          reject(err);
        }
      );
    });

  }


  async editPropietario1(cedula: any) {
    const loadingData = await this.loading.create({
      message: 'Cargando Datos...',
    });

    loadingData.present();

    this.propietario.cedula = cedula
    this.setOpenPropietario(true);

    this.reg.getDataTercero(cedula).subscribe(
      (data: any) => {
        loadingData.dismiss()

        const datos = data.data[0]

        this.propietario.cedula = datos.codigoTercerox
        this.propietario.nombres = datos.nombreTercerox
        this.propietario.apellidos = datos.apell1Tercerox
        this.propietario.correo = datos.emailxTercerox
        this.propietario.celular = datos.movilxTercerox
        this.propietario.direccion = datos.direccTercerox
        this.propietario.fechaNacimeinto = datos.fechaxNacimien

      }
    )

  }


  async editTenedor1(cedula: any) {
    const loadingData = await this.loading.create({
      message: 'Cargando Datos...',
    });

    loadingData.present();
    this.tenedor.cedula = cedula;
    this.setOpenTenedor(true);

    this.reg.getDataTercero(cedula).subscribe(
      (data: any) => {
        loadingData.dismiss()

        const datos = data.data[0]

        this.tenedor.cedula = datos.codigoTercerox
        this.tenedor.nombres = datos.nombreTercerox
        this.tenedor.apellidos = datos.apell1Tercerox
        this.tenedor.correo = datos.emailxTercerox
        this.tenedor.celular = datos.movilxTercerox
        this.tenedor.direccion = datos.direccTercerox
        this.tenedor.fechaNacimeinto = datos.fechaxNacimien
      }
    )



  }
  onDismissChange(change: any) {
    this.dismissChange.emit(change);
    this.canDismissOverride = change;
  }

  onWillPresent() {
    this.canDismissOverride = false;
  }



  confirmCancelVehicule = async () => {

    if (this.canDismissOverride) {
      return true;
    }


    let actionSheet: any = await this.actionSheetCtrl.create({
      header: 'Seguro desea Salir?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Si',
          role: 'confirm',
          handler: () => {
            this.canDismissOverride = true;
          }
        },
        {
          text: 'No',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
          handler: () => {
            this.canDismissOverride = false;
          }
        },
      ],
    });

    actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();

    this.canDismissOverride = false;

    return role === 'confirm';
  }



  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }


  delTenedor() {
    this.vehiculo.isTenedor = true;
    this.tenedor.cedula = '';
    this.tenedor.nombres = '';
    this.formVehicle.patchValue({
      codigoTenedor: ''
    })
  }

  delPropietario() {
    this.vehiculo.isPropietario = true;
    this.propietario.cedula = '';
    this.propietario.nombres = '';
    this.formVehicle.patchValue({
      codigoPropietario: ''
    })
  }


  checkTenedor() {
    var item = document.getElementById('tenedor') as HTMLIonCardElement;

    if (!this.vehiculo.isTenedor) {
      item.classList.add('select-card');
      this.vehiculo.isTenedor = true;
      this.formVehicle.patchValue({
        isTenedor: true
      })
      this.modulos[3].status = false;
      this.formNewTene.reset()
      if (this.vehiculo.isPropietario) {
        this.completeData = true;
      }
    } else {
      if (!this.tenedor.cedula) {
        this.setOpenTenedor(true)
      }
      item.classList.remove('select-card');
      this.vehiculo.isTenedor = false;
      this.formVehicle.patchValue({
        isTenedor: false
      })
      this.completeData = false;
      this.modulos[3].status = true;
    }

  }


  unCheckPropietario() {
    var item = document.getElementById('propietario') as HTMLIonCardElement;
    item.classList.add('select-card');
    this.vehiculo.isPropietario = true;
    this.setOpenPropietario(false)
  }

  checkPropietario(tipo: any, status: any) {
    var item = document.getElementById(tipo) as HTMLIonCardElement;
    console.log(item);


    switch (tipo) {
      case 'propietario':

        if (status) {
          item.classList.add('select-card');
          this.vehiculo.isPropietario = true;
          this.formVehicle.patchValue({
            isPropietario: true
          })
        } else {
          item.classList.remove('select-card');
          this.vehiculo.isPropietario = false;
          this.formVehicle.patchValue({
            isPropietario: false
          })
        }

        break;
      case 'tenedor':

        if (status) {
          item.classList.add('select-card');
          this.vehiculo.isTenedor = true;
          this.formVehicle.patchValue({
            isTenedor: true
          })
        } else {
          item.classList.remove('select-card');
          this.vehiculo.isTenedor = false;
          this.formVehicle.patchValue({
            isTenedor: false
          })
        }

        break;

      default:
        break;
    }



  }


  // async saveFotoApi() {
  //   const jsonPhoto = {
  //     files: [{
  //       codigo: this.conductor.cedula,
  //       tipo: 'fotoperfil',
  //       tipoRegistro: 'conductor',
  //       data64: this.hubImag.fotoperfil.base64,
  //     }],
  //   };
  //   this.userService.cargaDocumentos(jsonPhoto).subscribe(
  //     (data) => {
  //       console.log(data);
  //       const files = data.data;
  //       if (files.fotoperfil) {
  //         this.hubImag.fotoperfil.webviewPath = files.fotoperfil;
  //       }
  //     },
  //     (err) => {
  //       this.presentAlert(
  //         'Error al cargan documentos',
  //         '',
  //         'Por favor validar documentos',
  //         'Cerrar'
  //       );
  //       console.log(err);
  //       console.log(jsonPhoto);
  //     }
  //   );
  // }


  async saveFotoApi(): Promise<void> {

    const loadingData = await this.loading.create({
      message: 'Guardando Foto...',
    });

    loadingData.present();

    const jsonPhoto = {
      files: [{
        codigo: this.conductor.cedula,
        tipo: 'fotoperfil',
        tipoRegistro: 'conductor',
        data64: this.hubImag.fotoperfil.base64,
      }],
    };

    return this.userService.cargaDocumentos(jsonPhoto).toPromise().then(
      (data) => {
        console.log(data);
        const files = data.data;
        if (files.fotoperfil) {
          this.hubImag.fotoperfil.webviewPath = files.fotoperfil;
        }
        loadingData.dismiss()
      },
      (err) => {
        this.presentAlert(
          'Error al cargar documentos',
          '',
          'Por favor validar documentos',
          'Cerrar'
        );
        console.log(err);
      }
    );

  }

  saveDocumentos() {
    var validate = true;
    var text = "";

    // const dataSubmit = this.formDocumentDriver.value;
    // console.log(dataSubmit);

    text += "<ul>";

    console.log(this.formDocumentDriver.controls);
    for (const campo in this.formDocumentDriver.controls) {
      if (this.formDocumentDriver.controls[campo].invalid) {
        validate = false;
        console.log(campo);

        text += "<li>" + campo.charAt(0).toUpperCase() + campo.slice(1) + "</li>";
      } else {
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
      claseVehiculo: ['', [Validators.required]],
      marca: ['', [Validators.required]],
      carroceria: ['', [Validators.required]]
    });

    var cedulaConductor = this.userService.getCedula();

    const placa = document.getElementById("placa") as HTMLInputElement | null;
    const placaText = placa?.value

    if (placaText?.length && placaText?.length > 5) {

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

            var cedula = data.data[0].codigoTercerox;
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




  searchInfoVeh(clase: any, marca: any, carro: any) {

    const objeto2 = this.dataClases.find((objeto2: any) => objeto2.name === clase);
    this.codigoClase = objeto2?.id;

    const objeto1 = this.dataMarcas.find((objeto1: any) => objeto1.name === marca);
    this.codigoMarca = objeto1?.id;

    this.getCarroc(objeto2?.id);
    var carropro = carro.toString();
    carropro = carropro.replace(/\s/g, "");
    const objeto = this.dataCarroc.find((objeto: any) => objeto.name === carropro);
    if (objeto == undefined) {
      this.carroceria = ''
      this.codigoCarroceria = ''
      this.formVehicle.patchValue({
        carroceria: ''
      })

      return false;

    } else {
      this.codigoCarroceria = objeto?.id;
      this.carroceria = carropro;
    }

    return true;

  }



  separarCamelCase(cadena: any): string {
    const regex = /([a-z])([A-Z])/g;
    let nuevaCadena: any = cadena.replace(regex, '$1 $2');
    nuevaCadena = nuevaCadena.toLowerCase();
    nuevaCadena = nuevaCadena.charAt(0).toLowerCase() + nuevaCadena.slice(1);
    return nuevaCadena;
  }


  nuevoPropietario() {
    this.setOpenPropietario(true)
  }

  editPropietario() {
    this.setOpenPropietario(true)
  }


  searchPropietario(event: any) {
    var validate = true;
    const cedula = event.target.value
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
          } else {
            validate = false;
          }

          if (datos.cedula2) {
            this.hubImag.cedula_pro2.webviewPath = datos.cedula2
          } else {
            validate = false;
          }

          if (!validate) {
            this.incompletoPropiet = true
            this.checkPropi = false
            this.setOpenPropietario(true);
          } else {
            this.incompletoPropiet = false
            this.checkPropi = true
          }

        },
        err => {
          this.newPropiet = true
          this.setOpenPropietario(true);
          this.formNewProp.reset()
          this.propietario.cedula = cedula
        }
      )

    }
  }


  nuevoTenedor() {
    this.setOpenTenedor(true)
  }

  editTenedor() {
    this.setOpenTenedor(true)
  }

  searchTenedor(event: any) {
    const cedula = event.target.value
    var validate = true;
    if (cedula.length > 6) {
      this.userService.getTerceroByCedula(cedula).subscribe(
        data => {

          const datos = data.data[0];

          this.tenedor.cedula = cedula;
          this.tenedor.nombres = datos.nombre
          this.tenedor.apellidos = datos.apellido
          this.tenedor.correo = datos.email
          this.tenedor.celular = datos.celular
          this.tenedor.direccion = datos.direccion
          this.tenedor.fechaNacimiento = datos.fecha_nacimiento

          if (datos.cedula1) {
            this.hubImag.cedula_pro1.webviewPath = datos.cedula1
          } else {
            validate = false;
          }

          if (datos.cedula2) {
            this.hubImag.cedula_pro2.webviewPath = datos.cedula2
          } else {
            validate = false;
          }

          if (!validate) {
            this.incompletoTenedor = true
            this.checkTened = false
            this.setOpenTenedor(true);
          } else {
            this.incompletoTenedor = false
            this.checkTened = true
          }

        },
        err => {
          this.newTenedor = true
          this.setOpenTenedor(true);
          this.formNewTene.reset()
          this.tenedor.cedula = cedula


        }
      )

    }
  }


  validateDocument(e: any) {

    // this.accordionGroup.toggle(0)

    // console.log(nativeEl);

  }


  buscarCodigoEnDocumentos(codigo: string) {
    for (const documento of this.documents_conductor) {
      if (documento.fechaTag && documento.fechaTag === codigo) {
        return documento;
      } else {
        for (const docs of documento.docs) {
          if (docs.codigo === codigo) {
            return documento;
          }
        }
      }
    }

    for (const documento of this.documents_vehiculo) {
      if (documento.fechaTag && documento.fechaTag === codigo) {
        return documento;
      } else {
        for (const docs of documento.docs) {
          if (docs.codigo === codigo) {
            return documento;
          }
        }
      }
    }


    return undefined;
  }


  async getDocument(codigo: any, tipo: any, tipoRegistro: any): Promise<any> {
    const resp: any = await this.photo.getFotoTercero(codigo, tipo, tipoRegistro).toPromise()
    return resp;
  }




  onChange() {
    const dataForm = this.dataChange.value;
    console.log(dataForm)
  }

  cargaDatosfinal(params: any) { }

  changeInput(type: any): any {
    const fecha = document.querySelector('#fecha input') as HTMLInputElement;

    fecha.type = type;
  }

  addToGalery(name: any) {
    this.photo.addNewToGallery(name).then((da) => {
      this.hubImag[name] = da;
    });
  }

  addToCamera(name: any) {
    this.photo.addNewToCamera(name).then((da) => {
      this.hubImag[name] = da;
    });
  }

  addToCameraRemolque(name: any) {
    this.photo.addNewToCamera(name).then((da) => {
      console.log(da);

      this.hubImag.remolque[name] = da;
    });
  }



  async loadProfile() {
    this.loadingData = await this.loading.create({
      message: 'Guradando Datos..'
    });
    this.photo.addNewToCameraProfile('fotoperfil').then((da) => {
      this.loadingData.present()
      this.processImage(da, 'fotoperfil', false);
    });
  }


  async processImage(da: any, name: any, rotate: any) {
    try {

      var rot = 0;

      if (rotate) {
        rot = 90;
      }

      const processedImagerotate: any = await this.photo.processAndRotationImage(da.base64, rotate);

      // console.log(processedImagerotate);


      const dataPhoto1: Photo = {
        webPath: processedImagerotate,
        format: 'jpeg',
        saved: false
      };

      const data64 = await this.photo.readAsBase64(dataPhoto1)
      // console.log(data64);

      const desiredSizeX = 450;
      const desiredSizeY = 290;
      // const processedImageDataUrl = await this.photo.processAndCropImage(data64, desiredSizeX, desiredSizeY, 90);
      const processedImageDataUrl = await this.photo.processImage(data64);

      const dataPhoto2: Photo = {
        webPath: processedImageDataUrl,
        format: 'jpeg',
        saved: false
      };

      // console.log(data64);
      da.webviewPath = processedImageDataUrl;
      da.base64 = await this.photo.readAsBase64(dataPhoto2)

      this.hubImag[name] = da;



      this.loadingData.dismiss();

    } catch (error) {
      console.error('Error al procesar la imagen:', error);
    }
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

  async presentAlertRoute(title: String, subheader: String, desc: String, botton: String, router: String) {
    const alert = await this.alertController.create({
      header: '' + title,
      subHeader: '' + subheader,
      message: '' + desc,
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {

            if (router != 'NO') {
              this.router.navigateByUrl('/' + router);
            }


          }
        }
      ],
    });
  }

}
