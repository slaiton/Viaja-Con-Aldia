import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { StorageService } from '@core/services/storage.service';
import { environment } from '@env/environment';

export interface DeviceMetadata {
  dispositivo_id: string;
  plataforma: string;
  version_app: string;
  push_token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DevicePlatformService {
  constructor(private readonly storage: StorageService) {}

  /**
   * Obtiene de forma segura los metadatos de hardware y sistema sin fallar en Web ni en Móvil.
   */
  async getDeviceMetadata(): Promise<DeviceMetadata> {
    const dispositivo_id = await this.resolveDeviceId();
    const plataforma = await this.resolvePlatform();
    const version_app = await this.resolveAppVersion();
    const push_token = this.resolveStoredPushToken();

    return {
      dispositivo_id,
      plataforma,
      version_app,
      ...(push_token ? { push_token } : {})
    };
  }

  private async resolveDeviceId(): Promise<string> {
    try {
      const idResult = await Device.getId();
      const rawId = (idResult?.identifier || '').trim();
      if (rawId && rawId !== 'unknown') {
        return rawId;
      }
    } catch {
      // Entornos web donde getId no está soportado
    }

    let savedId = this.storage.get<string>('aldia_device_id');
    if (!savedId) {
      savedId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `dev_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      this.storage.set('aldia_device_id', savedId);
    }
    return savedId;
  }

  private async resolvePlatform(): Promise<string> {
    try {
      const info = await Device.getInfo();
      const rawPlatform = (info?.platform || Capacitor.getPlatform() || 'web').toLowerCase().trim();
      return rawPlatform || 'web';
    } catch {
      return (Capacitor.getPlatform() || 'web').toLowerCase().trim();
    }
  }

  private async resolveAppVersion(): Promise<string> {
    try {
      if (Capacitor.isNativePlatform()) {
        const appInfo = await App.getInfo();
        if (appInfo?.version && appInfo.version.trim()) {
          return appInfo.version.trim();
        }
      }
    } catch {
      // Fallback seguro en web
    }
    return String(environment.version || '1.0.0');
  }

  private resolveStoredPushToken(): string | undefined {
    try {
      const push = this.storage.get<string>('push_token') || this.storage.get<string>('fcm_token');
      if (push && push.trim()) {
        return push.trim();
      }
    } catch {
      // Ignorar lectura
    }
    return undefined;
  }

  /**
   * Cierra la aplicación de forma segura si se encuentra en entorno nativo.
   */
  async exitApp(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await App.exitApp();
      }
    } catch {
      // Ignorar en entornos web
    }
  }
}
