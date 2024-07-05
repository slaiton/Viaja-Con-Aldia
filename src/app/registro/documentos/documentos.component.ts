import { Component, ElementRef, Input, OnInit, ViewChild, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { RegistroPage } from '../../registro/registro.page';
import { PhotoService } from '../../api/photo.service';
import { UserService } from '../../api/user.service';
import { log } from 'console';
import { Photo } from '@capacitor/camera';


@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class DocumentosComponent implements OnInit {


  // @ViewChild('videoElement{ñ') public videoElement!: ElementRef;
  // @Input() dataTercero: any;
  @Input() public dataTercero: any;
  listEvents: Array<any> = [];
  overCanvas: any;
  documentActive: any;
  codeDocumentActive: any;
  articulado: any = true;
  loadingData: any;
  cambiosDocs: any;



  isModalOpen: any = false;
  documents: any = [];
  fechaL: any = [];


  constructor(
    private reg: RegistroPage,
    private photo: PhotoService,
    private alertController: AlertController,
    private user: UserService,
    private loading: LoadingController,
    private platform: Platform,
    private router: Router) {
  }


  ngOnInit() {

    this.platform.backButton.subscribeWithPriority(10, () => {
      this.reg.openDocs = false;
    });

    console.log(this.dataTercero);
    // console.log(this.active);
    // this.active = false;
    var validate = true;
    var doc = ''
    var mensaje = '';
    var tipoRegistro = ''

    if (this.dataTercero.docs) {
      this.documents = this.dataTercero.docs;
    }

    if (this.dataTercero.placa) {
      if (!this.dataTercero.articulado) {
        this.documents = this.deleteDocumentByName(this.documents, 'Remolque')
      }
    }


    if (this.documents) {
      for (let a = 0; a < this.documents.length; a++) {

        for (let b = 0; b < this.documents[a].docs.length; b++) {
          const code = this.documents[a].docs[b].codigo;


          if (this.documents[a].capture == 'galery' || this.documents[a].capture == 'camera') {

            if (this.documents[a].type == 'conductor') {
              doc = this.dataTercero.cedula
            }

            if (this.documents[a].type == 'vehiculo') {
              doc = this.dataTercero.placa
              if (this.dataTercero.articulado) {
                this.documents = this.deleteDocumentByName(this.documents, 'Remolque')
              }
            }

            tipoRegistro = this.documents[a].type


            this.getDocument(doc, code, tipoRegistro).then(
              (doc: any) => {
                if (doc['code'] !== '204') {
                  console.log(code);
                  this.reg.hubImag[code].webviewPath = doc['data'][code];
                  this.documents[a].docs[b].imagen = doc['data'][code];
                  // this.documents[a].status = true;
                } else {
                  // this.documents[a].status = false;
                  validate = false;
                  mensaje += '<li>' + this.documents[a].docs[b].nombre + '</li>'
                }
              }
            )

          }

        }
      }
      // console.log(this.reg.hubImag);
    }

  }

  backdata() {
    this.reg.openDocs = false;
  }

  setModal(isOpen: any) {
    this.isModalOpen = isOpen;
  }

  selectDocument(a: any) {
    this.isModalOpen = true;
    this.documentActive = this.documents[a];
    this.cambiosDocs = false;
    this.codeDocumentActive = a;

    if (this.documentActive.fail) {
      this.cambiosDocs = true;
    }

    const tag = this.documents[a].fechaTag
  }

  async addToGalery(name: any, rotate: any) {

    this.loadingData = await this.loading.create({
      message: 'Guradando Foto..'
    });


    this.photo.addNewToGallery(name).then((da) => {
      this.loadingData.present();
      this.processImage(da, name, rotate);
      this.cambiosDocs = true;
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
      this.cambiosDocs = true;
    });

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

      this.reg.hubImag[name] = da;

      this.loadingData.dismiss();

    } catch (error) {
      console.error('Error al procesar la imagen:', error);
    }
  }

  async documentValidate() {
    this.reg.openDocs = false;
    const data = this.documents
    var doc = ''
    var tipo = ''

    this.loadingData = await this.loading.create({
      message: 'Revisando Fotos..'
    });

    this.loadingData.present();


    if (this.dataTercero.cedula) {
      doc = this.dataTercero.cedula
      tipo = 'conductor'
    }

    if (this.dataTercero.placa) {
      doc = this.dataTercero.placa
      tipo = 'vehiculo'
    }

    const tipos: any = [];

    data.forEach((documento: any) => {
      documento.docs.forEach((doc: any) => {
        tipos.push(doc.codigo);
      });
    });

    const cadena = tipos.join(',');


    this.photo.getFotosTercero(doc, cadena, tipo).toPromise().then(
      data => {
        this.loadingData.dismiss()
        if (data.code == '201') {

          this.presentAlert("Error", "Documentos pendientes por cargar", "", "Cerrar")

        } else {

          if (this.dataTercero.cedula) {
            this.reg.refreshDataDriver();
          }

          if (this.dataTercero.placa) {
            this.reg.refreshDataVehicule();
          }

        }
        // this.getDriverApi(cedula, false);

      }
    )
  }

  async checkDocument() {

    const loading = await this.loading.create({
      message: 'Guradando Fotos..'
    });


    // if (!this.cambiosDocs) {
    //   this.isModalOpen = false;
    //   this.documentActive.status = true;
    //   return;
    // }

    loading.present();

    var validate = true;
    var mensaje = '<ul>';
    var doc = false
    var jsonApiVehiculo: any = {}
    var jsonApiConductor: any = {}

    var tipoRegistro = this.documentActive.type

    if (this.documentActive.type == 'conductor') {
      doc = this.dataTercero.cedula

    }
    if (this.documentActive.type == 'vehiculo') {
      doc = this.dataTercero.placa

    }

    const data = this.documentActive.docs;

    for (let a = 0; a < data.length; a++) {
      const element = data[a];
      if (!this.reg.hubImag[element.codigo].webviewPath) {
        validate = false;
        mensaje += '<li>' + this.documentActive.nombre + element.nombre + '</li>'
      } else {
        element.imagen = this.reg.hubImag[element.codigo].webviewPath
      }
    }



    if (this.documentActive.fecha) {
      const fecha = document.getElementById(this.documentActive.fechaTag) as HTMLInputElement;

      if (fecha.value) {
        console.log(this.documents);

        if (this.documentActive.type == 'conductor') {
          this.reg.conductor[this.documentActive.fechaTag] = fecha.value;
          this.reg.formNewDriver.get(this.documentActive.fechaTag).setValue(fecha.value)
          this.documents[this.codeDocumentActive]['value'] = fecha.value;
          jsonApiConductor['codigoTercerox'] = this.dataTercero.cedula;
          jsonApiConductor[this.documentActive.fechaTag] = fecha.value;
        }

        if (this.documentActive.type == 'vehiculo') {
          this.reg.vehiculo[this.documentActive.fechaTag] = fecha.value;
          this.reg.formNewVehicle.get(this.documentActive.fechaTag).setValue(fecha.value)
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
        fecha.setMonth(fecha.getMonth() + 1); // Agregar un mes
        this.documents[this.codeDocumentActive]['value'] = fecha.toISOString().slice(0, 10);
        this.reg.conductor[this.documentActive.fechaTag] = fecha.toISOString().slice(0, 10);
        jsonApiConductor['codigoTercerox'] = this.dataTercero.cedula
        jsonApiConductor['conductor'] = true;
        jsonApiConductor[this.documentActive.fechaTag] = fecha.toISOString().slice(0, 10);
      }
    }

    mensaje += '</ul>'

    if (validate) {
      // console.log(doc);

      if (doc) {
        var jsonDocs: any = {
          files: [],
        };

        for (let b = 0; b < data.length; b++) {
          const doctipe = data[b];

          if (this.reg.hubImag[doctipe.codigo].base64) {
            const dataDoc: any = {
              codigo: doc,
              tipo: doctipe.codigo,
              tipoRegistro: tipoRegistro,
              data64: this.reg.hubImag[doctipe.codigo].base64,
            }

            jsonDocs.files.push(dataDoc);
          }
        }

        this.user.cargaDocumentos(jsonDocs).subscribe(
          (data) => {
            const files = data.data;
            console.log(files);
            console.log(jsonDocs);


            for (const a in jsonDocs.files) {
              const element = jsonDocs.files[a];
              console.log(element);
              if (files[element.tipo]) {

                this.reg.hubImag[element.tipo].webviewPath = files[element.tipo];
              }
            }

            this.isModalOpen = false;
            this.documentActive.status = true


          },
          (err) => {
            loading.dismiss();
            this.presentAlert("Error", "Se presento una novedad en los datos", "Volver a intentar", "Cerrar")
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

  resetFotos() {
    const data = this.documentActive.docs;
    for (let a = 0; a < data.length; a++) {
      const element = data[a];
      this.reg.hubImag[element.codigo].webviewPath = '';
    }

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
    return this.reg.hubImag[code].webviewPath;
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
