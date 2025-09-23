import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, MenuController, ModalController, Platform } from '@ionic/angular';
import { UserService } from '../api/user.service';
import { PhotoService } from '../api/photo.service';

import { Router } from '@angular/router';
import { RegistroService } from '../api/registro.service';
import { Observable, forkJoin } from 'rxjs';
import { finalize, map, startWith } from 'rxjs/operators';
import { Photo } from '@capacitor/camera';
import * as e from 'cors';
import { AuthService } from '../api/auth.service';
import { StatusBar, Style } from '@capacitor/status-bar';


@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  @ViewChild('modal') modal!: ModalController;
  @ViewChild('modal2') modal2!: ModalController;
  @ViewChild('modal3') modal3!: ModalController;
  @ViewChild('modal4') modal4!: ModalController;
  @ViewChild('modalcode') modalcode!: ModalController;
  @ViewChild('autocompleteContainer', { static: false }) autocompleteContainer!: ElementRef;
  @Input() dataTercero: any = [];

  @ViewChild('fechaInput') fechaInputNac: any;

  registroForm: any = FormGroup;
  formNewVehicle: any = FormGroup;
  formNewDriver: any = FormGroup;
  formNewProp: any = FormGroup;
  formNewTene: any = FormGroup;
  formSendCode: any = FormGroup;
  newVehicle: any = false;
  checkVehicle: any = false;
  newTercero: any = false;
  checkTercero: any = false;
  alertVehiculo: any = false;
  incompletoVehiculo: any = false;
  incompletoTenedor: any = false;
  incompletoPropiet: any = false;
  incompletoTercero: any = false;
  alertTercero: any = false;
  checkImagen: any = false;
  ip: any;
  // articulado:any = false;

  checkPropi: any = true;
  newPropiet: any = false;
  alertPropi: any = false;

  checkTened: any = true;
  newTenedor: any = false;
  alertTened: any = false;

  isModalOpen: any = false;
  isModalOpen2: any = false;
  isModalOpen3: any = false;
  isModalOpen4: any = false;
  isModalOpen5: any = false;
  isModalOpen6: any = false;
  loadDocuments: any = false;
  modalCodeOpen: any = false;
  validateLoadDocs: any = true;
  validateSaveDocs: any = true;
  docsFailVehicle: any = [];
  docsFailDriver: any = [];

  loadingData: any;
  codeValidation: any = false;

  jsonDocs: any = [];


  public vista: any = [];

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
    cedulaTene: '',
    claseVehiculo: '',
    codigoClase: '',
    carroceria: '',
    codigoCarroceria: '',
    fechaSoat: false,
    fechaTecno: false,
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
    celularPropietario: '',
    celularPropietariox3: '',
    celularPropietarioLast: ''
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
    fechaLicencia: '',
    terms: {
      con_rec_pub: [],
      grd_pod_pub: [],
      rec_pub_gnr: [],
      vin_per_pub: [],
      per_tri_eco: [],
      gre_rec_pub: [],
    }
  }

  aceptTermData: any = false;
  completeData: any = false;
  aceptTerms: any = false;
  dataTerms: any;

  hubImag: any = {
    licencia1: { webviewPath: false },
    licencia2: { webviewPath: false },
    cedula1: { webviewPath: false },
    cedula2: { webviewPath: false },
    tarjePro1: { webviewPath: false },
    tarjePro2: { webviewPath: false },
    soat1: { webviewPath: false },
    tecnomecanica: { webviewPath: false },
    fotoremol: { webviewPath: false },
    tarjePror1: { webviewPath: false },
    tarjePror2: { webviewPath: false },
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

  // tarjePro:any = [];
  // soat1:any = [];
  // tecnomecanica:any = [];

  cedulaFro: any = [];
  cedulaPos: any = [];
  licencFro: any = [];
  licencPos: any = [];



  dataVehiculo: any = {};
  // fotoPerfil:any = [];

  dataClases: any = [];
  dataMarcas: any = [];
  dataCarroc: any = [];
  dataLineas: any = [];
  dataColores: any = [];
  dataParentes: any = [];
  dataSatelital: any = [];

  token: any;



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

  gre_rec_pub_pro: any = false;
  gre_rec_pub_ten: any = false;


  filteredData: any = [];
  searchControl = new FormControl();

  keyword = 'name';
  itemTemplate: any;
  notFoundTemplate: any;

  isPropietario: any = true;
  isTenedor: any = true;

  questions = [
    { text: '¿Por su cargo o actividad maneja recursos publicos?', formControlName: 'con_rec_pub' },
    { text: '¿Por su cargo o actividad ejerce algun grado del poder publico?', formControlName: 'grd_pod_pub' },
    { text: '¿Por su actividad u oficio goza usted de reconocimiento publico?', formControlName: 'rec_pub_gnr' },
    { text: '¿Existe algun vinculo entre usted y alguna persona publicamente expuesta?', formControlName: 'vin_per_pub' },
    { text: '¿Es usted sujeto de obligaciones tributarias en otro pais o grupo de paises?', formControlName: 'per_tri_eco' },
    { text: '¿Pertenece usted a gremios o asociaciones reconocidas?', formControlName: 'gre_rec_pub' },
  ];

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
    private formBuilder: FormBuilder,
    private loading: LoadingController,
    private user: UserService,
    private alertController: AlertController,
    private photo: PhotoService,
    private platform: Platform,
    private router: Router,
    private reg: RegistroService,
    private auth: AuthService,
    private menu: MenuController) {
    this.initializeApp();

    this.documents_vehiculo = this.user.documents_vehiculo
    this.documents_conductor = this.user.documents_conductor

    this.registroForm = this.formBuilder.group({
      placa: ['', [Validators.required]],
      cedula: ['', [Validators.required]],
      propietario: [],
      tenedor: []
    });

    this.formNewVehicle = this.formBuilder.group({
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
      cuentaSatelital: ['']
    });

    this.formNewDriver = formBuilder.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      celular: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      nombreContacto: ['', [Validators.required]],
      celularContacto: ['', [Validators.required]],
      parentesco: ['', [Validators.required]],
      fechaSeguridad: [],
      fechaLicencia: [],
      terms: formBuilder.group({
        con_rec_pub: false,
        grd_pod_pub: false,
        rec_pub_gnr: false,
        vin_per_pub: false,
        per_tri_eco: false,
        gre_rec_pub: false,
      })
    });


    this.formNewProp = formBuilder.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      correo: ['', [Validators.required]],
      celular: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      fechaNacimiento: [''],
      nombreContacto: [''],
      celularContacto: [''],
      parentesco: [''],
      gre_rec_pub: false
    });


    this.formNewTene = formBuilder.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      correo: ['', [Validators.required]],
      celular: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      fechaNacimiento: [''],
      nombreContacto: [''],
      celularContacto: [''],
      parentesco: [''],
      gre_rec_pub: false
    });

    this.formSendCode = formBuilder.group({
      codigo: ['', [Validators.required]]
    });

  }

  ngOnInit() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.router.navigate(['/login']);
    });


    // Pregunta si esta seguro de salir
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.setStatusBarColor();
    });
  }

  setStatusBarColor() {
    if (this.platform.is('android')) {
      StatusBar.setBackgroundColor({ color: '#5C8CDF' });
    } else if (this.platform.is('ios')) {
      StatusBar.setStyle({ style: Style.Dark });
    }
  }

  ngAfterViewInit() {

    const term = document.getElementById('term-scroll');


    term?.addEventListener('click', function () {
      console.log('click');

    });


    term?.addEventListener('scroll', function () {
      console.log(term.scrollHeight);

      if (term.scrollHeight - term.scrollTop === term.clientHeight) {
        console.log('fin');

      }
    });

  }


  validateTerms() {
    if (!this.aceptTermData) {
      this.setOpenTermsData(true);
    }
  }

  saveDocs(e: any) {

  }
  cancelDocs() {

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

  getCarroc(id: any) {
    this.dataCarroc = []
    this.reg.getCarrocerias(id, this.token).subscribe(
      data => {
        if (data.status) {
          const dataArray = data.data;
          for (let a = 0; a < dataArray.length; a++) {
            const element = dataArray[a];

            this.dataCarroc.push({ id: element.codigoVehcarro, name: element.nombrevehcarcl });
          }
          // console.log(this.dataCarroc);
        }
      }
    )
  }

  async getCarroc2(id: any) {
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
    try {
      this.dataLineas = []
      const data = await this.reg.getLineas(id, '', this.token).toPromise();
      if (data.status) {
        const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];

          this.dataLineas.push({ id: element.codigoVehlinea, name: element.nombreVehlinea });
        }

      }
    } catch (error) {
      console.log(error);
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


  async getParentesco() {
    try {
      const data = await this.reg.getParent(this.token).toPromise();
      if (data.status) {
        const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];

          this.dataParentes.push({ id: element.codigoParentes, name: element.nombreParentes });
        }
        console.log(this.dataParentes);
      }
    } catch (error) {
      console.log(error);
    }
  }


  async getSatelital() {
    try {
      const data = await this.reg.getSatelital(this.token).toPromise();

      console.log(data);


      if (data.status) {
        const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];
          this.dataSatelital.push({ id: element.codigoVehgpsxx, name: element.nombreVehgpsxx });
        }
      }

    } catch (error) {
      console.log(error);
    }
  }




  searchInfoVeh(clase: any, marca: any, carro: any, linea: any, color: any) {

    var validate = true;
    var text = ''

    // const objeto2 =  this.dataClases.find((objeto2:any) => objeto2.name === clase);
    // if(objeto2 != undefined)
    // {
    //   this.vehiculo.codigoClase = objeto2.id;
    //   this.vehiculo.claseVehiculo = objeto2.name

    // this.getCarroc(objeto2.id);
    // }else{
    //   validate = false;
    //   text += '<li>Clase Vehiculo</li>'
    // }

    // const objeto1 =  this.dataMarcas.find((objeto1:any) => objeto1.name === marca);
    // if(objeto1 != undefined)
    // {
    //   this.getClaseLinea(objeto1.id);
    //   this.vehiculo.codigoMarca = objeto1.id;
    //   this.vehiculo.marca = objeto1.name
    // }else{
    //   validate = false;
    //   text += '<li>Marca</li>'
    //    this.vehiculo.marca = ''
    //   this.vehiculo.codigoMarca = ''
    //   this.formNewVehicle.patchValue({
    //     marca: ''
    //   })
    // }

    // const objeto3 =  this.dataColores.find((objeto3:any) => objeto3.name === color);

    // if(objeto3 != undefined)
    // {
    //   this.vehiculo.codigoColor = objeto3.id;
    //   this.vehiculo.color = objeto3.name
    // }else{
    //   validate = false;
    //   text += '<li>Color</li>'
    //    this.vehiculo.color = ''
    //   this.vehiculo.codigoColor = ''
    //   this.formNewVehicle.patchValue({
    //     color: ''
    //   })
    // }


    if (validate) {
      return { code: true }
    } else {
      return { code: false, data: text }
    }




  }

  // searchMarca(name:any) {
  //   const objeto =  this.dataMarcas.find((objeto:any) => objeto.name === name);
  //   return objeto?.id;
  // }
  // searchClase(name:any) {
  //   const objeto =  this.dataClases.find((objeto:any) => objeto.name === name);
  //   return objeto?.id;
  // }
  // searchCarro(name:any) {
  //   const objeto =  this.dataCarroc.find((objeto:any) => objeto.name === name);
  //   return objeto?.id;
  // }

  async selectEvent(e: any) {

    const loading = await this.loading.create({
      message: 'Cargando Datos...'
    });

    loading.present();

    this.formNewVehicle.patchValue({
      carroceria: ''
    });

    if (e.tipo == "ARTICULADO") {
      this.vehiculo.articulado = true;
      this.dataTercero.articulado = true;
      // this.documents_vehiculo[4].hidden = false;
      this.formNewVehicle.get('remolque').setValidators(Validators.required);
    } else {
      this.vehiculo.articulado = false;
      this.vehiculo.remolque = ''
      this.dataTercero.articulado = false;
      this.formNewVehicle.patchValue({
        remolque: ''
      });
      // this.documents_vehiculo[4].hidden = true;
      this.formNewVehicle.get('remolque').setValidators('');
    }

    this.vehiculo.claseVehiculo = e.name;
    this.vehiculo.codigoClase = e.id;
    this.getCarroc2(e.id).then(
      data => {
        loading.dismiss();
      }
    )
  }


  onChangeSearch(e: any) {

  }

  onFocused(e: any) {

  }

  onBlurClase(e: any) {
    const objeto = this.dataClases.find((objeto: any) => objeto.name === e.target.value);
    if (!objeto) {
      this.formNewVehicle.get('claseVehiculo')?.setValue('');
    }
  }

  async selectMarca(e: any) {
    const loading = await this.loading.create({
      message: 'Cargando Datos...'
    });

    loading.present();

    this.formNewVehicle.patchValue({
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
    setTimeout(() => {
      this.scrollToAutocomplete();
    }, 200);
  }

  onBlurMarca(e: any) {
    const objeto = this.dataMarcas.find((objeto: any) => objeto.name === e.target.value);
    if (!objeto) {
      this.formNewVehicle.get('marca')?.setValue('');
    }
  }


  scrollToAutocomplete() {
    const yOffset = this.autocompleteContainer.nativeElement.offsetTop;
    window.scrollTo({
      top: yOffset - 100, // Ajusta este valor según sea necesario
      behavior: 'smooth'
    });
  }


  selectCarroceria(e: any) {
    this.vehiculo.codigoCarroceria = e.id;
    this.vehiculo.carroceria = e.name;
  }
  onChangeCarroceria(e: any) {

  }
  onFocusedCarroceria(e: any) {

  }

  onBlurCarroceria(e: any) {
    const objeto = this.dataCarroc.find((objeto: any) => objeto.name === e.target.value);
    if (!objeto) {
      this.formNewVehicle.get('carroceria')?.setValue('');
    }
  }

  selectLinea(e: any) {
    this.vehiculo.linea = e.name
    this.vehiculo.codigoLinea = e.id
  }

  onChangeLinea(e: any) {

  }
  onFocusedLinea(e: any) {

  }

  onBlurLinea(e: any) {
    const objeto = this.dataLineas.find((objeto: any) => objeto.name === e.target.value);
    if (!objeto) {
      this.formNewVehicle.get('linea')?.setValue('');
    }
  }


  selectColor(e: any) {
    this.vehiculo.color = e.name
    this.vehiculo.codigoColor = e.id
  }


  onChangeColor(e: any) {

  }
  onFocusedColor(e: any) {

  }


  onBlurColor(e: any) {

    const objeto = this.dataColores.find((objeto: any) => objeto.name === e.target.value);
    if (!objeto) {
      this.formNewVehicle.get('color')?.setValue('');
    }

  }


  selectParente(e: any) {
    console.log(e);
  }


  onChangeParente(e: any) {
    this.conductor.codigoParentesco = e.target.value
  }



  selectSatelital(e: any) {
    this.vehiculo.empresaSatelital = e.name
    this.vehiculo.codigoSatelital = e.id
  }

  onChangeSatelital(e: any) {

  }

  onFocusedSatelital(e: any) {
    console.log(e);
  }

  onBlurSatelital(e: any) {
    console.log(e.target.value);

    const objeto = this.dataSatelital.find((objeto: any) => objeto.name === e.target.value);
    if (!objeto) {
      this.formNewVehicle.get('empresaSatelital')?.setValue('');
    }

  }



  onSubmit() {

    if (this.completeData) {
      this.saveDocument();
    }
  }

  async saveUser() {

    if (!this.checkTercero) {
      // this.presentAlert("Alerta","","Informacion del conductor requerida","Cerrar")
      return;
    }

    if (!this.checkVehicle) {
      // this.presentAlert("Alerta","","Informacion del vehiculo requerida","Cerrar")
      return;
    }

    if (!this.isTenedor) {
      if (!this.registroForm.value.tenedor) {
        this.presentAlert("Alerta", "", "Es Requerida cedula del tenedor", "Cerrar")
        return;
      }
    }

    if (!this.isPropietario) {
      if (!this.registroForm.value.propietario) {
        this.presentAlert("Alerta", "", "Es Requerida cedula del propietario", "Cerrar")
        return;
      }
    }


    var json = {
      codigoTercerox: this.conductor.cedula,
      numeroPlacaxxx: this.vehiculo.placa,
      codigoRxxxxxxx: this.vehiculo.remolque,
      codigoPropieta: this.propietario.cedula,
      codigoTenedorx: this.tenedor.cedula,
      indicaIgualpro: this.isPropietario,
      indicaIgualten: this.isTenedor,
      nombreContacto: this.conductor.nombreContacto,
      movilxContacto: this.conductor.celularContacto,
      parentContacto: this.conductor.parentesco,
      nombreReferen1: '',
      movilxReferen1: '',
      empresReferen1: '',
      fechaxTecnicox: this.vehiculo.fechaTecno,
      fechaxSoatxxxx: this.vehiculo.fechaSoat,
      indicaProptene: '',
      numeroEstadoxx: 1,
      estadoSiatxx: 'INACTIVO',
      usuariCreacion: '',
      fechaxCreacion: '',
      ciudadCreacion: '',
      apiSeguridad: '',
      apiFotoConductor: this.hubImag.fotoperfil.webviewPath,
      apiTarjeta1: this.hubImag.tarjePro.webviewPath,
      apiLicencia1: this.hubImag.licencia1.webviewPath,
      apiLicencia2: this.hubImag.licencia2.webviewPath,
      apiTarjeta2: '',
      apiSoat1: this.hubImag.soat1.webviewPath,
      apiSoat2: '',
      apiRecibo: '',
      apiTrailer: this.hubImag.fotoremol.webviewPath,
      apiRegistroTrailer: this.hubImag.tarjePror.webviewPath,
      apiCertificadoTrailer: '',
      apiFoto1: this.hubImag.fotovehi1.webviewPath,
      apiFoto2: this.hubImag.fotovehi2.webviewPath,
      apiFoto3: this.hubImag.fotovehi3.webviewPath,
      apiFoto4: this.hubImag.fotovehi4.webviewPath,
      apiCedula1: this.hubImag.cedula1.webviewPath,
      apiCedula2: this.hubImag.cedula2.webviewPath,
      apiTecnico1: this.hubImag.tecnomecanica.webviewPath,
      apiTecnico2: '',
      indicaApruebax: '',
      usuariApruebax: '',
      fechaxApruebax: '',
      indicaSatelital: '',
      fechaxLicencia: this.conductor.fechaLicencia,
      nombreTercerox: this.conductor.nombres,
      apell1Tercerox: this.conductor.apellidos.split(' ')[0],
      apell2Tercerox: this.conductor.apellidos.split(' ')[1],
      codigoCiudadxx: '',
      movilxTercerox: '',
      emailxTercerox: '',
      numeroModeloxx: this.vehiculo.modelo,
      numeroRepotenc: '',
      codigoVehmarca: this.vehiculo.codigoMarca,
      codigoVehlinea: this.vehiculo.codigoLinea,
      codigoVehclase: this.vehiculo.codigoClase,
      codigoVehcolor: this.vehiculo.codigoColor,
      codigoVehcarro: this.vehiculo.codigoCarroceria,
      sateliFechaxxx: '',
      change: this.codeValidation,
      AppConrecpub: this.terms['con_rec_pub'],
      AppGrdpodpub: this.terms['grd_pod_pub'],
      AppRecpubgnr: this.terms['rec_pub_gnr'],
      AppVinperpub: this.terms['vin_per_pub'],
      AppPertrieco: this.terms['per_tri_eco'],
      AppGrerecpub: this.terms['gre_rec_pub'],
      propietario: {
        indicaIgualpro: !this.isPropietario,
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
        indicaIgualten: !this.isTenedor,
        codigoTercerox: this.tenedor.cedula,
        nombreTercerox: this.tenedor.nombres,
        apell1Tercerox: this.tenedor.apellidos,
        apell2Tercerox: '',
        codigoCiudadxx: '',
        movilxTercerox: this.tenedor.celular,
        emailxTercerox: this.tenedor.correo,
        AppGrerecpubTen: this.terms['gre_rec_pub_ten'],
      }
    }


    await this.user.registroApiAldia(json, this.token).then(
      data => {

      },
      err => {
        this.loadingData.dismiss();
        this.presentAlert("Error", "Se presento un error al guardar los datos", err.error.message || err.message || "Error desconocido", "Cerrar");
      }
    )


    const buttons = [
      {
        text: 'Continuar',
        handler: () => {
        this.menu.enable(true);
        this.router.navigate(['/home']);
        },
      }
    ]

    await this.user.loginUser(this.conductor.cedula, this.vehiculo.placa).then(
      (data: any) => {
        this.loadingData.dismiss();
        this.user.setToken(data.access_token);
        localStorage.setItem('conductor', this.conductor.cedula);
        localStorage.setItem('placa', this.vehiculo.placa);

        this.user.onLoginChange.next(data.access_token);
        this.presentAlertButtons("Exito", "Usuario Creado", "Inicia Sesion", "Cerrar", buttons);

      },
      err => {
        this.loadingData.dismiss();
        this.presentAlert("Error", "Se presento un error en el app", err.error.message || err.message || "Error desconocido", "Cerrar");
      }
    )

  }

  async saveDocument() {
    this.jsonDocs = {
      files: [],
    };

    this.loadingData = await this.loading.create({
      message: 'Generando Usuario...',
    });

    this.loadingData.present()

    if (this.hubImag.fotoperfil.base64) {
      const dataDoc = {
        codigo: this.conductor.cedula,
        tipo: 'fotoperfil',
        tipoRegistro: 'conductor',
        data64: this.hubImag.fotoperfil.base64,
      }

      this.jsonDocs.files.push(dataDoc);

    }

    this.user.cargaDocumentos(this.jsonDocs)
      .subscribe(
        (data) => {
          const files = data.data;
          this.loadDocuments = true;

          if (files.fotoperfil) {
            this.hubImag.fotoperfil.webviewPath = files.fotoperfil;
          }

        },
        (err) => {
          this.loadingData.dismiss();
          this.presentAlert("Error", "Se presento un error al guardar los documentos", err.error.message || err.message || "Error desconocido", "Cerrar");
        },
        () => {
          if (!this.aceptTerms) {
            this.getDataFirma(this.conductor.cedula, 2).then(async data => {

              if (data.status) {
                this.aceptTerms = true;
                await this.saveUser();
              } else {
                this.setOpenTerms(true)
                this.loadingData.dismiss();
              }

            })
          } else {
            this.saveUser();
          }
        }
      )

  }

  openDocumentController(doc: any, tipo: any, statusDoc: any, docs: any) {

    if (tipo == 'conductor' && doc != '') {
      this.dataTercero['cedula'] = doc
      this.dataTercero['placa'] = '';
      this.dataTercero['docs'] = docs

      this.setOpenTer(false)
      this.modal2.dismiss();
      this.openDocs = true;


    } else if (tipo == 'vehiculo' && doc != '') {
      if (this.vehiculo.articulado) {
        this.dataTercero['articulado'] = this.vehiculo.remolque;
      }
      this.dataTercero['placa'] = doc
      this.dataTercero['cedula'] = ''
      this.dataTercero['docs'] = docs

      this.setOpenVeh(false);
      this.modal.dismiss()
      this.openDocs = true;

    }

  }


  async searchVehicle(e: any) {

    var validate = true;
    let placaObj = document.getElementById('placa') as HTMLInputElement;
    placaObj.value = e.target.value.toUpperCase()
    if (e.target.value.length > 5) {
      let placa = placaObj.value
      this.vehiculo.placa = placa
      this.dataTercero['placa'] = placa
      this.dataTercero['cedula'] = ''

      this.formNewVehicle.reset();

      this.vehiculo.claseVehiculo = ''
      this.vehiculo.carroceria = ''
      this.vehiculo.fechaSoat = ''
      this.vehiculo.fechaTecno = ''
      this.vehiculo.marca = ''
      this.vehiculo.color = ''
      this.vehiculo.modelo = ''

      this.hubImag.soat1 = []
      this.hubImag.tecnomecanica = []
      this.hubImag.tarjePro = []
      this.hubImag.tarjePror = []
      this.hubImag.fotoremol = []
      this.hubImag.fotovehi1 = []
      this.hubImag.fotovehi2 = []
      this.hubImag.fotovehi3 = []
      this.hubImag.fotovehi4 = []


      this.loadingData = await this.loading.create({
        message: 'Buscado Vehiculo...',
      });

      this.loadingData.present();

      try {

        const esl = await this.reg.getDataVehiculo(placa)
        var mensaje = '<ul>';
        const datos = esl.data[0];
        const cedulaTer = datos['codigoTercerox']

        this.vehiculo.celularPropietario = datos.celularPropietario

        if (datos.celularPropietario) {
          this.vehiculo.celularPropietariox3 = datos.celularPropietario.slice(0, 3)
          this.vehiculo.celularPropietarioLast = datos.celularPropietario.charAt(datos.celularPropietario.length - 1)
        }

        if (cedulaTer != null && !this.codeValidation) {
          this.presentAlert("Alerta", "", "Vehiculo ya registra en el app", "Cerrar")
          // this.checkVehicle = false;
          // this.alertVehiculo = true;
          this.incompletoVehiculo = false;
          this.setOpenCode(true)
          validate = false;
          this.loadingData.dismiss();
          return;
        } else {

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
          this.vehiculo.remolque = datos.placaRemolque
          this.vehiculo.usuarioSatelital = datos.sateliUsuariox
          this.vehiculo.claveSatelital = datos.satelContrasen
          this.vehiculo.codigoSatelital = datos.sateliEmpresax
          this.vehiculo.empresaSatelital = datos.nombreAppempgp
          this.vehiculo.cuentaSatelital = datos.satelCuentaxx
          this.vehiculo.celularPropietario = datos.celularPropietario


          if (datos.celularPropietario) {
            this.vehiculo.celularPropietariox3 = datos.celularPropietario.slice(0, 3)
            this.vehiculo.celularPropietarioLast = datos.celularPropietario.charAt(datos.celularPropietario.length - 1)
          }

          this.vehiculo.fechaSoat = datos.fechaxSoatxxxx
          this.vehiculo.fechaTecno = datos.fechaxTecnimec
          this.formNewVehicle.patchValue({
            fechaSoat: datos.fechaxSoatxxxx,
            fechaTecno: datos.fechaxTecnimec
          })


          await this.getClases();
          await this.getMarcas();
          await this.getCarroc2(datos.codigoVehclase);
          await this.getClaseLinea(datos.codigoVehmarca);
          await this.getColores()
          await this.getSatelital();



          if (datos.numeroModeloxx) { this.vehiculo.modelo = datos.numeroModeloxx; }
          else { validate = false; mensaje += '<li> Modelo </li>' }
          if (datos.fechaxSoatxxxx) { this.vehiculo.fechaSoat = datos.fechaxSoatxxxx; }
          if (datos.fechaxTecnimec) { this.vehiculo.fechaTecno = datos.fechaxTecnimec; }



          if (datos.tipoxxVehiculo == "ARTICULADO") {

            this.dataTercero.articulado = true;
            this.vehiculo.articulado = true

            if (!this.vehiculo.remolque) {

              validate = false;
              mensaje += '<li> Es necesario Remolque </li>'

            }

          } else {
            ;
            this.vehiculo.articulado = false;
            this.dataTercero.articulado = false;
          }



          if (!validate) {
            this.incompletoVehiculo = true;
            this.checkVehicle = false;
            this.setOpenVeh(true)
            this.presentAlert("Alerta", "Es necesario ingresar:", mensaje, "Cerrar")
            this.loadingData.dismiss();[]
          } else {

            var statusDoc = true;
            var docs: any = [];
            var text: any = '<ul>'
            var docsFinal: any = []
            var docsVehiculo = false;
            var status: any = true;

            if (!datos.documents.status) {
              statusDoc = datos.documents.status;
              docs = datos.documents.documents;
              this.docsFailVehicle = docs;
            } else {
              docsFinal = this.documents_vehiculo;
            }

            const response: any = await this.validateDocuments(this.vehiculo.placa, this.documents_vehiculo, 'vehiculo')

            console.log(response);

            if (response['status']) {
              this.incompletoVehiculo = false
              this.newVehicle = false
              this.checkVehicle = true;
            } else {
              this.openDocs = true;
              this.openDocumentController(this.vehiculo.placa, 'vehiculo', true, response['data']);
            }

          }

        }

      } catch (err: any) {

        this.user.getVehiculoByPlaca(placa).subscribe(async data => {
          if (data.code == 200 && data.rows > 0) {
            const datos = data.view.data[0];
            var mensaje = '<ul>';

            // this.vehiculo.codigoMarca = datos.marca
            // this.vehiculo.codigoLinea = datos.codigoVehlinea
            // this.vehiculo.codigoClase = datos.codigoVehclase
            // this.vehiculo.codigoColor = datos.codigoVehcolor
            // this.vehiculo.codigoCarroceria = datos.codigoVehcarro
            this.vehiculo.marca = datos.marca
            this.vehiculo.carroceria = datos.carroceria
            this.vehiculo.claseVehiculo = datos.clase_vehiculo
            this.vehiculo.linea = datos.clase_linea
            this.vehiculo.color = datos.color

            // var resp = this.searchInfoVeh(datos.claseVehiculo, datos.marca, datos.carroceria, datos.clase_linea, datos.color);

            this.getClases().then(
              data => {
                const objeto2 = this.dataClases.find((objeto2: any) => objeto2.name === datos.clase_vehiculo);
                // console.log(objeto2);
                if (objeto2 != undefined) {
                  this.vehiculo.codigoClase = objeto2.id;
                  this.vehiculo.claseVehiculo = objeto2.name

                  this.getCarroc(objeto2.id);
                } else {
                  validate = false;
                  mensaje += '<li>Clase Vehiculo</li>'
                }
              }
            )


            this.getMarcas().then(
              data => {
                // console.log("getMarcas Cargado")
                // console.log(data);

                const objeto1 = this.dataMarcas.find((objeto1: any) => objeto1.name === datos.marca);
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
                  this.formNewVehicle.patchValue({
                    marca: ''
                  })
                }


              }
            )
            this.getColores().then(
              data => {
                // console.log(".getColores Cargado");
                // console.log(data);

                const objeto3 = this.dataColores.find((objeto3: any) => objeto3.name === datos.color);
                // console.log(objeto3);


                if (objeto3 != undefined) {
                  this.vehiculo.codigoColor = objeto3.id;
                  this.vehiculo.color = objeto3.name
                } else {
                  validate = false;
                  mensaje += '<li>Color</li>'
                  this.vehiculo.color = ''
                  this.vehiculo.codigoColor = ''
                  this.formNewVehicle.patchValue({
                    color: ''
                  })
                }

              }
            )


            // Promise.all([clases, marcas, colores]).then(
            //   ([doc1, doc2, doc3]) => {




            //  if (!resp.code) {
            //   validate = false;
            //   mensaje += resp.data
            // }else{



            // const objeto4 = this.dataLineas.find((objeto4: any) => objeto4.name === datos.clase_linea);

            // if (objeto4 == undefined) {
            //   validate = false;
            //   mensaje += '<li>Clase Linea</li>'
            //   this.vehiculo.linea = ''
            //   this.vehiculo.codigoLinea = ''
            //   this.formNewVehicle.patchValue({
            //     linea: ''
            //   })
            // } else {
            //   this.vehiculo.codigoLinea = objeto4.id;
            //   this.vehiculo.linea = objeto4.name
            // }

            // console.log(datos.carroceria);


            // var carropro = datos.carroceria.toString();
            // carropro = carropro.replace(/\s/g, "");
            // const objeto = this.dataCarroc.find((objeto: any) => objeto.name === datos.carroceria);
            // if (objeto == undefined) {
            //   this.vehiculo.carroceria = ''
            //   this.vehiculo.codigoCarroceria = ''
            //   this.formNewVehicle.patchValue({
            //     carroceria: ''
            //   })

            //   validate = false;
            //   mensaje += '<li>Carroceria</li>'

            // } else {
            //   this.vehiculo.codigoCarroceria = objeto?.id;
            //   this.vehiculo.carroceria = carropro;
            // }

            // }

            // })


            this.getSatelital().then(
              data => {

              }
            )



            // this.claseVehiculo = datos.claseVehiculo;
            // this.marca = datos.marca;
            // this.linea = datos.clase_linea
            // this.color = datos.color

            // this.fechaSoat = datos.vigencia_soat;
            // this.fechaTecno = datos.vigencia_tecnomecanica;
            // this.modelo = datos.modelo;

            if (datos.modelo) { this.vehiculo.modelo = datos.modelo; }
            else { validate = false; mensaje += '<li>Modelo </li>' }
            if (datos.vigencia_soat) { this.vehiculo.fechaSoat = datos.vigencia_soat; }
            // else { validate = false; mensaje += '<li> Vencimiento SOAT </li>' }
            if (datos.vigencia_tecnomecanica) { this.vehiculo.fechaTecno = datos.vigencia_tecnomecanica; }
            // else { validate = false; mensaje += '<li> Vencimienton Tecnomecanica </li>' }



            if (datos.tipo_vehiculo == "ARTICULADO") {
              this.vehiculo.articulado = true

            } else {
              this.vehiculo.articulado = false
            }


            mensaje += "</ul>"

            if (!validate) {
              this.incompletoVehiculo = true;
              this.checkVehicle = false;
              this.setOpenVeh(true)
              this.presentAlert("Alerta", "Es necesario ingresar:", mensaje, "Cerrar")
              this.loadingData.dismiss();
            } else {


              const response: any = await this.validateDocuments(this.vehiculo.placa, this.documents_vehiculo, 'vehiculo')

              if (response['status']) {
                this.incompletoVehiculo = false
                this.newVehicle = false
                this.checkVehicle = true;
              } else {
                this.openDocs = true;
                this.openDocumentController(this.vehiculo.placa, 'vehiculo', true, response['data']);
              }

            }

            //  this.getDataVehculo();

            this.newVehicle = false;

          } else {
            this.newVehicle = true;
            this.checkVehicle = false;
            this.loadingData.dismiss();
            // this.modal.present();
            // this.presentAlert("Alerta","","Vehiculo","Cerrar")
          }

        },
          async err => {

            this.newVehicle = true;
            this.incompletoVehiculo = false;
            this.checkVehicle = false;

            console.log("ERROR", err);

            await this.getClases()

            await this.getMarcas()

            await this.getColores()

            await this.getSatelital()

            this.loadingData.dismiss();

          })
      }
    }
  }

  async validateDocuments(codigo: any, array: any, tipo: any) {
    const tipos: any = [];
    const docsFinal: any = []


    array.forEach((documento: any) => {
      if (documento.articulado && !this.vehiculo.articulado) return;
      documento.docs.forEach((doc: any) => {
        tipos.push(doc.codigo);
      });
    });

    const cadena = tipos.join(',')

    try {
      const b = await this.photo.getFotosTercero(codigo, cadena, tipo, this.vehiculo.remolque).toPromise();

      const data = this.removeMatchingKeys(b)

      this.loadingData.dismiss();

      if (data.code === 201) {
        const docsFinal = [];

        for (const a in data.data) {
          const status = data.data[a];

          if (!status) {
            const doc = this.user.buscarCodigoEnDocumentos(a);
            if (doc) {
              docsFinal.push(doc);
            }
          }
        }

        return { status: false, data: docsFinal };

      } else {
        return { status: true, data: docsFinal };
      }
    } catch (error) {
      this.loadingData.dismiss();
      console.error("Error al obtener fotos del tercero:", error);
      return true;
    }

  }


  async searchConductor(e: any, a: any) {

    var cc = ''

    if (a) {
      cc = this.conductor.cedula
    } else {
      cc = e.target.value
    }

    this.loadingData = await this.loading.create({
      message: 'Buscado Cedula...',
    });

    this.loadingData.present();

    if (cc.length >= 6) {
      this.aceptTermData = false;
      let cedula = cc
      this.conductor.cedula = cc;
      this.dataTercero['cedula'] = cc;
      this.dataTercero['placa'] = ''
      this.user.getTemporalToken(cedula, 'na').subscribe(
        (data: any) => {
          if (data.access_token != 0) {
            this.token = data.access_token;
            if (!this.aceptTermData) {
              this.getDataFirma(cedula, 1).then(data => {
                // console.log(data.status);
                if (data.status) {
                  this.aceptTermData = true;
                  this.getDriverApi3sL(this.conductor.cedula, false);
                  // this.searchConductor(cedula, true)
                } else {
                  this.setOpenTermsData(true)
                  this.loadingData.dismiss();
                  return;
                }
              })
            }
          } else if (data.access_token == 0) {

            const buttons = [
              {
                text: 'Cambiar vehículo',
                handler: () => {
                  console.log('Cambiar vehículo seleccionado');
                  this.getDriverApi3sL(this.conductor.cedula, true)
                },
              },
              {
                text: 'Iniciar sesión',
                handler: () => {
                  this.router.navigate(['/login']);
                  this.checkTercero = false;
                  this.alertTercero = true;
                },
              },
            ]

            this.loadingData.dismiss()
            this.presentAlertButtons("Alerta", "", "Conductor ya registra en el app", "Cerrar",
              buttons
            )


          }
        }
      )

    } else {
      this.loadingData.dismiss();
    }
    // console.log(this.dataTercero);

  }

  getDriverApi3sL(cedula: any, validate: boolean) {


    // this.getParentesco();
    this.formNewDriver.reset();
    this.conductor.nombres = ''
    this.conductor.apellidos = ''
    this.conductor.correo = ''
    this.conductor.celular = ''
    this.conductor.direccion = ''
    this.conductor.fechaNacimiento = ''
    this.conductor.nombreContacto = ''
    this.conductor.celularContacto = ''
    this.conductor.fechaLicencia = ''
    this.conductor.fechaSeguridad = ''
    this.conductor.parentesco = ''
    this.hubImag.cedula1 = [];
    this.hubImag.cedula2 = [];
    this.hubImag.licencia1 = [];
    this.hubImag.licencia2 = [];

    this.reg.getDataTercero(cedula).subscribe(cc => {
      // console.log('metodo Busqueda 3SL');

      // console.log(cc.data[0]);

      this.getParentesco().then(
        data => {
        }
      )

      const placa = cc.data[0].numeroPlacaxxx;

      if (placa && !validate) {

        const buttons = [
          {
            text: 'Cambiar vehículo',
            handler: () => {
              console.log('Cambiar vehículo seleccionado');
              this.processDataApi(cc)
            },
          },
          {
            text: 'Iniciar sesión',
            handler: () => {
              this.router.navigate(['/login']);
              this.checkTercero = false;
              this.alertTercero = true;
            },
          },
        ]


        this.loadingData.dismiss()
        this.presentAlertButtons("Alerta", "", "Conductor ya registra en el app", "Cerrar",
          buttons
        )

      } else {
        this.processDataApi(cc)
      }

      this.loadingData.dismiss()


    },
      err => {
        this.alertTercero = false;
        this.getDriverApi(cedula, true);
      })

  }


  async processDataApi(cc: any) {

    const loading = await this.loading.create({
      message: 'Buscado Cedula...',
    });

    loading.present()

    var validate = true;
    var validateDocs = true;
    var mensaje = '<ul>';
    var documentsFinal: any = [];


    this.newTercero = false;
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
    else { validate = false; mensaje += '<li>Fecha Nacoimiento </li>' }
    if (cc.data[0].nombreContacto) { this.conductor.nombreContacto = cc.data[0].nombreContacto }
    else { validate = false; mensaje += '<li>Nombre Contacto</li>' }
    if (cc.data[0].movilxContacto) { this.conductor.celularContacto = cc.data[0].movilxContacto }
    else { validate = false; mensaje += '<li>Celular Contacto</li>' }
    if (cc.data[0].nombreParentes) {
      this.conductor.parentesco = cc.data[0].nombreParentes
      this.formNewDriver.get('parentesco')?.setValue(cc.data[0].nombreParentes)
    }
    else { validate = false; mensaje += '<li>Parentesco</li>' }

    if (cc.data[0].fechaxLicencia) { this.conductor.fechaLicencia = cc.data[0].fechaxLicencia }

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
      this.incompletoTercero = true;
      this.checkTercero = false;
      this.presentAlert("Alerta", "Es necesario ingresar:", mensaje, "Cerrar")
      this.setOpenTer(true)
      loading.dismiss()
    } else {
      var statusDoc = true;
      interface Document {
        [key: string]: string;
      }
      var docs: any;

      var text: any = '<ul>'
      var docsFinal: any = []
      this.docsFailDriver = [];
      var docsVehiculo = false;
      var status: any = true;
      statusDoc = cc.data[0].documents.status;


      if (!cc.data[0].documents.status) {
        docs = cc.data[0].documents.documents;
        for (let a = 0; a < docs.length; a++) {
          const element = docs[a];
          const palabra = this.user.separarCamelCase(element.name);
          text += "<li>" + palabra + "</li>"
          const doc = this.user.buscarCodigoEnDocumentos(element.name);
          if (doc) {
            docsFinal.push(doc);
          } else {
            docsVehiculo = true
          }
        }
        text += '<ul>';

      }

      // console.log(this.documents_conductor);

      const tipos: any = [];

      this.documents_conductor.forEach((documento: any) => {
        documento.docs.forEach((doc: any) => {
          tipos.push(doc.codigo);
        });
      });

      const cadena = tipos.join(',');

      this.photo.getFotosTercero(this.conductor.cedula, cadena, 'conductor').toPromise().then(
        a => {
          const data = this.removeMatchingKeys(a)
          loading.dismiss()
          if (data.code == '201' || !statusDoc) {
            docsFinal = []
            for (const a in data.data) {
              const status = data.data[a];
              if (!status) {
                const doc = this.user.buscarCodigoEnDocumentos(a);
                if (doc) {
                  docsFinal.push(doc);
                }
              }
            }
            this.openDocs = true;
            this.openDocumentController(this.conductor.cedula, 'conductor', statusDoc, docsFinal);
            loading.dismiss()
          } else {
            this.incompletoTercero = false;
            this.checkTercero = true;
            this.setOpenTer(false)
            loading.dismiss()
          }
          // this.getDriverApi(cedula, false);

        }
      )

    }
  }

  getDriverApi(cedula: any, nuevo: any) {

    var validate = true;
    var mensaje = '<ul>';

    this.user.getTerceroByCedula(cedula).subscribe(data => {
      console.log('Metodo Busqueda Siat');
      if (data.code == 200 && data.rows > 0) {

        this.getParentesco().then(
          data => {
          }
        )

        //  console.log(data);
        const datos = data.data[0];
        if (datos.nombre) { this.conductor.nombres = datos.nombre; } else {
          if (!this.conductor.nombres) { validate = false; mensaje += "<li>Nombres</li>"; }
        }

        if (datos.apellido) { this.conductor.apellidos = datos.apellido; } else {
          if (!this.conductor.apellidos) { validate = false; mensaje += "<li>Apellido</li>"; }
        }

        if (datos.email) { this.conductor.correo = datos.email; } else {
          if (!this.conductor.correo) { validate = false; mensaje += "<li>Correo </li>"; }
        }

        if (datos.celular) { this.conductor.celular = datos.celular; } else {
          if (!this.conductor.celular) { validate = false; mensaje += "<li>Celular</li>"; }
        }

        if (datos.direccion) { this.conductor.direccion = datos.direccion; } else {
          if (!this.conductor.direccion) { validate = false; mensaje += "<li>Direccion</li>"; }
        }

        if (datos.fecha_nacimiento) { this.conductor.fechaNacimiento = datos.fecha_nacimiento; } else {
          if (!this.conductor.fechaNacimiento) { validate = false; mensaje += "<li>Fecha nacimiento</li>"; }
        }

        if (datos.contacto_emergencia) { this.conductor.nombreContacto = datos.contacto_emergencia; } else {
          if (!this.conductor.nombreContacto) { validate = false; mensaje += "<li>Contacto emergencia</li>"; }
        }

        if (datos.telefono_contacto) { this.conductor.celularContacto = datos.telefono_contacto; } else {
          if (!this.conductor.celularContacto) { validate = false; mensaje += "<li>Telefono contacto</li>"; }
        }

        if (datos.parentesco_contacto) { this.conductor.parentesco = datos.parentesco_contacto; } else {
          if (!this.conductor.parentesco) { validate = false; mensaje += "<li>Parentesco contacto</li>"; }
        }


        if (datos.cedula1) {
          this.hubImag.cedula1.webviewPath = datos.cedula1;
        } else {
          // mensaje += '<li>Cedula Cara Frontal</li>'
          // validate = false;
        }

        if (datos.cedula2) {
          this.hubImag.cedula2.webviewPath = datos.cedula2;
        } else {
          // mensaje += '<li>Cedula Cara Posterior</li>'
          // validate = false;
        }

        if (datos.licencia1) {
          this.hubImag.licencia1.webviewPath = datos.licencia1;
        } else {
          // mensaje += '<li>Licencia Cara Frontal</li>'
          // validate = false;
        }


        if (datos.licencia2) {
          this.hubImag.licencia2.webviewPath = datos.licencia2;
        } else {
          // mensaje += '<li>Licencia Cara Posterior</li>'
          // validate = false;
        }

        const cedula1 = this.getDocument(cedula, 'cedula1', 'conductor');

        mensaje += "</ul>"


        // console.log(this.formNewDriver.controls);


        if (!validate) {
          this.loadingData.dismiss()
          this.incompletoTercero = true;
          this.checkTercero = false;
          this.presentAlert("Alerta", "Es necesario ingresar:", mensaje, "Cerrar")
          this.setOpenTer(true)
        } else {


          const tipos: any = [];

          this.documents_conductor.forEach((documento: any) => {
            documento.docs.forEach((doc: any) => {
              tipos.push(doc.codigo);
            });
          });

          const cadena = tipos.join(',');

          this.photo.getFotosTercero(this.conductor.cedula, cadena, 'conductor').toPromise().then(
            data => {
              this.loadingData.dismiss()
              if (data.code == '201') {
                this.loadingData.dismiss()
                this.openDocs = true;
                this.openDocumentController(this.conductor.cedula, 'conductor', true, []);
              } else {
                this.loadingData.dismiss()
                this.incompletoTercero = false;
                this.checkTercero = true;
                this.setOpenTer(false)
              }
              // this.getDriverApi(cedula, false);

            }
          )
        }

        this.newTercero = false;

      } else {
        if (nuevo) {
          this.newTercero = true;
          this.incompletoTercero = false;
          this.checkTercero = false;
        } else {
          this.incompletoTercero = true;
          this.checkTercero = false;
        }
        this.loadingData.dismiss()
      }

    },
      err => {

        this.loadingData.dismiss()
        this.getParentesco().then(data => { })
        if (nuevo) {
          this.newTercero = true;
          this.incompletoTercero = false;
          this.checkTercero = false;
        } else {
          this.incompletoTercero = true;
          this.checkTercero = false;
        }
      }
    );
  }

  async getDocument(codigo: any, tipo: any, tipoRegistro: any): Promise<any> {
    const resp: any = await this.photo.getFotoTercero(codigo, tipo, tipoRegistro).toPromise()
    return resp;
  }

  async getDataFirma(doc: any, tipo: any): Promise<any> {
    const resp: any = await this.user.getFirma(doc, tipo, this.token).toPromise();
    return resp;
  }


  getDataVehculo() {
    this.dataVehiculo = {
      claseVehiculo: this.vehiculo.claseVehiculo,
      carroceria: this.vehiculo.carroceria,
      fechaSoat: this.vehiculo.fechaSoat,
      fechaTecno: this.vehiculo.fechaTecno,
      marca: this.vehiculo.marca
    }
  }


  removeMatchingKeys(json: any): any {
    console.log(json);


    const keysToCheck = [
      ['cedula1', 'cedula2'],
      ['licencia1', 'licencia2'],
      ['tarjePro1', 'tarjePro2'],
      ['fotoremol', 'tarjePror1', 'tarjePror2'],
      ['fotovehi1', 'fotovehi2', 'fotovehi3', 'fotovehi4']
    ];

    keysToCheck.forEach(keys => {
      let allFalse = true;

      // Verificar si todos los valores del grupo son false
      keys.forEach(key => {
        console.log(key);
        if (json.data[key] !== false) {
          allFalse = false;
        }
      });

      // Si todos los valores son false, eliminar todos menos uno
      if (allFalse) {

        keys.slice(1).forEach(key => {
          delete json.data[key];
        });
      }
    });

    console.log(json);
    return json;
  }

  nuevoVehiculo() {
    this.setOpenVeh(true);
  }

  nuevoTercero() {
    this.setOpenTer(true);
  }

  nuevoPropietario() {
    this.setOpenPro(true);
  }

  nuevoTenedor() {
    this.setOpenTen(true);
  }

  setOpenVeh(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  setOpenTer(isOpen: boolean) {
    this.isModalOpen2 = isOpen;
  }

  setOpenPro(isOpen: boolean) {
    this.isModalOpen3 = isOpen;
  }

  setOpenTen(isOpen: boolean) {
    this.isModalOpen4 = isOpen;
  }

  setOpenTermsData(isOpen: boolean) {
    this.isModalOpen5 = isOpen;
  }

  setOpenTerms(isOpen: boolean) {
    this.isModalOpen6 = isOpen;
  }

  setOpenCode(isOpen: boolean) {
    this.modalCodeOpen = isOpen;
  }


  checkPropietario() {

    if (!this.isPropietario) {
      this.isPropietario = true;
      this.checkPropi = true;
      if (this.isTenedor) {
        this.completeData = true;
      }
    } else {
      this.isPropietario = false;
      this.checkPropi = false;
      this.completeData = false;
    }

  }


  checkTenedor() {

    if (!this.isTenedor) {
      this.isTenedor = true;
      this.checkTened = true;
      if (this.isPropietario) {
        this.completeData = true;
      }
    } else {
      this.isTenedor = false;
      this.checkTened = false;
      this.completeData = false;
    }

  }

  async onSubmitNewProp() {

    var validate = true;
    var jsonApi: any = {};

    var text = "<ul>";

    // console.log(this.formNewProp.value);

    for (const campo in this.formNewProp.controls) {
      if (this.formNewProp.controls[campo].invalid) {
        validate = false;
        text += "<li>" + campo.charAt(0).toUpperCase() + campo.slice(1) + "</li>";
      } else {

        this.propietario[campo] = this.formNewProp.value[campo]
        jsonApi[campo] = this.formNewProp.value[campo]

      }

    }

    text += "</ul>";


    jsonApi['codigoTercerox'] = this.propietario.cedula
    jsonApi['conductor'] = false



    if (this.hubImag.cedula_pro1.length == 0) {
      this.presentAlert("Error", "", "Es necesario cargar: Foto Cedula", "Cerrar");
      validate = false;
    }

    if (!validate) {
      this.incompletoPropiet = true;
      this.newPropiet = false;
      this.checkPropi = false;

      this.presentAlert("Error", "Es necesario ingresar:", text, "Cerrar");

    } else {
      this.incompletoPropiet = false;
      this.newPropiet = false;
      this.checkPropi = true;

      const data = await this.reg.sendDataTercero(jsonApi);
      console.log(data);


      if (this.isTenedor) {
        this.completeData = true;
      }

      this.isModalOpen3 = false;
    }


  }

  async onSubmitNewTen() {

    var validate = true;
    var jsonApi: any = {};

    var text = "<ul>";

    // console.log(this.formNewTene.value);

    for (const campo in this.formNewTene.controls) {
      if (this.formNewTene.controls[campo].invalid) {
        validate = false;
        text += "<li>" + campo.charAt(0).toUpperCase() + campo.slice(1) + "</li>";
      } else {
        // if (campo == 'fechaSeguridad' || campo == 'fechaLicencia') {
        // var fecha = new Date(this.formNewTene.value[campo]);
        // this.conductor[campo] = fecha.toISOString().split('T')[0];
        // jsonApi[campo] = fecha.toISOString().split('T')[0];
        // }else{
        this.tenedor[campo] = this.formNewTene.value[campo]
        jsonApi[campo] = this.formNewTene.value[campo]
        // }
      }

    }

    text += "</ul>";


    jsonApi['codigoTercerox'] = this.tenedor.cedula
    jsonApi['conductor'] = false


    console.log(jsonApi);

    if (!validate) {
      this.incompletoTenedor = true;
      this.newTenedor = false;
      this.checkTened = false;
      this.presentAlert("Error", "Es necesario ingresar:", text, "Cerrar");
    } else {
      this.incompletoTenedor = false;
      this.newTenedor = false;
      this.checkTened = true;
      const data = await this.reg.sendDataTercero(jsonApi);
      // console.log(data);

      if (this.isPropietario) {
        this.completeData = true;
      }

      this.isModalOpen4 = false;
    }





  }


  async searchPropietario(e: any) {

    var validate = true;
    var mensaje = '<ul>';


    if (e.target.value.length > 7) {
      let cedula = e.target.value
      this.propietario.cedula = cedula

      const loading = await this.loading.create({
        message: 'Buscado Cedula...',
        duration: 1000,
      });

      if (cedula == this.conductor.cedula) {
        this.presentAlert("Alerta", "El propietario y el conductor son la misma persona", "", "Cerrar");
        this.isPropietario = true;
        this.checkPropi = true;
        this.incompletoPropiet = false;
        this.registroForm.patchValue({
          propietario: ''
        })
      } else {


        this.user.getTerceroByCedula(cedula).subscribe(data => {
          const datos = data.data[0];

          this.newPropiet = false;
          this.alertPropi = false;

          this.propietario.nombres = datos.nombre
          this.propietario.apellidos = datos.apellido
          this.propietario.correo = datos.email
          this.propietario.celular = datos.celular
          this.propietario.direccion = datos.direccion
          this.propietario.fechaNacimiento = datos.fecha_nacimiento
          this.propietario.nombreContacto = datos.contacto_emergencia
          this.propietario.celularContacto = datos.telefono_contacto
          this.propietario.parentesco = datos.parentesco_contacto


          if (datos.nombre) { this.propietario.nombres = datos.nombre; } else {
            if (!this.propietario.nombres) { validate = false; mensaje += "<li>Nombres</li>"; }
          }

          if (datos.apellido) { this.propietario.apellidos = datos.apellido; } else {
            if (!this.propietario.apellidos) { validate = false; mensaje += "<li>Apellido</li>"; }
          }

          if (datos.email) { this.propietario.correo = datos.email; } else {
            if (!this.propietario.correo) { validate = false; mensaje += "<li>Correo </li>"; }
          }

          if (datos.celular) { this.propietario.celular = datos.celular; } else {
            if (!this.propietario.celular) { validate = false; mensaje += "<li>Celular</li>"; }
          }

          if (datos.direccion) { this.propietario.direccion = datos.direccion; } else {
            if (!this.propietario.direccion) { validate = false; mensaje += "<li>Direccion</li>"; }
          }

          if (datos.fecha_nacimiento) { this.propietario.fechaNacimiento = datos.fecha_nacimiento; } else {
            if (!this.propietario.fechaNacimiento) { validate = false; mensaje += "<li>Fecha nacimiento</li>"; }
          }

          if (datos.contacto_emergencia) { this.propietario.nombreContacto = datos.contacto_emergencia; } else {
            if (!this.propietario.nombreContacto) { validate = false; mensaje += "<li>Contacto emergencia</li>"; }
          }

          if (datos.telefono_contacto) { this.propietario.celularContacto = datos.telefono_contacto; } else {
            if (!this.propietario.celularContacto) { validate = false; mensaje += "<li>Telefono contacto</li>"; }
          }

          if (datos.parentesco_contacto) { this.propietario.parentesco = datos.parentesco_contacto; } else {
            if (!this.propietario.parentesco) { validate = false; mensaje += "<li>Parentesco contacto</li>"; }
          }


          if (datos.cedula1) {
            this.hubImag.cedula_pro1.webviewPath = datos.cedula1;
          } else {
            mensaje += '<li>Cedula Cara Frontal</li>'
            validate = false;
          }

          if (datos.cedula2) {
            this.hubImag.cedula_pro2.webviewPath = datos.cedula2;
          } else {
            mensaje += '<li>Cedula Cara Posterior</li>'
            validate = false;
          }



          if (!validate) {
            this.incompletoPropiet = true;
            this.checkPropi = false;
            this.presentAlert("Alerta", "Es necesario ingresar:", mensaje, "Cerrar")
            this.setOpenPro(true)
          } else {
            this.incompletoPropiet = false;
            this.checkPropi = true;
            if (this.isTenedor == true) {
              this.checkTened = true
            }
          }


        },
          err => {
            this.newPropiet = true;
            this.checkPropi = false;
            this.incompletoPropiet = false;
          })

        loading.present()
      }

    }
  }


  async searchTenedor(e: any) {
    var validate = true;
    var mensaje = '<ul>';

    if (e.target.value.length > 7) {
      let cedula = e.target.value
      this.tenedor.cedula = cedula;
      const loading = await this.loading.create({
        message: 'Buscado Cedula...',
        duration: 1000,
      });


      if (cedula == this.conductor.cedula) {
        this.presentAlert("Alerta", "El Tenedor y el conductor son la misma persona", "", "Cerrar");
        this.isTenedor = true;
        this.incompletoTenedor = false;
        this.checkTened = true;
        this.registroForm.patchValue({
          tenedor: ''
        })
        return;
      }

      if (cedula == this.propietario.cedula) {
        this.presentAlert("Alerta", "El Tenedor y el propietario son la misma persona", "", "Cerrar");
        this.incompletoTenedor = false;
        this.checkTened = true;
        return;
      }

      this.user.getTerceroByCedula(cedula).subscribe(data => {
        const datos = data.data[0];

        this.newTenedor = false;
        this.alertTened = false;

        this.tenedor.nombres = datos.nombre
        this.tenedor.apellidos = datos.apellido
        this.tenedor.correo = datos.email
        this.tenedor.celular = datos.celular
        this.tenedor.direccion = datos.direccion
        this.tenedor.fechaNacimiento = datos.fecha_nacimiento
        this.tenedor.nombreContacto = datos.contacto_emergencia
        this.tenedor.celularContacto = datos.telefono_contacto
        this.tenedor.parentesco = datos.parentesco_contacto


        if (datos.nombre) { this.tenedor.nombres = datos.nombre; } else {
          if (!this.tenedor.nombres) { validate = false; mensaje += "<li>Nombres</li>"; }
        }

        if (datos.apellido) { this.tenedor.apellidos = datos.apellido; } else {
          if (!this.tenedor.apellidos) { validate = false; mensaje += "<li>Apellido</li>"; }
        }

        if (datos.email) { this.tenedor.correo = datos.email; } else {
          if (!this.tenedor.correo) { validate = false; mensaje += "<li>Correo </li>"; }
        }

        if (datos.celular) { this.tenedor.celular = datos.celular; } else {
          if (!this.tenedor.celular) { validate = false; mensaje += "<li>Celular</li>"; }
        }

        if (datos.direccion) { this.tenedor.direccion = datos.direccion; } else {
          if (!this.tenedor.direccion) { validate = false; mensaje += "<li>Direccion</li>"; }
        }

        if (datos.fecha_nacimiento) { this.tenedor.fechaNacimiento = datos.fecha_nacimiento; } else {
          if (!this.tenedor.fechaNacimiento) { validate = false; mensaje += "<li>Fecha nacimiento</li>"; }
        }

        if (datos.contacto_emergencia) { this.tenedor.nombreContacto = datos.contacto_emergencia; } else {
          if (!this.tenedor.nombreContacto) { validate = false; mensaje += "<li>Contacto emergencia</li>"; }
        }

        if (datos.telefono_contacto) { this.tenedor.celularContacto = datos.telefono_contacto; } else {
          if (!this.tenedor.celularContacto) { validate = false; mensaje += "<li>Telefono contacto</li>"; }
        }

        if (datos.parentesco_contacto) { this.tenedor.parentesco = datos.parentesco_contacto; } else {
          if (!this.tenedor.parentesco) { validate = false; mensaje += "<li>Parentesco contacto</li>"; }
        }

        if (datos.cedula1) {
          this.hubImag.cedula_ten1.webviewPath = datos.cedula1;
        } else {
          mensaje += '<li>Cedula Cara Frontal</li>'
          validate = false;
        }

        if (datos.cedula2) {
          this.hubImag.cedula_ten2.webviewPath = datos.cedula2;
        } else {
          mensaje += '<li>Cedula Cara Posterior</li>'
          validate = false;
        }


        if (!validate) {
          this.incompletoTenedor = true;
          this.checkTened = false;
          this.presentAlert("Alerta", "Es necesario ingresar:", mensaje, "Cerrar")
          this.setOpenTen(true)
        } else {
          this.incompletoTenedor = false;
          this.checkTened = true;
        }



      },
        err => {
          this.newTenedor = true;
          this.checkTened = false;
          this.incompletoTenedor = false;
        })

      loading.present()
    }
  }


  editPropietario() {
    this.isModalOpen3 = true

  }

  editTenedor() {
    this.isModalOpen4 = true;
  }


  async onSubmitNewVehicle() {

    var validate = true;
    var validateDocs = true;
    var jsonApi: any = {}
    jsonApi['placa'] = this.vehiculo.placa;
    // console.log(this.formNewVehicle.value);

    // if (!this.formNewVehicle.valid) {
    //   this.presentAlert("Error", "", "Todos los campos son requeridos", "Cerrar");
    // }

    var text = "<ul>";

    for (const campo in this.formNewVehicle.controls) {

      if (this.formNewVehicle.controls[campo].invalid) {
        validate = false;
        text += "<li>" + campo.charAt(0).toUpperCase() + campo.slice(1) + "</li>";
      } else {
        if ((campo == 'fechaSoat' && this.vehiculo[campo]) || (campo == 'fechaTecno' && this.vehiculo[campo])) {
          var fecha = new Date(this.formNewVehicle.value[campo]);
          this.vehiculo[campo] = fecha.toISOString().split('T')[0];
          jsonApi[campo] = fecha.toISOString().split('T')[0];
        } else {
          this.vehiculo[campo] = this.formNewVehicle.value[campo]
          jsonApi[campo] = this.formNewVehicle.value[campo]
        }
      }

    }


    if (this.vehiculo.articulado) {

      if (!this.formNewVehicle.value.remolque) {

        validate = false
        text += "Placa Remolque"

      } else {
        this.vehiculo.remolque = this.formNewVehicle.value.remolque
      }


      if (!this.hubImag.tarjePror.webviewPath) {
        validateDocs = false;
        // this.documents_vehiculo[3].status = false
      }

      if (!this.hubImag.fotoremol.webviewPath) {
        validateDocs = false;
        // this.documents_vehiculo[3].status = false
      }
    }

    text += "</ul>";
    this.dataTercero['docs'] = this.documents_vehiculo;


    if (validate) {

      const loading = await this.loading.create({
        message: 'Guardando Vehiculo...',
      });
      // loading.present();

      const loading2 = await this.loading.create({
        message: 'Validando Documentos...',
      });


      var text: string = '<ul>'
      var docsFinal: any = []
      var docsVehiculo = false;
      var status: any = true;


      if (this.docsFailVehicle.length > 0) {
        status = false;
        for (let a = 0; a < this.docsFailVehicle.length; a++) {
          const element = this.docsFailVehicle[a];
          const palabra = this.user.separarCamelCase(element.name);
          text += "<li>" + palabra + "</li>"

          const doc = this.user.buscarCodigoEnDocumentos(element.name)

          if (doc) {
            docsFinal.push(doc);
          } else {
            docsVehiculo = true
          }
        }
        text += '<ul>';

      }

      if (docsFinal.length == 0) {
        docsFinal = this.documents_vehiculo;
      }

      loading.present();


      await this.reg.sendDataVehiculo(jsonApi).then(
        data => {
          loading.dismiss();
        }
      );

      loading2.present();

      const response: any = await this.validateDocuments(this.vehiculo.placa, this.documents_vehiculo, 'vehiculo')


      if (response['status']) {
        this.setOpenVeh(false)
        this.incompletoVehiculo = false
        this.newVehicle = false
        this.checkVehicle = true;
      } else {
        this.openDocs = true;
        this.openDocumentController(this.vehiculo.placa, 'vehiculo', true, response['data']);
      }

      loading2.dismiss();

      // const tipos: any = [];

      // this.documents_vehiculo.forEach((documento: any) => {
      //   if (documento.articulado && !this.vehiculo.articulado) return;
      //   documento.docs.forEach((doc: any) => {
      //     tipos.push(doc.codigo);
      //   });
      // });

      // const cadena = tipos.join(',');

      // this.photo.getFotosTercero(this.vehiculo.placa, cadena, 'vehiculo').toPromise().then(
      //   data => {
      //     if (data.code == '201' || !status) {
      //       this.openDocs = true

      //       console.log(docsFinal);

      //       this.openDocumentController(this.vehiculo.placa, 'vehiculo', true, docsFinal);
      //     } else {

      //       this.setOpenVeh(false)
      //       this.incompletoVehiculo = false;
      //       this.checkVehicle = true;
      //       this.newVehicle = false;
      //     }
      //     loading2.dismiss();
      //   },
      //   err => {
      //     loading2.present();
      //   }
      // )





      // this.saveDocumentVehicle();
    } else {
      this.incompletoVehiculo = true;
      this.presentAlert("Error", "Es necesario ingresar:", text, "Cerrar");
    }

    // console.log(this.tarjePro);

    // this.saveDocument()

  }

  fechaInput(id: any) {

    var fecha = document.getElementById(id) as HTMLElement;
    fecha?.focus()
    // this.fechaInputNac.open();

  }


  async refreshDataDriver() {

    var validate = true;
    var jsonApi: any = {};

    const loading = await this.loading.create({
      message: 'Guradando Datos..'
    });

    loading.present();

    for (const campo in this.conductor) {
      if (this.conductor[campo]) {
        jsonApi[campo] = this.conductor[campo]
      }

    }

    jsonApi['codigoTercerox'] = this.conductor.cedula
    jsonApi['conductor'] = true

    const data = await this.reg.sendDataTercero(jsonApi).then(
      data => {

        const tipos: any = [];

        this.documents_conductor.forEach((documento: any) => {
          documento.docs.forEach((doc: any) => {
            tipos.push(doc.codigo);
          });
        });

        const cadena = tipos.join(',');

        this.photo.getFotosTercero(this.conductor.cedula, cadena, 'conductor').toPromise().then(
          b => {
            const data = this.removeMatchingKeys(b)
            loading.dismiss();
            if (data.code == '201') {
              var docsFinal = []
              for (const a in data.data) {
                const status = data.data[a];
                if (!status) {
                  const doc = this.user.buscarCodigoEnDocumentos(a);
                  if (doc) {
                    docsFinal.push(doc);
                  }
                }
              }
              this.openDocs = true
              this.openDocumentController(this.conductor.cedula, 'conductor', true, docsFinal);
            } else {
              this.incompletoTercero = false;
              this.checkTercero = true;
              this.newTercero = false;
            }
          })

      })
  }

  async refreshDataVehicule() {

    var validate = true;
    var jsonApi: any = {};

    const loading = await this.loading.create({
      message: 'Guradando Datos..'
    });

    loading.present();


    for (const campo in this.vehiculo) {
      if (this.vehiculo[campo]) {
        jsonApi[campo] = this.vehiculo[campo]

      }
    }

    jsonApi['placa'] = this.vehiculo.placa

    const data = await this.reg.sendDataVehiculo(jsonApi)


    const response: any = await this.validateDocuments(this.vehiculo.placa, this.documents_vehiculo, 'vehiculo')

    if (response['status']) {
      this.incompletoVehiculo = false;
      this.checkVehicle = true;
      this.newVehicle = false;
      this.docsFailVehicle = [];
    } else {
      this.openDocs = true;
      this.openDocumentController(this.vehiculo.placa, 'vehiculo', true, response['data']);
    }

    loading.dismiss();

  }


  async onSubmitNewDriver() {

    var validate = true;
    var validateDocs = true;
    var jsonApi: any = {};

    var text = "<ul>";
    for (const campo in this.formNewDriver.controls) {
      if (this.formNewDriver.controls[campo].invalid) {
        validate = false;
        text += "<li>" + campo.charAt(0).toUpperCase() + campo.slice(1) + "</li>";
      } else {
        if (this.formNewDriver.value[campo]) {
          this.conductor[campo] = this.formNewDriver.value[campo]
          jsonApi[campo] = this.formNewDriver.value[campo]
        } else {
          jsonApi[campo] = this.conductor[campo]
        }
      }

    }

    jsonApi['codigoTercerox'] = this.conductor.cedula
    jsonApi['conductor'] = true

    // for (const a in this.formNewDriver.controls['terms'].controls) {

    //   const element = this.formNewDriver.controls['terms'].controls[a];
    //   this.terms[element] = this.formNewDriver.controls['terms'].value[element];

    // }

    // console.log(this.conductor);


    // if (!this.conductor.fechaLicencia) {
    //   validateDocs = false;
    //   this.documents_conductor[1].status = false;
    //   console.log('ERROR => Fecha Licencia');
    // }

    text += "</ul>";

    this.dataTercero['docs'] = this.documents_conductor;

    if (!validate) {
      this.incompletoTercero = true;
      this.presentAlert("Error", "Es necesario ingresar:", text, "Cerrar");
    } else {

      const loading = await this.loading.create({
        message: 'Guardando Conductor...',
      });
      loading.present();

      this.isModalOpen2 = false;
      const data = await this.reg.sendDataTercero(jsonApi).then(
        async data => {


          const tipos: any = [];

          this.documents_conductor.forEach((documento: any) => {
            documento.docs.forEach((doc: any) => {
              tipos.push(doc.codigo);
            });
          });

          const cadena = tipos.join(',');

          await this.photo.getFotosTercero(this.conductor.cedula, cadena, 'conductor').toPromise().then(
            data => {
              if (data.code == '201') {
                this.openDocs = true
                this.openDocumentController(this.conductor.cedula, 'conductor', true, this.documents_conductor);
              } else {
                this.incompletoTercero = false;
                this.checkTercero = true;
                this.newTercero = false;
              }
            }
          )

          loading.dismiss();


        },
        err => {
          this.isModalOpen2 = true;
          this.incompletoTercero = true;
          this.checkTercero = false;
          loading.dismiss();

        }
      )

    }

  }



  saveDocumentDriver() {
    this.jsonDocs = {
      tipoRegistro: 'conductor',
      files: [],
    };
    if (this.hubImag.cedula1.base64) {
      const dataDoc = {
        codigo: this.conductor.cedula,
        tipo: 'cedula1',
        data64: this.hubImag.cedula1.base64,
      }

      this.jsonDocs.files.push(dataDoc);
    }

    if (this.hubImag.cedula2.base64) {
      const dataDoc = {
        codigo: this.conductor.cedula,
        tipo: 'cedula2',
        data64: this.hubImag.cedula2.base64,
      }

      this.jsonDocs.files.push(dataDoc);
    }

    if (this.hubImag.licencia1.base64) {
      const dataDoc = {
        codigo: this.conductor.cedula,
        tipo: 'licencia1',
        data64: this.hubImag.licencia1.base64,
      }

      this.jsonDocs.files.push(dataDoc);
    }

    if (this.hubImag.licencia2.base64) {
      const dataDoc = {
        codigo: this.conductor.cedula,
        tipo: 'licencia2',
        data64: this.hubImag.licencia2.base64,
      }

      this.jsonDocs.files.push(dataDoc);
    }


    if (this.hubImag.seguridadsocial.base64) {
      const dataDoc = {
        codigo: this.conductor.cedula,
        tipo: 'seguridadsocial',
        data64: this.hubImag.seguridadsocial.base64,
      }

      this.jsonDocs.files.push(dataDoc);
    }

    this.user.cargaDocumentos(this.jsonDocs).subscribe(
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
      },
      (err) => {
        return err;
      }
    )

  }

  saveDocumentVehicle() {
    this.jsonDocs = {
      tipoReistro: 'vehiculo',
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
        codigo: this.vehiculo.placa,
        tipo: 'soat1',
        data64: this.hubImag.soat1.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }

    if (this.hubImag.tecnomecanica.base64) {
      const dataDoc = {
        codigo: this.vehiculo.placa,
        tipo: 'tecnomecanica',
        data64: this.hubImag.tecnomecanica.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.hubImag.fotovehi1.base64) {
      const dataDoc = {
        codigo: this.vehiculo.placa,
        tipo: 'fotovehi1',
        data64: this.hubImag.fotovehi1.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.hubImag.fotovehi2.base64) {
      const dataDoc = {
        codigo: this.vehiculo.placa,
        tipo: 'fotovehi2',
        data64: this.hubImag.fotovehi2.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.hubImag.fotovehi3.base64) {
      const dataDoc = {
        codigo: this.vehiculo.placa,
        tipo: 'fotovehi3',
        data64: this.hubImag.fotovehi3.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.hubImag.fotovehi4.base64) {
      const dataDoc = {
        codigo: this.vehiculo.placa,
        tipo: 'fotovehi4',
        data64: this.hubImag.fotovehi4.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.hubImag.fotoremol.base64) {
      const dataDoc = {
        codigo: this.vehiculo.placa,
        tipo: 'fotoremol',
        data64: this.hubImag.fotoremol.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }
    if (this.hubImag.tarjePror.base64) {
      const dataDoc = {
        codigo: this.vehiculo.placa,
        tipo: 'tarjePror',
        data64: this.hubImag.tarjePror.base64
      }

      this.jsonDocs.files.push(dataDoc);

    }

    if (this.isPropietario) {

    }

    // console.log(this.jsonDocs);



    this.user.cargaDocumentos(this.jsonDocs).subscribe(
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
      }
    )

  }



  editVehiculo() {

    this.isModalOpen = true;
    // this.formNewVehicle.patchValue(this.dataVehiculo)

  }

  editTercero() {

    this.isModalOpen2 = true;

  }

  // async processFoto(da: any, name: any) {
  //   try {

  //     const desiredSizeX = 350;
  //     const desiredSizeY = 350;
  //     const processedImageDataUrl = await this.photo.processAndCropImage(da.base64, desiredSizeX, desiredSizeY, 0);

  //     const dataPhoto: Photo = {
  //       webPath: processedImageDataUrl,
  //       format: 'jpeg',
  //       saved: false
  //     };

  //     da.webviewPath = processedImageDataUrl;
  //     da.base64 = await this.photo.readAsBase64(dataPhoto)

  //     this.hubImag[name] = da;
  //     this.loadingData.dismiss();

  //   }
  //   catch (error) {

  //   }
  // }

  async addToGalery(name: any, rotate: any) {
    this.loadingData = await this.loading.create({
      message: 'Guradando Foto..'
    });

    this.photo.addNewToGallery(name).then((da) => {
      this.loadingData.present();
      this.processImage(da, name, rotate);

    });
  }

  async addToCamera(name: any, rotate: any) {
    this.loadingData = await this.loading.create({
      message: 'Guradando Foto..'
    });
    this.loadingData.present();
    this.photo.addNewToCamera(name).then((da) => {
      this.processImage(da, name, rotate);
    });
  }


  async processImage(da: any, name: any, rotate: any) {
    try {
      var rot = 0;

      if (rotate) {
        rot = 90;
      }
      const processedImagerotate: any = await this.photo.processAndRotationImage(da.base64, rot);


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

  async acept() {
    this.aceptTermData = true;
    this.setOpenTermsData(false);
    // Firma APP
    const firma = await this.user.firmaContrato(1, this.conductor.cedula, '', this.token);
    console.log(firma);
    // this.searchConductor(this.conductor.cedula, true);
    this.getDriverApi3sL(this.conductor.cedula, false);
  }

  async acept2() {

    this.aceptTerms = true;

    try {
      const data = await this.user.firmaContrato(2, this.conductor.cedula, this.vehiculo.placa, this.token);
      console.log(data);
      this.setOpenTerms(false);
      this.onSubmit();
    } catch (error) {
      console.log(error);
    }
  }

  async getFoto() {

    this.loadingData = await this.loading.create({
      message: 'Guradando Datos..'
    });

    this.photo.addNewToCameraProfile('fotoperfil').then((da) => {

      this.loadingData.present()


      this.processImage(da, 'fotoperfil', false);
      this.checkImagen = true;
      this.completeData = true;

    });
  }

  async getDataCode(cedula: any, placa: any) {
    const data = await this.reg.getDataCode(cedula, placa, this.token);
    return data;
  }


  async sendCodeValidation() {

    const loadingData = await this.loading.create({
      message: 'Generando Codigo..'
    });

    loadingData.present()

    const json = {
      cedula: this.conductor.cedula,
      placa: this.vehiculo.placa,
      telefono: this.vehiculo.celularPropietario
    }

    const data = await this.reg.sendCode(json, this.token).then(
      data => {
        if (data.status_sms == 202 || data.code == '205') {
          this.codeValidation = true;
        } else {
          this.presentAlert(
            'Novedad',
            'Error al enviar mensaje',
            data.data,
            'Reintentar'
          );
          this.codeValidation = true;
        }
        loadingData.dismiss()

      }
    ).catch(err => {
      loadingData.dismiss()
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
    })

  }

  async approveCode() {

    const loadingData = await this.loading.create({
      message: 'Verificando Codigo..'
    });

    loadingData.present();

    const json = {
      cedula: this.conductor.cedula,
      placa: this.vehiculo.placa,
      codigo: this.formSendCode.value.codigo
    }

    const data = await this.reg.validateCode(json, this.token);

    if (data.status) {
      var vehicle: any = { target: { value: this.vehiculo.placa } }
      this.codeValidation = true;
      this.searchVehicle(vehicle);
      //  jsonAprove['placa'] = this.vehiculo.placa
      //  jsonAprove['cedula'] = this.user.getCedula();
      //  await this.changeVehicleApi(jsonAprove);
      this.setOpenCode(false);
    }
    loadingData.dismiss()

  }


  async changeVehicleApi(json: any) {
    await this.reg.changeDataVehicle(json, this.token).then(
      data => {
        this.presentAlert("Vehiculo Asignado", "Por favor iniciar Sesion con el nuevo Vehiculo", "", "Cerrar");
        this.auth.logout();
      }
    )
  }

  validateBirthDate(date: any) {

    const birthdate = new Date(date.target.value)
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDifference = today.getMonth() - birthdate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }

    if (age >= 18) {
      return true;
    } else {
      this.presentAlert("Error", "", "Debe ser mayor de 18 años", "Cerrar");
      this.formNewDriver.patchValue({
        fechaNacimiento: ''
      })
      this.conductor.fechaNacimiento = ''
      return false;
    }
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

  async presentAlertButtons(title: String, subheader: String, desc: String, p0: string, buttons: { text: string; handler: () => void; }[]) {
    const alert = await this.alertController.create({
      header: '' + title,
      subHeader: '' + subheader,
      message: '' + desc,
      buttons: buttons,
    });

    await alert.present();
  }


}
