import { Component, ElementRef, Input, OnInit, ViewChild, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { PhotoService } from '../api/photo.service';
import { UserService } from '../api/user.service';
import { log } from 'console';
import { Photo } from '@capacitor/camera';
import { RegistroService } from '../api/registro.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-vehiculo',
  templateUrl: './vehiculo.component.html',
  styleUrls: ['./vehiculo.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class VehiculoComponent  implements OnInit {

  formVehicle: any = FormGroup;
  formProp: any = FormGroup;
  formTene: any = FormGroup;

  @ViewChild('modal') modal!: ModalController;
  @Input() public dataTercero: any;
  listEvents: Array<any> = [];
  overCanvas: any;
  documentActive:any;
  articulado:any = true;
  loadingData:any;
  token:any
  hubImag:any = []

  isTenedor:any = true;
  isPropietario:any = true;

  keyword = 'name';
  itemTemplate:any;
  notFoundTemplate:any;


  isModalOpen:any = false;
  documents:any;
  fechaL:any = [];
  dataVehiculos:any = []

  dataMarcas:any = []
  dataCarroc:any = []
  dataLineas:any = []
  dataColores:any = []
  dataClases:any = []

  conductor:any = []
  vehiculo:any = []


  constructor(
    private formBuilder: FormBuilder,
    private photo: PhotoService,
    private alertController: AlertController,
    private router: Router,
    private user: UserService,
    private loading: LoadingController,
    private reg: RegistroService )
  {
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

    this.formProp = formBuilder.group({
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


     this.formTene = formBuilder.group({
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


  }


  ngOnInit() {
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
          (data:any) => {
            if (data) {
              console.log(this.dataVehiculos);
            }else{
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

      return status;

    } catch (error) {
      return error
    }

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
    this.vehiculo.codigoClase = e.id;
    this.getCarroc(e.id);
  }
  onChangeSearch(e:any) {

  }
  onFocused(e:any) {

  }

  selectMarca(e:any) {
    this.vehiculo.codigoMarca = e.id
    this.vehiculo.marca = e.name
  }
  onChangeMarca(e:any) {

  }
  onFocusedMarca(e:any) {

  }


  selectLinea(e:any)
  {
    this.vehiculo.linea = e.name
    this.vehiculo.codigoLinea = e.id
  }
  onChangeLinea(e:any)
  {

  }
  onFocusedLinea(e:any)
  {

  }

  selectColor(e:any)
  {
    this.vehiculo.color = e.name
    this.vehiculo.codigoColor = e.id
  }

  onChangeColor(e:any)
  {

  }

  onFocusedColor(e:any)
  {

  }


  selectCarroceria (e:any) {
    this.vehiculo.codigoCarroceria = e.id;
    this.vehiculo.carroceria = e.name;

  }

  onChangeCarroceria (e:any) {

  }

  onFocusedCarroceria (e:any) {

  }

  onEditVehicle()
  {

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



 async addToGalery(name:any) {


  this.loadingData = await this.loading.create({
    message: 'Guradando Foto..'
  });


    this.photo.addNewToGallery(name).then((da) => {
      this.loadingData.present();
      this.processImage(da,name);
    });
  }

  async addToCamera(name:any){

    this.loadingData = await this.loading.create({
      message: 'Guradando Foto..'
    });

    this.photo.addNewToCamera(name).then((da) => {
      this.loadingData.present();
      this.processImage(da,name);
      // loading.dismiss()
    });

  }

  setOpenVehiculo(isOpen: boolean) {
    this.isModalOpen = isOpen;
    if (!isOpen) {
      this.modal.dismiss()
    }
  }

  async processImage(da:any, name:any){
    try {

      const processedImagerotate:any =  await this.photo.processAndRotationImage(da.base64);

      // console.log(processedImagerotate);


      const dataPhoto1: Photo = {
        webPath:processedImagerotate,
        format:'jpeg',
        saved:false
      };

      const data64 = await this.photo.readAsBase64(dataPhoto1)
      // console.log(data64);

      const desiredSizeX = 450;
      const desiredSizeY = 290;
      // const processedImageDataUrl = await this.photo.processAndCropImage(data64, desiredSizeX, desiredSizeY, 90);
      const processedImageDataUrl = await this.photo.processImage(data64);

      const dataPhoto2: Photo = {
        webPath:processedImageDataUrl,
        format:'jpeg',
        saved:false
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


  async getDocument(codigo:any, tipo:any): Promise<any>
  {
    try {
      const resp:any = await this.photo.getFotoTercero(codigo,tipo,'vehiculo').toPromise()
      return resp
    } catch (error) {
      throw error
    }
  }

  getImagen(code:any)
  {
    return this.hubImag[code].webviewPath;
  }

  async onSubmitVehicle()
  {

    var validate = true;
    var jsonApi:any = {}
    jsonApi['placa'] = this.vehiculo.placa;

  }

  newVehicle()
  {

    this.formVehicle.reset();
    this.setOpenVehiculo(true);

    this.vehiculo.codigoMarca = '';
    this.vehiculo.codigoLinea = '';
    this.vehiculo.codigoClase = '';
    this.vehiculo.codigoColor = '';
    this.vehiculo.codigoCarroceria = '';
    this.vehiculo.marca = '';
    this.vehiculo.carroceria = '';
    this.vehiculo.claseVehiculo = '';
    this.vehiculo.linea = '';
    this.vehiculo.color = '';
    this.vehiculo.modelo = '';

  }

  checkTenedor() {
    var item = document.getElementById('tenedor') as HTMLIonCardElement;

    if (!this.isTenedor) {
      item.classList.add('select-card');
      this.isTenedor = true;
      this.formTene.reset()

    }else{
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

    }else{
      item.classList.remove('select-card');
      this.isPropietario = false;
    }

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
