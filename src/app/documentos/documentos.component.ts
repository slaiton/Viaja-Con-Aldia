import { Component, ElementRef, Input, OnInit, ViewChild, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { RegistroPage } from '../registro/registro.page';
import { PhotoService } from '../api/photo.service';
import { UserService } from '../api/user.service';
import { log } from 'console';
import { Photo } from '@capacitor/camera';
import { RegistroService } from '../api/registro.service';


@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class DocumentosComponent  implements OnInit {


  // @ViewChild('videoElement{ñ') public videoElement!: ElementRef;
  @Input() dataTercero: any;
  @Input() public active: boolean = false;
  listEvents: Array<any> = [];
  overCanvas: any;
  documentActive:any;
  articulado:any = true;
  loadingData:any;



  isModalOpen:any = false;
  documents:any;
  fechaL:any = [];
  

  constructor(
    private reg: RegistroPage,
    private photo: PhotoService,
    private alertController: AlertController,
    private user: UserService,
    private regi: RegistroService,
    private loading: LoadingController  ) 
  {    
  }


  ngOnInit() {

    // console.log(this.dataTercero);
    this.active = false;
    var validate = true;
    var doc = ''
    var mensaje = '';

    if (this.dataTercero.docs) {
      this.documents = this.dataTercero.docs;
      
      if (this.dataTercero.cedula) {
        doc = this.dataTercero.cedula
      //   this.jsonDriverApi['codigoTercerox'] = this.dataTercero.cedula;
      }
      
      if (this.dataTercero.placa) {
        doc = this.dataTercero.placa
      //   this.jsonDriverApi['placa'] = this.dataTercero.placa;
        
      }

      if (this.dataTercero.articulado) {
        this.documents.pop()
      }
    
    }
     
    if (this.documents) {
      for (let a = 0; a < this.documents.length; a++) {
        // const element = this.documents[a];
        for (let b = 0; b < this.documents[a].docs.length; b++) {
          // //   const element = this.documentActive.docs[b];
          const code = this.documents[a].docs[b].codigo;
          
          this.getDocument(doc, code).then(
                (doc:any) => {
                     if (doc['code'] !== '204') {
                       this.reg.hubImag[code].webviewPath = doc['data'];
                       this.documents[a].docs[b].imagen = doc['data']; 
                       // this.documents[a].status = true; 
                      }else{
                        // this.documents[a].status = false; 
                        validate = false;
                        mensaje += '<li>' + this.documents[a].docs[b].nombre + '</li>'
                      }
                  }
                  )
                  // console.log(code);
                  
                }
                if (this.documents[a].fecha && this.dataTercero.cedula) {
                  this.fechaL[this.documents[a].fechaTag] = this.reg.conductor[this.documents[a].fechaTag]
                }
                if (this.documents[a].fecha && this.dataTercero.placa) {
                  this.fechaL[this.documents[a].fechaTag] = this.reg.vehiculo[this.documents[a].fechaTag]
                }
              }
              
              // console.log(this.reg.hubImag);
              
       }
  }

  backdata()
  {
    this.reg.openDocs = false;
  }

  setModal(isOpen:any)
  {
    this.isModalOpen = isOpen;
  }

  selectDocument(a:any) {
    this.isModalOpen = true;
    this.documentActive = this.documents[a];


    const tag  = this.documents[a].fechaTag

    // if (this.dataTercero.cedula) {
    //   this.fechaL[tag] = this.reg.conductor[tag]
    // }
    
    // if (this.dataTercero.placa) {
    //   this.fechaL[tag] = this.reg.vehiculo[tag]
    // }

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
      
      this.reg.hubImag[name] = da;

      this.loadingData.dismiss();

    } catch (error) {
      console.error('Error al procesar la imagen:', error);
    }
  }

  async documentValidate()
  {
    this.reg.openDocs = false;
    const data = this.documents
    var doc = ''
    
    if (this.dataTercero.cedula) {
      doc = this.dataTercero.cedula
    }

    if (this.dataTercero.placa) {
      doc = this.dataTercero.placa
    }

    const tipos:any = [];

    data.forEach((documento:any) => {
      documento.docs.forEach((doc:any) => {
          tipos.push(doc.codigo);
      });
  });
  
  const cadena = tipos.join(',');  


    this.photo.getFotosTercero(doc, cadena).toPromise().then(
      data =>{
        this.loadingData.dismiss()
       if (data.code == '201') {

        this.presentAlert("Error", "Documentos pendientes por cargar", "", "Cerrar")

        }else{

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

 async checkDocument()
  {

    // console.log(this.fechaL);
    const loading = await this.loading.create({
      message: 'Guradando Fotos..'
    });
    
    var validate = true;
    var mensaje = '<ul>';
    var doc = false
    
    if (this.dataTercero.cedula) {
      doc = this.dataTercero.cedula
    }

    if (this.dataTercero.placa) {
      doc = this.dataTercero.placa
    }

    const data = this.documentActive.docs;
    for (let a = 0; a < data.length; a++) {
      const element = data[a];
      if (!this.reg.hubImag[element.codigo].webviewPath) {
       validate = false;
       mensaje += '<li>'+ this.documentActive.nombre + element.nombre + '</li>'
      }else{
        element.imagen = this.reg.hubImag[element.codigo].webviewPath
      }
    }

    if (this.documentActive.fecha) {
      const fecha = document.getElementById(this.documentActive.fechaTag) as HTMLInputElement;
     if (fecha.value) {

      if (this.dataTercero.cedula) {
        this.reg.conductor[this.documentActive.fechaTag] = fecha.value;
      }

      if (this.dataTercero.placa) {
        this.reg.vehiculo[this.documentActive.fechaTag] = fecha.value;
      }
      
      }else{
        validate = false;
        mensaje += '<li>' + this.documentActive.fechaTag + '</li>'
      }
    }

    mensaje += '</ul>'

    if (validate) {



      if (doc) {
        
           var jsonDocs:any = {
             files: [],
           };

             for (let b = 0; b < data.length; b++) {
               const doctipe = data.docs[b];
               
               if (this.reg.hubImag[doctipe.codigo].base64) {
                 const dataDoc:any = {
                   codigo: doc,
                   tipo: doctipe.codigo,
                   data64: this.reg.hubImag[doctipe.codigo].base64, 
                 }
       
                 jsonDocs.files.push(dataDoc);
               }
             }
     
           this.user.cargaDocumentos(jsonDocs).subscribe(
             (data) => {
               const files = data.data;
       
               for (let a = 0; a < jsonDocs.length; a++) {
                 const element = jsonDocs[a];         
                 if (files[element.tipo]) {
                   this.reg.hubImag[element.tipo].webviewPath = files[element.tipo];
                 }
               }

               this.isModalOpen = false;
               this.documentActive.status = true


             },
             (err) => {
               this.presentAlert("Error","Se presento una novedad en los datos","Volver a intentar","Cerrar")
               loading.dismiss();
             },
             ()=>{
              loading.dismiss();
             }
           )
        
      }


    }else{
      this.presentAlert('Error', 'En necesario cargar', mensaje, 'Cerrar')
    }
  }

  resetFotos(){
    const data = this.documentActive.docs;
    for (let a = 0; a < data.length; a++) {
      const element = data[a];
      this.reg.hubImag[element.codigo].webviewPath = '';
    }

  }

  async getDocument(codigo:any, tipo:any): Promise<any>
  {
    try {
      const resp:any = await this.photo.getFotoTercero(codigo,tipo).toPromise()
      return resp
    } catch (error) {
      throw error
    }
  }

  getImagen(code:any)
  {
    return this.reg.hubImag[code].webviewPath;
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
