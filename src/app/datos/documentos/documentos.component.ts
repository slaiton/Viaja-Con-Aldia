import { Component, ElementRef, Input, OnInit, ViewChild, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonModal, LoadingController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { PhotoService } from '../../api/photo.service';
import { UserService } from '../../api/user.service';
import { log } from 'console';
import { Photo } from '@capacitor/camera';
import { DatosPage } from '../datos.page';
import { RegistroService } from 'src/app/api/registro.service';


@Component({
  selector: 'app-documentos-data',
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class Documentos2Component implements OnInit {


  // @ViewChild('videoElement{ñ') public videoElement!: ElementRef;
  // @Input() dataTercero: any;
  @Input() public dataTercero: any;
  @ViewChild(IonModal) modalType!: IonModal;
  codeImageSelect:any;
  rotateImageSelect:any;
  modalTypeInput: any = false;
  listEvents: Array<any> = [];
  overCanvas: any;
  documentActive: any;
  codeDocumentActive: any;
  articulado: any = true;
  loadingData: any;
  dataAutoComplete: any = []
  token: any;


  dataAuto: any;
  keyword = 'name';
  itemTemplate: any;
  notFoundTemplate: any;



  isModalOpen: any = false;
  documents: any;
  fechaL: any = [];


  constructor(
    private datos: DatosPage,
    private route: Router,
    private photo: PhotoService,
    private alertController: AlertController,
    private user: UserService,
    private loading: LoadingController,
    private reg: RegistroService) {
  }


  ngOnInit() {

    this.token = this.user.getToken();
    var validate = true;
    var doc = ''
    var tipoRegistro = '';
    var mensaje = '';

    console.log(this.dataTercero);


    if (this.dataTercero.docs) {
      this.documents = this.dataTercero.docs;
      console.log(this.documents);
    }

    if (!this.dataTercero.articulado) {
      this.documents = this.deleteDocumentByName(this.documents, 'Remolque')
    }

    if (this.documents) {

      for (let a = 0; a < this.documents.length; a++) {
        // const element = this.documents[a];
        for (let b = 0; b < this.documents[a].docs.length; b++) {
          // //   const element = this.documentActive.docs[b];
          const code = this.documents[a].docs[b].codigo;

          if (this.documents[a].capture == 'galery' || this.documents[a].capture == 'camera') {

            if (this.documents[a].type == 'conductor') {
              doc = this.dataTercero.cedula
            }

            if (this.documents[a].type == 'vehiculo') {
              doc = this.dataTercero.placa
            }

            tipoRegistro = this.documents[a].type

            this.getDocument(doc, code, tipoRegistro).then(
              (doc: any) => {

                if (doc['code'] !== '204' && doc['data'][code]) {
                  console.log(doc['data']);

                  this.datos.hubImag[code].webviewPath = doc['data'][code];
                  this.documents[a].docs[b].imagen = doc['data'][code];
                  this.documents[a].docs[b].status = true;
                  // this.documents[a].status = true;
                } else {
                  // this.documents[a].status = false;
                  validate = false
                  mensaje += '<li>' + this.documents[a].docs[b].nombre + '</li>'
                }
              }
            )
          } else if (this.documents[a].capture == 'data') {
            // console.log(this.datos.vehiculo);

            if (this.documents[a].type == 'vehiculo') {

              this.fechaL[this.documents[a].docs[b].codigo] = this.datos.vehiculo[this.documents[a].docs[b].codigo];

            }

          }

        }

      }


      // console.log(this.documentActive);

    }
  }

  setModalType(isOpen: any) {
    this.modalTypeInput = isOpen;
  }

  dimmissModalType(e:any)
  {
    this.modalTypeInput = false;
    console.log(e);

  }

  selectTypeDocument(code:any, rotate:any)
  {
    this.codeImageSelect = code
    this.rotateImageSelect = rotate
    this.setModalType(true)
  }

  backdata() {
    this.datos.openDocs = false;
    this.datos.ngOnInit();
  }

  setModal(isOpen: any) {
    this.isModalOpen = isOpen;
  }

  selectDocument(a: any) {
    this.isModalOpen = true;
    this.documentActive = this.documents[a];
    this.codeDocumentActive = a;
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

  async processImage(da: any, name: any, rotate:any) {
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

      this.datos.hubImag[name] = da;

      this.loadingData.dismiss();

    } catch (error) {
      console.error('Error al procesar la imagen:', error);
    }
  }

   async onFileSelected(event: any, name:any ) {
    this.loadingData = await this.loading.create({
      message: 'Guradando Foto..'
    });

    this.loadingData.present();

    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.processPdf(file,name);
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('pdfInput') as HTMLElement;
    fileInput.click();  
  }

  // Procesar y guardar PDF
  private async processPdf(file: File, name:any) {
    const da:any = {};

    console.log(name);
    
    const base64Data = await this.photo.convertFileToBase64(file);



    da.webviewPath = 'assets/icon/pdf.png';
    da.base64 = base64Data

    this.datos.hubImag[name] = da;

    this.loadingData.dismiss();

    // const savedPdfFile = {
    //   fileName: `${file.name}`,
    //   fileData: base64Data
    // };

    // this.fotos.unshift(savedPdfFile);
  }


  async checkDocument() {

    // console.log(this.fechaL);
    const loading = await this.loading.create({
      message: 'Guradando Fotos..'
    });

    loading.present();

    var validate = true;
    var mensaje = '<ul>';
    var doc = false
    var jsonApiVehiculo: any = {}
    var jsonApiConductor: any = {}

    if (this.documentActive.type == 'conductor') {
      doc = this.dataTercero.cedula
    }
    if (this.documentActive.type == 'vehiculo') {
      doc = this.dataTercero.placa
    }

    if (this.documentActive.capture == 'camera' || this.documentActive.capture == 'galery') {

      const data = this.documentActive.docs;

      for (let a = 0; a < data.length; a++) {
        const element = data[a];
        if (!this.datos.hubImag[element.codigo].webviewPath) {
          validate = false;
          mensaje += '<li>' + this.documentActive.nombre + element.nombre + '</li>'
        } else {
          element.imagen = this.datos.hubImag[element.codigo].webviewPath
        }
      }

      console.log(this.documentActive);
      if (this.documentActive.fecha) {
        const fecha = document.getElementById(this.documentActive.fechaTag) as HTMLInputElement;

        if (fecha.value) {


          if (this.documentActive.type == 'conductor') {
            this.datos.conductor[this.documentActive.fechaTag] = fecha.value;
            this.documents[this.codeDocumentActive]['value'] = fecha.value;
            jsonApiConductor['codigoTercerox'] = this.dataTercero.cedula;
            jsonApiConductor['conductor'] = true;
            jsonApiConductor[this.documentActive.fechaTag] = fecha.value;
          }

          if (this.documentActive.type == 'vehiculo') {
            this.datos.vehiculo[this.documentActive.fechaTag] = fecha.value;
            this.documents[this.codeDocumentActive]['value'] = fecha.value;
            jsonApiVehiculo['placa'] = this.dataTercero.placa;
            jsonApiVehiculo[this.documentActive.fechaTag] = fecha.value;
            // this.fechaL[this.documentActive.type][this.documentActive.fechaTag] = fecha.value
          }

        } else {

          validate = false;
          mensaje += '<li>' + this.documentActive.fechaTag + '</li>'
        }
      } else if (!this.documentActive.fecha && this.documentActive.fechaTag) {
        if (this.documentActive.type == 'conductor') {
          const fecha = new Date();
          this.documents[this.codeDocumentActive]['value'] = fecha.toISOString().slice(0, 10);
          jsonApiConductor['codigoTercerox'] = this.dataTercero.cedula
          jsonApiConductor['conductor'] = true;
          jsonApiConductor[this.documentActive.fechaTag] = fecha.toISOString().slice(0, 10);
        }
      }

      mensaje += '</ul>'

      if (validate) {

        if (this.documentActive.type == 'vehiculo' && jsonApiVehiculo.placa) {
          const envio = await this.reg.sendDataVehiculo(jsonApiVehiculo);
        }

        if (this.documentActive.type == 'conductor' && jsonApiConductor.conductor) {
          const envio = await this.reg.sendDataTercero(jsonApiConductor);
          console.log(envio);
        }

        if (doc) {

          var jsonDocs: any = {
            files: [],
          };



          if(data.length == 0)
          {
            this.isModalOpen = false;
          }



          for (let b = 0; b < data.length; b++) {
            const doctipe = data[b];

            if (this.datos.hubImag[doctipe.codigo].base64) {
              const dataDoc: any = {
                codigo: doc,
                tipo: doctipe.codigo,
                tipoRegistro: this.documentActive.type,
                data64: this.datos.hubImag[doctipe.codigo].base64,
              }

              jsonDocs.files.push(dataDoc);
            }

          }


          if(jsonDocs.files.length == 0)
            {
              this.isModalOpen = false;
              loading.dismiss();
              return;
            }

          this.user.cargaDocumentos(jsonDocs).subscribe(
            (data) => {
              const files = data.data;

              for (let a = 0; a < jsonDocs.length; a++) {
                const element = jsonDocs[a];
                if (files[element.tipo]) {
                  this.datos.hubImag[element.tipo].webviewPath = files[element.tipo];
                }
              }

              this.isModalOpen = false;
              this.documentActive.status = true


            },
            (err) => {
              this.presentAlert("Error", "Se presento una novedad en los datos", "Volver a intentar", "Cerrar")
              loading.dismiss();
            },
            () => {
              loading.dismiss();
            }
          )

        }


      } else {
        this.presentAlert('Error', 'En necesario cargar', mensaje, 'Cerrar')
        loading.dismiss();
      }

    }

  }

  async documentValidate() {
    // const data = this.documents
      this.datos.openDocs = false;
      this.datos.ngOnInit();
  }


  async getFechas() {
    const data = await this.user.getFechas(this.token);
    return data;
  }

  resetFotos() {
    const data = this.documentActive.docs;
    for (let a = 0; a < data.length; a++) {
      const element = data[a];
      this.datos.hubImag[element.codigo].webviewPath = '';
    }

  }

  select(e: any) {

  }

  onChange(e: any) {

  }

  onFocused(e: any) {

  }

  async getDocument(codigo: any, tipo: any, tipoRegistro: any): Promise<any> {
    try {
      const resp: any = await this.photo.getFotoTercero(codigo, tipo, tipoRegistro).toPromise()
      return resp
    } catch (error) {
      throw error
    }
  }

  getImagen(code: any) {
    const imageData = this.datos.hubImag[code];
    if (imageData && imageData.webviewPath) {
      return imageData.webviewPath;
    } else {
      console.error(`No se encontró la imagen para el código: ${code}`);
      return '';
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

  deleteDocumentByName(arr: any, name: any) {
    return arr.filter((doc: any) => doc.nombre !== name);
  }

}
