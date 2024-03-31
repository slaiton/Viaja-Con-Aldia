import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { log } from 'console';
import { UserService } from '../api/user.service';
import { PhotoService } from '../api/photo.service';

import { Router } from '@angular/router';
import { RegistroService } from '../api/registro.service';
import { Observable, forkJoin } from 'rxjs';
import { finalize, map, startWith } from 'rxjs/operators';
import { Photo } from '@capacitor/camera';









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
  @Input() dataTercero: any = [];

  @ViewChild('fechaInput') fechaInputNac: any;

  host: any = 'http://54.215.78.160';
  registroForm: any = FormGroup;
  formNewVehicle: any = FormGroup;
  formNewDriver: any = FormGroup;
  formNewProp: any = FormGroup;
  formNewTene: any = FormGroup;
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
  validateLoadDocs: any = true;
  validateSaveDocs: any = true;

  loadingData: any;

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
    tarjePror: { webviewPath: false },
    cedula_pro1: { webviewPath: false },
    cedula_pro2: { webviewPath: false },
    cedula_ten1: { webviewPath: false },
    cedula_ten2: { webviewPath: false },
    fotovehi1: { webviewPath: false },
    fotovehi2: { webviewPath: false },
    fotovehi3: { webviewPath: false },
    fotovehi4: { webviewPath: false },
    fotoperfil: { webviewPath: false },
    seguridadsocial: { webViewPath: false }
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



  // nombres:any
  // apellidos:any
  // correo:any;
  // celular:any;
  // direccion:any;
  // fechaNacimiento:any;
  // nombreContacto:any;
  // celularContacto:any;
  // parentesco:any;


  // nombresProp:any;
  // apellidosProp:any;
  // correoProp:any;
  // celularProp:any;
  // direccionProp:any;
  // fechaNacimientoProp:any;
  // nombreContactoProp:any;
  // celularContactoProp:any;
  // parentescoProp:any;



  // nombresTene:any;
  // apellidosTene:any;
  // correoTene:any;
  // celularTene:any;
  // direccionTene:any;
  // fechaNacimientoTene:any;
  // nombreContactoTene:any;
  // celularContactoTene:any;
  // parentescoTene:any;


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
    private reg: RegistroService) {
    this.registroForm = this.formBuilder.group({
      placa: ['', [Validators.required]],
      cedula: ['', [Validators.required]],
      propietario: [],
      tenedor: []
    });

    this.formNewVehicle = this.formBuilder.group({
      claseVehiculo: ['', [Validators.required]],
      carroceria: ['', [Validators.required]],
      fechaSoat: [],
      fechaTecno: [],
      marca: ['', [Validators.required]],
      linea: ['', [Validators.required]],
      color: ['', [Validators.required]],
      modelo: ['', [Validators.required]],
      remolque: ['']
    });

    this.formNewDriver = formBuilder.group({
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



  }

  ngOnInit() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.router.navigate(['/login']);
    });

    this.documents_vehiculo = this.user.documents_vehiculo
    this.documents_conductor = this.user.documents_conductor

    // Pregunta si esta seguro de salir
  }

  ngAfterViewInit() {

    console.log('OK');

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

  getClaseLinea(id: any) {
    this.dataLineas = []
    this.reg.getLineas(id, '', this.token).subscribe(
      data => {
        if (data.status) {
          const dataArray = data.data;
          for (let a = 0; a < dataArray.length; a++) {
            const element = dataArray[a];

            this.dataLineas.push({ id: element.codigoVehlinea, name: element.nombreVehlinea });
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
      message: 'Cargando Datos...',
      duration: 1000,
    });

    loading.present();

    this.formNewVehicle.patchValue({
      carroceria: ''
    });

    if (e.tipo == "ARTICULADO") {
      this.vehiculo.articulado = true;
      this.dataTercero.articulado = true;
      this.documents_vehiculo[3].hidden = false;
      this.formNewVehicle.get('remolque').setValidators(Validators.required);
    } else {
      this.vehiculo.articulado = false;
      this.vehiculo.remolque = ''
      this.dataTercero.articulado = false;
      this.formNewVehicle.patchValue({
        remolque: ''
      });
      this.documents_vehiculo[3].hidden = true;
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


  selectMarca(e: any) {
    this.formNewVehicle.patchValue({
      linea: ''
    });
    this.vehiculo.codigoMarca = e.id
    this.vehiculo.marca = e.name
    this.getClaseLinea(e.id);
  }
  onChangeMarca(e: any) {

  }
  onFocusedMarca(e: any) {

  }


  selectCarroceria(e: any) {
    this.vehiculo.codigoCarroceria = e.id;
    this.vehiculo.carroceria = e.name;
  }
  onChangeCarroceria(e: any) {

  }
  onFocusedCarroceria(e: any) {

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


  selectParente(e: any) {
    this.conductor.parentesco = e.name
    this.conductor.codigoParentesco = e.id
  }


  onChangeParente(e: any) {

  }
  onFocusedParente(e: any) {

  }



  onSubmit() {
    if (this.completeData) {
      this.saveDocument();
    }
  }

  private saveUser() {

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
        codigoTercerox: this.propietario.cedula,
        nombreTercerox: this.propietario.nombres,
        apell1Tercerox: this.propietario.apellidos,
        apell2Tercerox: '',
        codigoCiudadxx: '',
        movilxTercerox: this.propietario.celular,
        emailxTercerox: this.propietario.correo,
        AppGrerecpubTen: this.terms['gre_rec_pub_ten'],
      }
    }


    this.user.registroApiAldia(json, this.token).subscribe(
      data => {

        // console.log(data);
        this.user.getTemporalToken(this.conductor.cedula, this.vehiculo.placa).subscribe(
          data => {
            this.presentAlert("Exito", "Usuario Creado", "Inicia Sesion", "Cerrar");
            this.router.navigate(['/login']);
            this.loadingData.dismiss();
          },
          err => {
            this.loadingData.dismiss();
            this.presentAlert("Error", "Se presento un error al guardar los datos", "", "Cerrar");
          }
        )

      },
      err => {

      }
    )

  }

  async saveDocument() {
    this.jsonDocs = {
      tipoRegistro: 'conductor',
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
          return err;
        },
        () => {
          if (!this.aceptTerms) {
            this.getDataFirma(this.conductor.cedula, 2).then(data => {

              if (data.status) {
                this.aceptTerms = true;
                this.saveUser();
              } else {
                this.setOpenTerms(true)
              }

            })
          } else {
            this.saveUser();
          }
        }
      )

  }

  openDocumentController(doc: any, tipo: any) {

    if (tipo == 'cedula' && doc != '') {
      console.log(this.documents_conductor);

      this.dataTercero['cedula'] = doc
      this.dataTercero['placa'] = '';
      this.dataTercero['docs'] = this.documents_conductor

      this.setOpenTer(false)
      this.modal2.dismiss();
      this.openDocs = true;


    } else if (tipo == 'placa' && doc != '') {
      this.dataTercero['placa'] = doc
      this.dataTercero['cedula'] = ''
      this.dataTercero['docs'] = this.documents_vehiculo

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

      this.reg.getDataVehiculo(placa).subscribe(
        esl => {
          var mensaje = '<ul>';
          const datos = esl.data[0];
          const cedulaTer = datos['codigoTercerox']

          if (cedulaTer != null) {
            this.presentAlert("Alerta", "", "Vehiculo ya registra en el app", "Cerrar")
            this.checkVehicle = false;
            this.alertVehiculo = true;
            this.incompletoVehiculo = false;
            validate = false;
          } else {

            this.vehiculo.codigoMarca = datos.codigoVehmarca
            this.vehiculo.codigoLinea = datos.codigoVehlinea
            this.vehiculo.codigoClase = datos.codigoVehclase
            this.vehiculo.codigoColor = datos.codigoVehcolor
            this.vehiculo.codigoCarroceria = datos.codigoVehcarro
            this.vehiculo.marca = datos.nombreVehmarca
            this.vehiculo.carroceria = datos.nombreVehcarro
            this.vehiculo.claseVehiculo = datos.nombreSiatxxxx
            this.vehiculo.linea = datos.nombreVehlinea
            this.vehiculo.color = datos.nombreVehcolor
            this.vehiculo.remolque = datos.placaRemolque


            // datos.numeroRepotenc;
            // this.marca = datos.codigoVehmarca;
            // var resp = this.searchInfoVeh(datos.nombreClaseVeh, datos.nombreVehmarca, datos.nombreVehcarro, datos.nombreVehlinea, datos.nombreVehcolor);

            // if (!resp.code) {
            //   validate = false;
            //   mensaje += resp.data
            // }

            this.getClases().then(
              data => {
                // console.log("getClases Cargado");
                // console.log(datos);

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

              }
            )


            this.getMarcas().then(
              data => {
                // console.log("getMarcas Cargado");
                // console.log(data);

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
                  this.formNewVehicle.patchValue({
                    marca: ''
                  })
                }


              }
            )
            this.getColores().then(
              data => {

                const objeto3 = this.dataColores.find((objeto3: any) => objeto3.name === datos.nombreVehcolor);
                console.log(objeto3);


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

            if (datos.numeroModeloxx) { this.vehiculo.modelo = datos.numeroModeloxx; }
            else { validate = false; mensaje += '<li> Modelo </li>' }
            if (datos.fechaxSoatxxxx) { this.vehiculo.fechaSoat = datos.fechaxSoatxxxx; }
            if (datos.fechaxTecnimec) { this.vehiculo.fechaTecno = datos.fechaxTecnimec; }



            if (datos.tipoxxVehiculo == "ARTICULADO") {
              this.vehiculo.articulado = true
              this.dataTercero.articulado = true;

            } else {
              this.vehiculo.articulado = false;
              this.dataTercero.articulado = false;
            }



            if (!validate) {
              this.incompletoVehiculo = true;
              this.checkVehicle = false;
              this.setOpenVeh(true)
              this.presentAlert("Alerta", "Es necesario ingresar:", mensaje, "Cerrar")
            } else {

              const tipos: any = [];

              this.documents_vehiculo.forEach((documento: any) => {
                documento.docs.forEach((doc: any) => {
                  tipos.push(doc.codigo);
                });
              });

              const cadena = tipos.join(',');

              this.photo.getFotosTercero(this.vehiculo.placa, cadena, 'vehiculo').toPromise().then(
                data => {
                  this.loadingData.dismiss();
                  if (data.code == '201') {
                    this.openDocs = true
                    this.openDocumentController(this.vehiculo.placa, 'placa');
                  } else {
                    this.incompletoVehiculo = false;
                    this.checkVehicle = true;
                    this.newVehicle = false;
                  }
                }
              )

            }

          }

        },
        err => {
          // this.alertVehiculo = false;


          this.user.getVehiculoByPlaca(placa).subscribe(data => {
            if (data.code == 200 && data.rows > 0) {
              const datos = data.view.data[0];
              var mensaje = '<ul>';

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

              console.log(datos.clase_linea);


              const objeto4 = this.dataLineas.find((objeto4: any) => objeto4.name === datos.clase_linea);

              if (objeto4 == undefined) {
                validate = false;
                mensaje += '<li>Clase Linea</li>'
                this.vehiculo.linea = ''
                this.vehiculo.codigoLinea = ''
                this.formNewVehicle.patchValue({
                  linea: ''
                })
              } else {
                this.vehiculo.codigoLinea = objeto4.id;
                this.vehiculo.linea = objeto4.name
              }

              console.log(datos.carroceria);


              var carropro = datos.carroceria.toString();
              carropro = carropro.replace(/\s/g, "");
              const objeto = this.dataCarroc.find((objeto: any) => objeto.name === datos.carroceria);
              if (objeto == undefined) {
                this.vehiculo.carroceria = ''
                this.vehiculo.codigoCarroceria = ''
                this.formNewVehicle.patchValue({
                  carroceria: ''
                })

                validate = false;
                mensaje += '<li>Carroceria</li>'

              } else {
                this.vehiculo.codigoCarroceria = objeto?.id;
                this.vehiculo.carroceria = carropro;
              }

              // }

              // })


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


              // if (datos.soat1) {
              //   this.hubImag.soat1.webviewPath = datos.soat1;
              //  }else{
              //   validate = false;
              //   mensaje += '<li>Foto de SOAT necesaria </li>'
              //  }

              //  if (datos.tecno1) {
              //   this.hubImag.tecnomecanica.webviewPath = datos.tecno1;
              //  }else{
              //   validate = false;
              //   mensaje += '<li>Foto de Tecnomecanica necesaria </li>'
              //  }

              //  if (datos.tarjeta1) {
              //   this.hubImag.tarjePro.webviewPath = datos.tarjeta1;
              //  }else{
              //   validate = false;
              //   mensaje += '<li>Foto de Tarjeta de propiedad necesaria </li>'
              //  }


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
              } else {


                const tipos: any = [];

                this.documents_vehiculo.forEach((documento: any) => {
                  documento.docs.forEach((doc: any) => {
                    tipos.push(doc.codigo);
                  });
                });

                const cadena = tipos.join(',');

                this.photo.getFotosTercero(this.vehiculo.placa, cadena, 'vehiculo').toPromise().then(
                  data => {
                    this.loadingData.dismiss();
                    if (data.code == '201') {
                      this.openDocs = true
                      this.openDocumentController(this.vehiculo.placa, 'placa');
                    } else {
                      this.incompletoVehiculo = false;
                      this.checkVehicle = true;
                      this.newVehicle = false;
                    }
                  }
                )

              }

              //  this.getDataVehculo();

              this.newVehicle = false;

            } else {
              this.newVehicle = true;
              this.checkVehicle = false;
              // this.modal.present();
              // this.presentAlert("Alerta","","Vehiculo","Cerrar")
            }

          },
            err => {

              this.newVehicle = true;
              this.incompletoVehiculo = false;
              this.checkVehicle = false;

              console.log("ERROR", err);

              this.loadingData.dismiss();


              this.getClases().then(
                data => {

                }
              )

              this.getMarcas().then(
                data => { }
              )

              this.getColores().then(
                data => {

                }
              )

            })
        });


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

    if (cc.length > 7) {
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
                  this.getDriverApi3sL(this.conductor.cedula);
                  // this.searchConductor(cedula, true)
                } else {
                  this.setOpenTermsData(true)
                  this.loadingData.dismiss();
                  return;
                }
              })
            }
          } else if (data.access_token == 0) {

            this.presentAlert("Alerta", "", "Conductor ya registra en el app", "Cerrar")
            this.router.navigate(['/login']);
            this.checkTercero = false;
            this.alertTercero = true;
            this.loadingData.dismiss()

          }
        }
      )

    }else{
      this.loadingData.dismiss();
    }
    // console.log(this.dataTercero);

  }

  getDriverApi3sL(cedula: any) {

    var validate = true;
    var validateDocs = true;
    var mensaje = '<ul>';

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
      console.log('metodo Busqueda 3SL');

      console.log(cc.data[0]);

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

        }
      )


      const placa = cc.data[0].numeroPlacaxxx;



      if (placa) {

        this.presentAlert("Alerta", "", "Conductor ya registra en el app", "Cerrar")
        this.router.navigate(['/login']);
        this.checkTercero = false;
        this.alertTercero = true;

      } else {

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
        if (cc.data[0].nombreParentes) { this.conductor.parentesco = cc.data[0].nombreParentes }
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
                this.openDocs = true;
                this.openDocumentController(this.conductor.cedula, 'cedula');
              } else {
                this.incompletoTercero = false;
                this.checkTercero = true;
                this.setOpenTer(false)
              }
              // this.getDriverApi(cedula, false);

            }
          )

        }

      }

    },
      err => {
        this.alertTercero = false;
        this.getDriverApi(cedula, true);
      })


  }

  getDriverApi(cedula: any, nuevo: any) {

    var validate = true;
    var mensaje = '<ul>';

    this.user.getTerceroByCedula(cedula).subscribe(data => {
      console.log('Metodo Busqueda Siat');
      if (data.code == 200 && data.rows > 0) {

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
                this.openDocs = true;
                this.openDocumentController(this.conductor.cedula, 'cedula');
              } else {
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

  async getDocument(codigo: any, tipo: any, tipoRegistro:any): Promise<any> {
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


  checkPropietario() {
    var item = document.getElementById('propietario') as HTMLIonCardElement;

    if (!this.isPropietario) {
      item.classList.add('select-card');
      this.isPropietario = true;
      this.checkPropi = true;
      if (this.isTenedor) {
        this.completeData = true;
      }
    } else {
      item.classList.remove('select-card');
      this.isPropietario = false;
      this.checkPropi = false;
      this.completeData = false;
    }

  }


  checkTenedor() {
    var item = document.getElementById('tenedor') as HTMLIonCardElement;

    if (!this.isTenedor) {
      item.classList.add('select-card');
      this.isTenedor = true;
      this.checkTened = true;
      if (this.isPropietario) {
        this.completeData = true;
      }
    } else {
      item.classList.remove('select-card');
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


    console.log(jsonApi);





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
        this.completeData = true;
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
              this.completeData = true
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
        if (this.isPropietario) {
          this.completeData = true;
        }
        this.registroForm.patchValue({
          tenedor: ''
        })
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
    // if (!this.formNewVehicle.valid) {
    //   this.presentAlert("Error", "", "Todos los campos son requeridos", "Cerrar");
    // }
    var text = "<ul>";

    for (const campo in this.formNewVehicle.controls) {

      if (this.formNewVehicle.controls[campo].invalid) {
        validate = false;
        text += "<li>" + campo.charAt(0).toUpperCase() + campo.slice(1) + "</li>";
      } else {
        if (campo == 'fechaSoat' || campo == 'fechaTecno') {
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
      loading.present();

      this.setOpenVeh(false)
      const envio = await this.reg.sendDataVehiculo(jsonApi).then(
        data => {

          loading.dismiss();

          const tipos: any = [];

          this.documents_vehiculo.forEach((documento: any) => {
            documento.docs.forEach((doc: any) => {
              tipos.push(doc.codigo);
            });
          });

          const cadena = tipos.join(',');

          this.photo.getFotosTercero(this.vehiculo.placa, cadena, 'vehiculo').toPromise().then(
            data => {
              if (data.code == '201') {
                this.openDocs = true
                this.openDocumentController(this.vehiculo.placa, 'placa');
              } else {
                this.incompletoVehiculo = false;
                this.checkVehicle = true;
                this.newVehicle = false;
              }
            }
          )

        },
        err => {
          this.setOpenVeh(true)
          loading.dismiss();
        }
      );

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
          data => {

            loading.dismiss();
            if (data.code == '201') {
              this.openDocs = true
              this.openDocumentController(this.conductor.cedula, 'cedula');
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

    const data = await this.reg.sendDataVehiculo(jsonApi).then(
      data => {

        const tipos: any = [];

        this.documents_vehiculo.forEach((documento: any) => {
          documento.docs.forEach((doc: any) => {
            tipos.push(doc.codigo);
          });
        });

        const cadena = tipos.join(',');

        this.photo.getFotosTercero(this.vehiculo.placa, cadena, 'vehiculo').toPromise().then(
          data => {
            loading.dismiss();
            if (data.code == '201') {
              this.openDocs = true
              this.openDocumentController(this.vehiculo.placa, 'placa');
            } else {
              this.incompletoVehiculo = false;
              this.checkVehicle = true;
              this.newVehicle = false;
            }
          })
      })
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

    for (const a in this.formNewDriver.controls['terms'].controls) {

      const element = this.formNewDriver.controls['terms'].controls[a];
      this.terms[element] = this.formNewDriver.controls['terms'].value[element];

    }

    // console.log(this.conductor);


    if (!this.conductor.fechaLicencia) {
      validateDocs = false;
      this.documents_conductor[1].status = false;
      console.log('ERROR => Fecha Licencia');
    }

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
        data => {

          loading.dismiss();

          const tipos: any = [];

          this.documents_conductor.forEach((documento: any) => {
            documento.docs.forEach((doc: any) => {
              tipos.push(doc.codigo);
            });
          });

          const cadena = tipos.join(',');

          this.photo.getFotosTercero(this.conductor.cedula, cadena, 'conductor').toPromise().then(
            data => {
              if (data.code == '201') {
                this.openDocs = true
                this.openDocumentController(this.conductor.cedula, 'cedula');
              } else {
                this.incompletoTercero = false;
                this.checkTercero = true;
                this.newTercero = false;
              }
            }
          )

        },
        err => {
          this.isModalOpen2 = true;
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

  async addToGalery(name: any) {
    this.loadingData = await this.loading.create({
      message: 'Guradando Foto..'
    });

    this.photo.addNewToGallery(name).then((da) => {
      this.loadingData.present();
      this.processImage(da, name);

    });
  }

 async addToCamera(name: any) {
    this.loadingData = await this.loading.create({
      message: 'Guradando Foto..'
    });
    this.photo.addNewToCamera(name).then((da) => {
      this.loadingData.present();
      this.processImage(da, name);
    });
  }


  async processImage(da: any, name: any) {
    try {

      const processedImagerotate: any = await this.photo.processAndRotationImage(da.base64);

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

  async acept() {
    this.aceptTermData = true;
    this.setOpenTermsData(false);
    // Firma APP
    const firma = await this.user.firmaContrato(1, this.conductor.cedula, '', this.token);
    console.log(firma);
    // this.searchConductor(this.conductor.cedula, true);
    this.getDriverApi3sL(this.conductor.cedula);
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
      console.log(da);


      this.processImage(da, 'fotoperfil');
      this.checkImagen = true;
      this.completeData = true;

    });
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


}
