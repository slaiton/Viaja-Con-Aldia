import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo } from '@capacitor/camera';

export { CameraResultType, CameraSource, Photo };

@Injectable({
  providedIn: 'root'
})
export class PlatformCameraService {
  async getPhoto(options: ImageOptions): Promise<Photo> {
    return await Camera.getPhoto(options);
  }

  async checkPermissions(): Promise<any> {
    try {
      return await Camera.checkPermissions();
    } catch {
      return { camera: 'granted', photos: 'granted' };
    }
  }

  async requestPermissions(): Promise<any> {
    try {
      return await Camera.requestPermissions();
    } catch {
      return { camera: 'granted', photos: 'granted' };
    }
  }
}

