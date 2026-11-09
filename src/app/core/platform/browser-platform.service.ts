import { Injectable } from '@angular/core';
import { Browser, OpenOptions } from '@capacitor/browser';

@Injectable({
  providedIn: 'root'
})
export class PlatformBrowserService {
  private readonly baseUrlCapacitaciones = 'https://www.3slogistica.com/tr_panel/process/capacitaciones/';

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
      url: this.baseUrlCapacitaciones,
      windowName: '_blank'
    });
  }
}

