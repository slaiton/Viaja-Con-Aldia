import { Component, ElementRef, Input, OnInit, ViewChild, Renderer2, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { PhotoService } from '../api/photo.service';
import { UserService } from '../api/user.service';
import { log } from 'console';
import { Photo } from '@capacitor/camera';
import { RegistroService } from '../api/registro.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../api/auth.service';


@Component({
  selector: 'app-vehiculo',
  templateUrl: './vehiculo.component.html',
  styleUrls: ['./vehiculo.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class VehiculoComponent implements OnInit {

  formVehicle: any = FormGroup;
  formProp: any = FormGroup;
  formTene: any = FormGroup;
  formPlaca: any = FormGroup;
  formSendCode: any = FormGroup;

  @ViewChild('modal') modal!: ModalController;
  @ViewChild('modalcode') modalcode!: ModalController;
  @Input() public dataTercero: any;

  @Output() dismissChange = new EventEmitter<boolean>();


  private canDismissOverride = false;

  listEvents: Array<any> = [];
  overCanvas: any;
  documentActive: any;
  articulado: any = true;
  loadingData: any;
  token: any
  searchTerm: any;
  nuevoVehiculo: any = false;

  isTenedor: any = true;
  isPropietario: any = true;

  keyword = 'name';
  itemTemplate: any;
  notFoundTemplate: any;
  placaChange: any;
  imgxVehiculo: any = []

  isModalOpen: any = false;
  modalCodeOpen: any = false;

  documents: any;
  fechaL: any = [];
  dataVehiculos: any = []
  documents_vehiculo: any;
  documents_conductor: any;

  dataMarcas: any = []
  dataCarroc: any = []
  dataLineas: any = []
  dataColores: any = []
  dataClases: any = []
  dataSatelital: any = []
  presentingElement: any = undefined

  codeValidation:any = false;

  conductor: any = {
    cedula: ''
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
    empresaSatelital: '',
    codigoSatelital: '',
    usuarioSatelital: '',
    claveSatelital: '',
    cuentaSatelital: '',
    codigoTerce: '',
    celularConductor: '',
    celularPropietario: '',
    celularPropietariox3: '',
    celularPropietarioLast: ''
  }

  hubImag: any = {
    licencia1: { webviewPath: false },
    licencia2: { webviewPath: false },
    cedula1: { webviewPath: false },
    cedula2: { webviewPath: false },
    tarjePro: { webviewPath: false },
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
    seguridadsocial: { webviewPath: false }
  };


  constructor(
    private formBuilder: FormBuilder,
    private photo: PhotoService,
    private alertController: AlertController,
    private router: Router,
    private user: UserService,
    private loading: LoadingController,
    private reg: RegistroService,
    private actionSheetCtrl: ActionSheetController,
    private auth: AuthService
  ) {

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
      cuentaSatelital: ['']
    });

    this.formProp = formBuilder.group({
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


    this.formTene = formBuilder.group({
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

    this.formPlaca = formBuilder.group({
      placa: ['', [Validators.required]]
    });

    this.formSendCode = formBuilder.group({
      codigo: ['', [Validators.required]]
    });

    this.documents_vehiculo = this.user.documents_vehiculo
    this.documents_conductor = this.user.documents_conductor


  }


  async ngOnInit() {

    const loadingData = await this.loading.create({
      message: 'Generando datos...',
    });

    loadingData.present();

    this.dataVehiculos = []
    this.presentingElement = document.querySelector('.ion-vehicle');

    this.token = this.user.getToken();
    if (this.user.getToken() == null) {
      this.router.navigate(['/login']);
    }

    this.conductor.cedula = this.user.getCedula()
    // console.log(this.active);
    // this.active = false;
    var validate = true;
    var doc = ''
    var mensaje = '';


    this.getVehiculos(this.conductor.cedula).then(
      (data: any) => {
        if (data) {
          loadingData.dismiss();
        } else {
          this.presentAlert("Error", "al cargar datos", "", "Cerrar")
        }
      }
    )

  }

  async getVehiculos(cedula: any) {
    try {
      var status = true;
      const data = await this.reg.getVehiculos('', cedula, this.token).toPromise();
      if (data.status) {
        console.log(data);

        const dataArray = data.data;
        for (let a = 0; a < dataArray.length; a++) {
          const element = dataArray[a];

          if (dataArray[a].numeroPlacaxxx == this.vehiculo.placa) { dataArray[a].status = true } else { dataArray[a].status = false }

          if (dataArray[a].hojaVidaApp) { dataArray[a].estado = 'En Uso'; dataArray[a].color = 'danger'; }
          else { dataArray[a].estado = 'Disponible'; dataArray[a].color = 'success'; }

          this.getDocument(dataArray[a].numeroPlacaxxx, 'fotovehi1').then(
            (data: any) => {


              if (data.data) {
                dataArray[a].foto = data.data['fotovehi1'];
                this.imgxVehiculo[dataArray[a].numeroPlacaxxx] = data.data['fotovehi1'];

              } else {
                dataArray[a].foto = false;
              }

            }
          )
          this.dataVehiculos.push(dataArray[a]);
        }

      } else {
        status = false;
      }



      return status;

    } catch (error) {
      return error
    }

  }

  async editVehicule(placa: any): Promise<void> {

    var validate = true;
    this.nuevoVehiculo = false;
    const loadingData = await this.loading.create({
      message: 'Generando datos...',
    });

    this.vehiculo.placa = placa;
    this.formVehicle.patchValue({
      placa: placa
    })

    loadingData.present();

    this.reg.getDataVehiculo(placa).subscribe(
      esl => {
        var mensaje = '<ul>';
        const datos = esl.data[0];
        // const cedulaTer = datos['codigoTercerox']


        this.vehiculo.codigoTerce = datos.codigoTercerox
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
        this.vehiculo.empresaSatelital = datos.nombreVehgpsxx
        this.vehiculo.cuentaSatelital = datos.satelCuentaxx
        this.vehiculo.celularPropietario = datos.celularPropietario

        if (datos.celularPropietario) {
          this.vehiculo.celularPropietariox3 = datos.celularPropietario.slice(0,3)
          this.vehiculo.celularPropietarioLast = datos.celularPropietario.charAt(datos.celularPropietario.length - 1)
        }



        if (datos.numeroModeloxx) { this.vehiculo.modelo = datos.numeroModeloxx; }
        else { validate = false; mensaje += '<li> Modelo </li>' }
        if (datos.fechaxSoatxxxx) { this.vehiculo.fechaSoat = datos.fechaxSoatxxxx; }
        if (datos.fechaxTecnimec) { this.vehiculo.fechaTecno = datos.fechaxTecnimec; }




        if (datos.tipoxxVehiculo == "ARTICULADO") {
          this.vehiculo.articulado = true
          // this.dataTercero.articulado = true;

        } else {
          this.vehiculo.articulado = false;
          // this.dataTercero.articulado = false;
        }

        if (this.imgxVehiculo[placa]) {
          console.log(this.imgxVehiculo[placa]);

          this.hubImag['fotovehi1'].webviewPath = this.imgxVehiculo[placa]
        }


        const dataClases = this.getClases();
        const dataMarcas = this.getMarcas();
        const dataColores = this.getColores();
        const dataSatelitalpo = this.getSatelital();




        Promise.all([dataClases, dataMarcas, dataColores]).then(
          ([doc1, doc2, doc3]) => {

            loadingData.dismiss();


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

        this.setOpenVehiculo(true);
        loadingData.dismiss();
      },
      () => {

      }
    )

  }


  async getDataCode(cedula:any, placa:any)
  {
    const data = await this.reg.getDataCode(cedula, placa, this.token);
    return data;
  }


  async sendCodeValidation() {
    const json = {
      cedula: this.user.getCedula(),
      placa: this.vehiculo.placa,
      telefono: this.vehiculo.celularPropietario
    }

    const data = await this.reg.sendCode(json, this.token).then(
      data => {
        if (data.status_sms == 202 || data.code) {
          this.codeValidation = true;
        }
      }
    )

  }

  async approveCode()
  {
    const json = {
      cedula: this.user.getCedula(),
      placa: this.vehiculo.placa,
      codigo: this.formSendCode.value.codigo
    }

       const data = await this.reg.validateCode(json, this.token);

       if (data.status) {
         var jsonAprove: any = {}
         jsonAprove['placa'] = this.vehiculo.placa
         jsonAprove['cedula'] = this.user.getCedula();
         await this.changeVehicleApi(jsonAprove);
         this.setOpenCode(false);
        }
  }

  onWillPresent() {
    this.canDismissOverride = false;
  }

  async selectEvent(e: any) {

    const loading = await this.loading.create({
      message: 'Cargando Datos...'
    });

    loading.present();

    this.formVehicle.patchValue({
      carroceria: ''
    });

    // console.log(e);

    if (e.tipo == "ARTICULADO") {
      this.vehiculo.articulado = true;
      // this.dataTercero.articulado = true;
      this.documents_vehiculo[3].hidden = false;
      this.formVehicle.get('remolque').setValidators(Validators.required);
    } else {
      this.vehiculo.articulado = false;
      this.vehiculo.remolque = ''
      // this.dataTercero['articulado'] = false;
      this.formVehicle.patchValue({
        remolque: ''
      });
    }

    this.vehiculo.claseVehiculo = e.name;
    this.vehiculo.codigoClase = e.id;
    this.getCarroc(e.id).then(
      data => {
        console.log(data);

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

  selectSatelital(e: any) {
    this.vehiculo.empresaSatelital = e.name
    this.vehiculo.codigoSatelital = e.id
  }

  onChangeSatelital(e: any) {

  }

  onFocusedSatelital(e: any) {

  }

  onEditVehicle() {

  }

  async changeVehicleDriver(placa:any)
  {

    const loading = await this.loading.create({
      message: 'Validando Datos...'
    });

    loading.present();

    var json: any = {}

    json['placa'] = placa
    json['cedula'] = this.user.getCedula();
    const cedula = this.vehiculo.codigoTerce

    const getCode = await this.getDataCode(this.user.getCedula(), placa);

    if(getCode.status)
      {
        this.codeValidation = true;
        this.presentAlert("Alerta", "Proceso pendiente", "Ingrese el codigo recibido", "Cerrar");
        this.setOpenCode(true);
        loading.dismiss();
        return;
      }


    if ( cedula && (cedula != json['cedula'])) {
      this.presentAlert("Alerta", "", "La placa que intenta registrar esta asociada a otro conductor.", "Cerrar");
      this.setOpenCode(true);
      loading.dismiss();
      return;
    }

    await this.changeVehicleApi(json);
    loading.dismiss();

  }

 async changeVehicleApi(json:any)
  {
    await this.reg.changeDataVehicle(json, this.token).then(
      data => {
        this.presentAlert("Vehiculo Asignado", "Por favor iniciar Sesion con el nuevo Vehiculo", "", "Cerrar");
        this.onDismissChange(true);
        this.setOpenVehiculo(false)
        this.auth.logout();
      }
    )
  }

  async changeVehicle() {

    const loading = await this.loading.create({
      message: 'Validando Datos...'
    });

    loading.present();

    this.formVehicle.patchValue({
      claseVehiculo: '',
      carroceria: '',
      linea: '',
      color: '',
      fechaSoat: '',
      fechaTecno: '',
      marca: '',
      modelo: '',
      remolque: '',
    });

    var cedulaConductor = this.user.getCedula();
    const placa = document.getElementById("placa") as HTMLInputElement | null;
    const placaText: any = placa?.value

    if (placaText?.length && placaText?.length > 5) {

      this.vehiculo.placa = placaText;
      this.placaChange = placaText;
      this.reg.getDataVehiculo(placaText).subscribe(
      async data => {
          // console.log(data);
          var status = data.status;
          if (status) {
            var cedula = data.data[0].codigoTercerox;
            if (cedula && cedula != cedulaConductor) {
              this.presentAlert("Alerta", "", "La placa que intenta registrar esta asociada a otro conductor.", "Cerrar");
              this.setOpenCode(true);
            }

           await this.editVehicule(placaText);
          //  this.changeVehicleDriver(placaText);
            loading.dismiss();
          }
        },
        err => {
          loading.dismiss();
          if (err.status == 401) {
            this.user.logout();
          }
        }
      )
    }
  }

  async deleteVehicle(placa: any) {

    const loading = await this.loading.create({
      message: 'Cargando Datos...'
    });

    loading.present();

    var json: any = {}

    json['numeroPlacaxxx'] = placa
    json['codigoTercerox'] = this.user.getCedula();

    this.reg.deleteVehicle(json, this.token).subscribe(
      data => {
        loading.dismiss();
        this.ngOnInit()
        this.onDismissChange(true);
        this.setOpenVehiculo(false)
      }
    )

  }

  resetVehicle() {
    this.formVehicle.reset();


    this.vehiculo.placa = '';
    this.vehiculo.carroceria = '';
    this.vehiculo.linea = '';
    this.vehiculo.color = '';
    this.vehiculo.fechaSoat = '';
    this.vehiculo.fechaTecno = '';
    this.vehiculo.marca = '';
    this.vehiculo.modelo = '';
    this.vehiculo.remolque = '';
    this.hubImag['fotovehi1'].webviewPath = ''

    // this.setOpenVehiculo(false);

  }


  cancelNewVehicle = async () => {

    if (this.canDismissOverride) {
      return true;
    }


    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Seguro desea Salir?',
      buttons: [
        {
          text: 'Si',
          role: 'confirm',
          handler: () => {
            this.resetVehicle();
          }
        },
        {
          text: 'No',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();

    return role === 'confirm';
  }


  upperPlaca(e: any) {
    // console.log(e.detail.value.toUpperCase());
    this.searchTerm = e.detail.value.toUpperCase();
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

    this.photo.addNewToCamera(name).then((da) => {
      this.loadingData.present();
      this.processImage(da, name, rotate);
      // loading.dismiss()
    });

  }

  setOpenVehiculo(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  setOpenCode(isOpen: boolean) {
    this.modalCodeOpen = isOpen;
  }

  async processImage(da: any, name: any, rotate: any) {
    try {
      var rot = 0;

      if (rotate) {
        rot = 90;
      }

      console.log(rot);

      const processedImagerotate: any = await this.photo.processAndRotationImage(da.base64, rot);

      console.log(processedImagerotate);

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


  async getDocument(codigo: any, tipo: any): Promise<any> {
    try {
      const resp: any = await this.photo.getFotoTercero(codigo, tipo, 'vehiculo').toPromise()
      return resp
    } catch (error) {
      throw error
    }
  }

  getImagen(code: any) {
    return this.hubImag[code].webviewPath;
  }

  async onSubmitVehicle() {

    var validate = true;
    var jsonApi: any = {}
    var jsonApi1: any = {}
    const cedula = this.user.getCedula();
    jsonApi['placa'] = this.vehiculo.placa;
    jsonApi1['numeroPlacaxxx'] = this.vehiculo.placa;
    jsonApi1['codigoTercerox'] = cedula

    const loadingData = await this.loading.create({
      message: 'Guardando Datos...',
    });

    loadingData.present();

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

    }

    text += "</ul>";

    var jsonDocs: any = {
      files: [],
    };
    if (this.hubImag['fotovehi1'].base64) {

      const dataDoc: any = {
        codigo: this.vehiculo.placa,
        tipo: 'fotovehi1',
        tipoRegistro: 'vehiculo',
        data64: this.hubImag['fotovehi1'].base64,
      }

      jsonDocs.files.push(dataDoc)
    }

    if (validate) {
      const envio = await this.reg.sendDataVehiculo(jsonApi);
      this.reg.addVehiclexDriver(this.token, jsonApi1);

      if (jsonDocs.files.length > 0) {
        this.user.cargaDocumentos(jsonDocs).subscribe(
          data => {
            this.onDismissChange(true);
            this.setOpenVehiculo(false)
            this.ngOnInit()
            loadingData.dismiss();
          },
          err => {
            this.presentAlert('Error', 'Se ha presentado un error cargadndo la foto', '', 'Cerrar')
            loadingData.dismiss();
          }
        )
      }

      // this.router.navigateByUrl('/vehiculos')
    } else {
      this.presentAlert("Error", "Es necesario ingresar:", text, "Cerrar");
      loadingData.dismiss();
    }

  }



  onDismissChange(change: any) {
    this.dismissChange.emit(change);
    this.canDismissOverride = change;
  }

  newVehicle() {
    this.nuevoVehiculo = true;
    this.formVehicle.reset();
    this.resetVehicle();
    this.setOpenVehiculo(true);

    const dataSatelitalpo = this.getSatelital();
    const dataClases = this.getClases();
    const dataMarcas = this.getMarcas();
    const dataColores = this.getColores();


  }

  checkTenedor() {
    var item = document.getElementById('tenedor') as HTMLIonCardElement;

    if (!this.isTenedor) {
      item.classList.add('select-card');
      this.isTenedor = true;
      this.formTene.reset()

    } else {
      item.classList.remove('select-card');
      this.isTenedor = false;
    }

  }

  checkPropietario() {
    var item = document.getElementById('propietario') as HTMLIonCardElement;


    if (!this.isPropietario) {
      item.classList.add('select-card');
      this.isPropietario = true;
      this.formProp.reset()

    } else {
      item.classList.remove('select-card');
      this.isPropietario = false;
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

}
