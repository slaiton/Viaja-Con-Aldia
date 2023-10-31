import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Foto } from '../models/photo.interface'

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  private PHOTO_STORAGE: string = 'photos';
  public fotos: Foto[] = [];
  public base64Image:any;

  constructor() { }

public async addNewToCamera(name:any ) {
  const capturedPhoto = await Camera.getPhoto({
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    quality: 100
  });
  const savedImageFile = await this.savePicture(capturedPhoto,name);
  this.fotos.unshift(savedImageFile);

  return savedImageFile;
}

  public async addNewToGallery(name:any) {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      quality: 100
    });


    // this.fotos.unshift({
    //   filepath: "soon...",
    //   webviewPath: capturedPhoto.webPath
    // });

    const savedImageFile = await this.savePicture(capturedPhoto,name);
    this.fotos.unshift(savedImageFile);

    return savedImageFile;
  }

  private async savePicture(photo: Photo, name:any) {
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

  private async readAsBase64(photo: Photo) {
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

}