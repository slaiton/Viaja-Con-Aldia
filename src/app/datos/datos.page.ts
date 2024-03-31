import { Component, ElementRef, Input, OnInit, ViewChild, Renderer2 } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../api/user.service';
import { AlertController, IonAccordionGroup, LoadingController, ModalController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import { PhotoService } from '../api/photo.service';
import { log } from 'console';
import { Foto } from '../models/photo.interface';
import * as e from 'cors';
import { RegistroService } from '../api/registro.service';
import {FaceApiService} from '../api/face-api.service';
import {VideoPlayerService} from '../api/video-player.service';
import { Photo } from '@capacitor/camera';
import { forEach } from 'lodash';




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
  @Input() dataTercero: any = [];


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
  hiddenDocs:any = true;
  numDocs:any;

  public openDocs: boolean = false;
  public editDataItem: any | undefined = undefined;
  public isNew: boolean | undefined = undefined;

  documents_conductor:any = [];
  documents_vehiculo:any = [];


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
    fechaNacimiento: '',
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
    fechaNacimiento:'',
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
  fechaNacimientoTene:any;

  nombresProp:any;
  apellidosProp:any;
  correoProp:any;
  celularProp:any;
  direccionProp:any;
  fechaNacimientoProp:any;

  dataClases:any = [];
  dataMarcas:any = [];
  dataCarroc:any = [];
  dataLineas:any = [];
  dataColores:any = [];
  dataParentes:any = [];
  dataVehiculos:any = [];

  filteredData:any = [];
  searchControl = new FormControl();

  keyword = 'name';
  itemTemplate:any;
  notFoundTemplate:any;
  articulado:any =  false;
  token:any;



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
      tag: false,
      nombre: 'Documentos',
      icon: 'http://54.176.177.178/checklist/document.png',
      desc: 'Cerdula, Licencia de conduccion, Seguridad social',
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
    private loading: LoadingController


  ) {

    this.formDriver = formBuilder.group({
      nombres: ['',[Validators.required]],
      apellidos: ['',[Validators.required]],
      correo: ['',[Validators.required]],
      celular: ['',[Validators.required]],
      direccion: ['',[Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      nombreContacto: ['', [Validators.required]],
      celularContacto: ['', [Validators.required]],
      parentesco: ['', [Validators.required]],
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
      remolque: ['']
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

  async ngOnInit() {

    this.token = this.userService.getToken();
    this.conductor.cedula = this.userService.getCedula()
    this.vehiculo.placa = this.userService.getPlaca();

    if (this.userService.getToken() == null) {
      this.router.navigate(['/login']);
    }

    const loadingData = await this.loading.create({
      message: 'Generando Datos...',
    });

    loadingData.present();



      var validate = true;
      var validateDocs = true;
      var mensaje  = '<ul>';



      this.reg.getDataTercero(this.conductor.cedula).subscribe(cc => {

        this.getParentesco().then(
          data => {
            const objeto2 =  this.dataParentes.find((objeto2:any) => objeto2.name === cc.data[0].nombreParentes);
            // console.log(objeto2);

            if(objeto2 != undefined)
            {
              this.conductor.codigoParentesco = objeto2.id;
              this.conductor.parentesco = objeto2.name

            }else{
              validate = false;
              mensaje += '<li>Parentesco </li>'
            }
          }
         )

          const placa = cc.data[0].numeroPlacaxxx;

          if (placa != this.vehiculo.placa) {


            this.presentAlert("Alerta", "El vehiculo ha cambiado vuelva a iniciar sesion", "", "Cerrar");

          }

          if(cc.data[0].nombreTercerox) { this.conductor.nombres = cc.data[0].nombreTercerox}
          else { validate = false; mensaje += '<li>Nombres</li>'}
          if(cc.data[0].apell1Tercerox || cc.data[0].apell2Tercerox) { this.conductor.apellidos = cc.data[0].apell1Tercerox + ' ' +  cc.data[0].apell2Tercerox}
          else { validate = false; mensaje += '<li>Apellidos</li>'}
          if(cc.data[0].emailxTercerox) { this.conductor.correo = cc.data[0].emailxTercerox}
          else { validate = false; mensaje += '<li>Correo</li>'}
          if(cc.data[0].movilxContacto) { this.conductor.celular = cc.data[0].movilxContacto}
          else { validate = false; mensaje += '<li>Celular </li>'}
          if(cc.data[0].direccTercerox) { this.conductor.direccion = cc.data[0].direccTercerox}
          else { validate = false; mensaje += '<li>Direccion </li>'}
          if(cc.data[0].fechaxNacimien) { this.conductor.fechaNacimiento = cc.data[0].fechaxNacimien}
          else { validate = false; mensaje += '<li>Fecha Nacoimiento </li>'}
          if(cc.data[0].nombreContacto) { this.conductor.nombreContacto = cc.data[0].nombreContacto}
          else { validate = false; mensaje += '<li>Nombre Contacto</li>'}
          if(cc.data[0].movilxContacto) { this.conductor.celularContacto = cc.data[0].movilxContacto}
          else { validate = false; mensaje += '<li>Celular Contacto</li>'}
          if(cc.data[0].nombreParentes) { this.conductor.parentesco = cc.data[0].nombreParentes}
          else { validate = false; mensaje += '<li>Parentesco</li>'}

          if(cc.data[0].fechaxLicencia) { this.conductor.fechaLicencia = cc.data[0].fechaxLicencia}

          if (cc.data[0].foto) { this.hubImag.fotoperfil['webviewPath'] = cc.data[0].foto }


          this.terms['con_rec_pub'] = cc.data[0].AppConrecpub
          this.terms['grd_pod_pub'] = cc.data[0].AppGrdpodpub
          this.terms['rec_pub_gnr'] = cc.data[0].AppRecpubgnr
          this.terms['vin_per_pub'] = cc.data[0].AppVinperpub
          this.terms['per_tri_eco'] = cc.data[0].AppPertrieco
          this.terms['gre_rec_pub'] = cc.data[0].AppGrerecpub
          this.terms['gre_rec_pub_pro'] = cc.data[0].AppGrerecpubPro
          this.terms['gre_rec_pub_ten'] = cc.data[0].AppGrerecpubTen

          mensaje += "</ul>"


    if (!validate) {

      this.presentAlert("Alerta", "Es necesario ingresar:", mensaje, "Cerrar")

    }else{
        this.numDocs = 0;
        var tipos:any = [];

          this.documents_conductor.forEach((documento:any) => {
            documento.docs.forEach((doc:any) => {
                tipos.push(doc.codigo);
            });
        });



        var cadena = tipos.join(',');

          this.photo.getFotosTercero(this.conductor.cedula, cadena, 'conductor').toPromise().then(
            data =>{
             if (data.code == '201') {
               this.hiddenDocs = false;
               this.checkDocs = false;

               const entries = Object.entries(data.data);
               entries.forEach(([key, value]) => {
                 if (!value) {
                  this.numDocs += 1;
                 }
               });

              }else{
                this.checkDocs = true;
              }

            tipos = []

            this.documents_vehiculo.forEach((documento:any) => {
              documento.docs.forEach((doc:any) => {
                  tipos.push(doc.codigo);
              });
            });

            var cadena = tipos.join(',');
                 // this.getDriverApi(cedula, false);

                 this.photo.getFotosTercero(this.vehiculo.placa, cadena, 'vehiculo').toPromise().then(
                  data =>{
                  loadingData.dismiss()
                   if (data.code == '201') {
                    this.hiddenDocs = false;
                    this.checkDocs = false;

                     const entries = Object.entries(data.data);
                     entries.forEach(([key, value]) => {
                       if (!value) {
                        this.numDocs += 1;
                       }
                     });
                    }else{

                      if(this.checkDocs)
                      {
                        this.hiddenDocs = true;
                      }

                    }
                  });

            });

        }


       },
       err => {
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


  async loadVehicle()
  {

    var validate = true;
    const loadingData = await this.loading.create({
      message: 'Generando datos...',
    });

    loadingData.present();

    this.reg.getDataVehiculo(this.vehiculo.placa).subscribe(
      esl=> {
        var mensaje  = '<ul>';
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


          if(datos.numeroModeloxx) { this.vehiculo.modelo = datos.numeroModeloxx; }
          else { validate = false; mensaje += '<li> Modelo </li>' }
          if(datos.fechaxSoatxxxx) { this.vehiculo.fechaSoat = datos.fechaxSoatxxxx; }
          if(datos.fechaxTecnimec) { this.vehiculo.fechaTecno = datos.fechaxTecnimec; }



          if (datos.tipoxxVehiculo == "ARTICULADO")
          {
            this.vehiculo.articulado = true
            this.dataTercero.articulado = true;

          }else{
            this.vehiculo.articulado = false;
            this.dataTercero.articulado = false;
          }


          const dataClases = this.getClases();
          const dataMarcas = this.getMarcas();
          const dataColores = this.getColores();



          Promise.all([dataClases, dataMarcas, dataColores]).then(
                  ([doc1, doc2, doc3]) => {

                    loadingData.dismiss();
                    this.setOpenVehiculo(true)


                    const objeto2 =  this.dataClases.find((objeto2:any) => objeto2.name === datos.nombreClaseVeh);
                    // console.log(objeto2);

                    if(objeto2 != undefined)
                    {
                      this.vehiculo.codigoClase = objeto2.id;
                      this.vehiculo.claseVehiculo = objeto2.name

                    this.getCarroc(objeto2.id);
                    }else{
                      validate = false;
                      mensaje += '<li>Clase Vehiculo</li>'
                    }


                    const objeto1 =  this.dataMarcas.find((objeto1:any) => objeto1.name === datos.nombreVehmarca);
                    // console.log(objeto1);

                    if(objeto1 != undefined)
                    {
                      this.getClaseLinea(objeto1.id);
                      this.vehiculo.codigoMarca = objeto1.id;
                      this.vehiculo.marca = objeto1.name
                    }else{
                      validate = false;
                      mensaje += '<li>Marca</li>'
                       this.vehiculo.marca = ''
                      this.vehiculo.codigoMarca = ''

                    }

                  })

            }
          )

  }


  async getParentesco() {
    try {
      const data = await this.reg.getParent(this.token).toPromise();
      if (data.status) {
        const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];

          this.dataParentes.push({id:element.codigoParentes, name:element.nombreParentes});
        }
        // console.log(this.dataParentes);
      }
    } catch (error) {
      console.log(error);
    }
  }


  saveDocs(e:any){

  }
  cancelDocs(){

  }


  loadDocs()
  {


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

    console.log(this.openDocs);


  }



  loadDocuments()
  {

    if (!this.hubImag.cedula1['webviewPath']) {

      this.getDocument(this.conductor.cedula, 'cedula1', 'conductor').then(
        (data:any) => {
          if(data['code'] !== '204')
          {
            this.hubImag.cedula1['webviewPath'] = data['data'];
          }
        }
      )

    }
    if (!this.hubImag.cedula2['webviewPath']) {

      this.getDocument(this.conductor.cedula, 'cedula2', 'conductor').then(
        (data1:any) => {
          if(data1['code'] !== '204')
          {
            this.hubImag.cedula2['webviewPath'] = data1['data'];
          }
        }
      )

    }
    if (!this.hubImag.licencia1['webviewPath']) {

      this.getDocument(this.conductor.cedula, 'licencia1', 'conductor').then(
        (data2:any) => {
          if(data2['code'] !== '204')
          {
            this.hubImag.licencia1['webviewPath'] = data2['data'];
          }
        }
      )

    }
    if (!this.hubImag.licencia2['webviewPath']) {

      this.getDocument(this.conductor.cedula, 'licencia2', 'conductor').then(
        (data3:any) => {
          if(data3['code'] !== '204')
          {
            this.hubImag.licencia2['webviewPath'] = data3['data'];
          }
        }
      )

    }
    if (!this.hubImag.seguridadsocial['webviewPath']) {

      this.getDocument(this.conductor.cedula, 'seguridadsocial', 'conductor').then(
        (data4:any) => {
          if(data4['code'] !== '204')
          {
            this.hubImag.seguridadsocial['webviewPath'] = data4['data'];
          }
        }
      )

    }


    if (!this.hubImag.fotoperfil['webviewPath']) {

    this.getDocument(this.vehiculo.placa,'fotoperfil', 'conductor').then(
      (data5:any) => {
        if (data5['code'] !== '204') {
          this.hubImag.fotoperfil['webviewPath'] = data5['data'];
        }
      }
      )
    }


    if (!this.hubImag.soat1['webviewPath']) {

      this.getDocument(this.vehiculo.placa,'soat1', 'vehiculo').then(
         (data6:any) => {
           if (data6['code'] !== '204') {
             this.hubImag.soat1['webviewPath'] = data6['data'];
            }
          }
          )
        }


        if (!this.hubImag.fotoremol['webviewPath']) {

      this.getDocument(this.vehiculo.placa,'fotoremol', 'vehiculo').then(
         (data7:any) => {
           if (data7['code'] !== '204') {
             this.hubImag.fotoremol['webviewPath'] = data7['data'];
            }
          }
          )
        }


        if (!this.hubImag.tarjePro['webviewPath']) {

      this.getDocument(this.vehiculo.placa,'tarjePro', 'vehiculo').then(
         (data8:any) => {
           if (data8['code'] !== '204') {
             this.hubImag.tarjePro['webviewPath'] = data8['data'];
            }
          }
          )
        }


        if (!this.hubImag.tecnomecanica['webviewPath']) {

      this.getDocument(this.vehiculo.placa,'tecnomecanica', 'vehiculo').then(
         (data9:any) => {
           if (data9['code'] !== '204') {
             this.hubImag.tecnomecanica['webviewPath'] = data9['data'];
            }
          }
          )
        }



        if (!this.hubImag.fotovehi1['webviewPath']) {

      this.getDocument(this.vehiculo.placa,'fotovehi1', 'vehiculo').then(
         (data:any) => {
           if (data['code'] !== '204') {
             this.hubImag.fotovehi1['webviewPath'] = data['data'];
            }
          }
          )
        }


        if (!this.hubImag.fotovehi2['webviewPath']) {

      this.getDocument(this.vehiculo.placa,'fotovehi2','vehiculo').then(
         (data:any) => {
           if (data['code'] !== '204') {
             this.hubImag.fotovehi2['webviewPath'] = data['data'];
            }
          }
          )
        }


        if (!this.hubImag.fotovehi3['webviewPath']) {

      this.getDocument(this.vehiculo.placa,'fotovehi3', 'vehiculo').then(
         (data:any) => {
           if (data['code'] !== '204') {
             this.hubImag.fotovehi3['webviewPath'] = data['data'];
            }
          }
          )
        }


        if (!this.hubImag.fotovehi4['webviewPath']) {

      this.getDocument(this.vehiculo.placa,'fotovehi4', 'vehiculo').then(
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
      this.vehiculo.articulado = true;
    }else{
      this.vehiculo.articulado = false;
    }
    this.vehiculo.claseVehiculo = e.name;
    this.vehiculo.codigoClase = e.id;
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

  selectParente(e:any)
  {
   this.conductor.parentesco = e.name
   this.conductor.codigoParentesco = e.id
  }

  onChangeParente (e:any) {

  }

  onFocusedParente (e:any) {

  }



  async getClases() {
    try {
    const data = await this.reg.getClasevehiculo(this.token).toPromise();

        if (data.status) {
          const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];
          this.dataClases.push({id:element.codigoVehclase, name:element.nombreSiatxxxx,tipo:element.tipoxxVehiculo});
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

          this.dataMarcas.push({id:element.codigoVehmarca, name:element.nombreVehmarca});
        }
        // console.log(this.dataClases);
      }

     } catch (error) {
           console.log(error);
     }
  }

  async getCarroc(id:any) {
    try {

    this.dataCarroc = []
    const data = await this.reg.getCarrocerias(id, this.token).toPromise();

        if (data.status) {
          const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];

          this.dataCarroc.push({id:element.codigoVehcarro, name:element.nombrevehcarcl});
        }
        // console.log(this.dataCarroc);+
       }

      } catch (error) {
        console.log(error);
      }
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


  async getColores() {
    try {
      const data = await this.reg.getColores(this.token).toPromise();
      if (data.status) {
        const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];

          this.dataColores.push({id:element.codigoVehcolor, name:element.nombreVehcolor});
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

          this.vehiculo[campo] =  this.formVehicle.value[campo]
          jsonApi[campo] = this.formVehicle.value[campo]

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


    text += "</ul>";


    if (validate) {
      const envio = await this.reg.sendDataVehiculo(jsonApi);
      this.checkVehicle = true;
      this.setOpenVehiculo(false)
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


  async getDocument(codigo:any, tipo:any, tipoRegistro:any): Promise<any>
  {
    const resp:any = await this.photo.getFotoTercero(codigo,tipo,tipoRegistro).toPromise()
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
