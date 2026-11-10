import { Inject, Injectable } from '@angular/core';
import { Browser, OpenOptions } from '@capacitor/browser';
import { API_CONFIG, ApiConfig } from '@core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PlatformBrowserService {

  constructor(@Inject(API_CONFIG) private readonly apiConfig: ApiConfig) {}

  async open(options: OpenOptions): Promise<void> {
    try {
      await Browser.open(options);
    } catch {
      window.open(options.url, options.windowName || '_system');
    }
  }

  async close(): Promise<void> {
    try {
      await Browser.close();
    } catch {
      // Ignorar en plataformas web donde close no aplica
    }
  }

  async abrirCapacitaciones(): Promise<void> {
    await this.open({
      url: this.apiConfig.urlCapacitaciones,
      windowName: '_blank'
    });
  }
}

