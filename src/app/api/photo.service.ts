import { Injectable } from '@angular/core';
import { Camera, CameraDirection, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Foto } from '../models/photo.interface'
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  private PHOTO_STORAGE: string = 'photos';
  public fotos: Foto[] = [];
  public base64Image:any;

  constructor( private http: HttpClient) { }

public getFotoTercero(doc:any,tipo:any, tiporegistro:any) : Observable<any>
{
  const params = new HttpParams({
    fromString: 'codigo='+doc+'&tipo='+tipo + '&tipoRegistro='+ tiporegistro
  });

  const headers = new HttpHeaders({
    'Content-Type':'application/json; charset=utf-8',
    'user':'USUSEGINT',
    'password':'12249'
  });
  const requestOptions = { headers: headers, params: params };

  return this.http.get("https://api.aldialogistica.com/api/documento", requestOptions)
}

public getFotosTercero(doc:any, tipos:any, tiporegistro:any) : Observable<any>
{
  const params = new HttpParams({
    fromString: 'codigo=' + doc + '&tipos=' + tipos + '&tipoRegistro='+ tiporegistro
  });

  const headers = new HttpHeaders({
    'Content-Type':'application/json; charset=utf-8',
    'user':'USUSEGINT',
    'password':'12249'
  });
  const requestOptions = { headers: headers, params: params };

  return this.http.get("https://api.aldialogistica.com/api/documento", requestOptions)
}

public async addNewToCamera(name:any ) {
  const capturedPhoto = await Camera.getPhoto({
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    direction: CameraDirection.Front,
    quality: 100
  });

  const savedImageFile = await this.savePicture(capturedPhoto,name);
  this.fotos.unshift(savedImageFile);

  return savedImageFile;
}

public async addNewToCameraProfileTest(name:any ) {
  const capturedPhoto = await Camera.getPhoto({
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    direction: CameraDirection.Front,
    quality: 100
  });

  return capturedPhoto;
}

public async addNewToGallery(name:any) {
  // Take a photo
  const capturedPhoto = await Camera.getPhoto({
    resultType: CameraResultType.Uri,
    source: CameraSource.Prompt,
    quality: 100
  });


  const savedImageFile = await this.savePicture(capturedPhoto,name);
  this.fotos.unshift(savedImageFile);

  return savedImageFile;
}

public async addNewToCameraProfile(name:any ) {
  const capturedPhoto = await Camera.getPhoto({
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    direction: CameraDirection.Front,
    quality: 100
  });

  const savedImageFile = await this.savePicture(capturedPhoto,name);
  this.fotos.unshift(savedImageFile);

  return savedImageFile;
}



  private async savePicture(photo: Photo, name:any) {
    // console.log(photo);

    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(photo);

    this.base64Image = base64Data;

    // localStorage.setItem('imagen_casa', this.base64Image);
    // console.log(this.base64Image);



    // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.fotos),
    });

    // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
    return {
      filepath: fileName,
      name: name,
      base64: base64Data,
      webviewPath: photo.webPath
    };
  }

   async readAsBase64(photo: Photo) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });



  public async loadSaved() {
    // Retrieve cached photo array data
    const photoList = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.fotos = JSON.parse(photoList.value!) || [];

    for (let photo of this.fotos) {
      // Read each saved photo's data from the Filesystem
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data,
      });

      photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      // console.log(photo.webviewPath);


   }


  }

  async processAndRotationImage(base64Image: string, rotate:number): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();


      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (rotate > 0) {
          if (rotate == 90) {
            canvas.width = img.height;
            canvas.height = img.width;
          }
           ctx!.rotate(-rotate * Math.PI / 180);
           ctx!.drawImage(img, -img.width, 0);
          }else{
            canvas.width = img.width;
            canvas.height = img.height;
            ctx!.drawImage(img, 0, 0);
          }


         canvas.toBlob((blob: any) => {
          if (!blob) {
            reject('Error al convertir el lienzo a Blob');
            return;
          }
          const blobUrl = URL.createObjectURL(blob);
          resolve(blobUrl);
        }, 'image/jpeg');
      };

      img.onerror = () => {
        reject('Error al cargar la imagen');
      };

      img.src = base64Image;


   });
  }


  async processImage(base64Image: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');




        let width = img.width;
        let height = img.height;

        if (width > length){
          var MAX_WIDTH = 800;
          var MAX_HEIGHT = 600;
        }else{
          var MAX_WIDTH = 600;
          var MAX_HEIGHT = 800;
        }




        if (width > MAX_WIDTH && height > MAX_HEIGHT) {
          if (width / height > MAX_WIDTH / MAX_HEIGHT) {
            width = MAX_WIDTH;
            height *= MAX_WIDTH / img.width;
          } else {
            height = MAX_HEIGHT;
            width *= MAX_HEIGHT / img.height;
          }
        } else if(width < MAX_WIDTH && height < MAX_HEIGHT){



        }


        console.log(width);
        console.log(height);

        canvas.width = width;
        canvas.height = height;
        ctx!.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg');
        resolve(dataUrl);
      };

      img.onerror = (error) => {
        reject('Error al cargar la imagen: ' + error);
      };

      img.src = base64Image;

    });

  }

  async processAndCropImage(base64Image: string, desiredSizeX:any, desiredSizeY:any, rotationAngle:any ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject('Error al obtener contexto 2D');
          return;
        }


        const centerX = img.width / 2;
        const centerY = img.height / 2;

        // Coordenadas de inicio del recorte
        const cropX = centerX - (desiredSizeX / 2);
        const cropY = centerY - (desiredSizeY / 2);

        // Tamaño del lienzo para la nueva imagen
        canvas.width = desiredSizeX;
        canvas.height = desiredSizeY;

        // Dibujar la imagen original en el lienzo con el tamaño de recorte y escalado
        ctx.drawImage(img, cropX, cropY, desiredSizeX, desiredSizeY, 0, 0, desiredSizeX, desiredSizeY);


        const newImageDataUrl = canvas.toDataURL('image/jpeg');


        canvas.toBlob((blob:any) => {
          if (!blob) {
            reject('Error al convertir el lienzo a Blob');
            return;
          }
          const blobUrl = URL.createObjectURL(blob);
          // const resp:any = {blob: blobUrl, base64:newImageDataUrl}
          resolve(blobUrl);
        }, 'image/jpeg');

      };

      img.onerror = () => {
        reject('Error al cargar la imagen');
      };

      img.src = base64Image;
    });
  }

}
