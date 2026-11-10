import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  Camera,
  CameraDirection,
  CameraPermissionState,
  CameraResultType,
  CameraSource,
  ImageOptions,
  PermissionStatus,
  Photo
} from '@capacitor/camera';

export {
  CameraDirection,
  CameraPermissionState,
  CameraResultType,
  CameraSource,
  ImageOptions,
  PermissionStatus as CameraPermissionStatus,
  Photo
};

@Injectable({
  providedIn: 'root'
})
export class PlatformCameraService {

  /**
   * En web, fuerza siempre CameraDirection.Front para evitar que <pwa-camera>
   * solicite facingMode='environment' en PCs/laptops sin cámara trasera,
   * lo que provoca OverconstrainedError y el mensaje "No camera found".
   */
  async getPhoto(options: ImageOptions): Promise<Photo> {
    const finalOptions: ImageOptions = { ...options };

    if (Capacitor.getPlatform() === 'web' && finalOptions.source === CameraSource.Camera) {
      finalOptions.direction = CameraDirection.Front;
    }

    return await Camera.getPhoto(finalOptions);
  }

  /**
   * Verificación de permisos con tipado estricto PermissionStatus.
   * En nativo: devuelve 'denied' si falla.
   * En web: devuelve 'prompt' (el navegador gestiona el permiso al pedir stream).
   */
  async checkPermissions(): Promise<PermissionStatus> {
    try {
      return await Camera.checkPermissions();
    } catch {
      if (Capacitor.getPlatform() === 'web') {
        return { camera: 'prompt', photos: 'granted' };
      }
      return { camera: 'denied', photos: 'denied' };
    }
  }

  /**
   * Solicitud de permisos con tipado estricto PermissionStatus.
   * En nativo: devuelve 'denied' si falla (sin falsificar 'granted').
   * En web: devuelve 'prompt' para delegar la gestión al navegador.
   */
  async requestPermissions(): Promise<PermissionStatus> {
    try {
      return await Camera.requestPermissions();
    } catch {
      if (Capacitor.getPlatform() === 'web') {
        return { camera: 'prompt', photos: 'granted' };
      }
      return { camera: 'denied', photos: 'denied' };
    }
  }
}

