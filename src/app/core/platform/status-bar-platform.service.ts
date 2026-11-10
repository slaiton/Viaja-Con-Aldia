import { Injectable } from '@angular/core';
import { StatusBar, Style, BackgroundColorOptions, StyleOptions } from '@capacitor/status-bar';

export { Style, BackgroundColorOptions, StyleOptions };

@Injectable({
  providedIn: 'root'
})
export class StatusBarPlatformService {
  async setBackgroundColor(options: BackgroundColorOptions): Promise<void> {
    try {
      await StatusBar.setBackgroundColor(options);
    } catch {
      // Ignorar en entorno web/desktop donde la barra nativa no existe
    }
  }

  async setStyle(options: StyleOptions): Promise<void> {
    try {
      await StatusBar.setStyle(options);
    } catch {
      // Ignorar en entorno web/desktop
    }
  }
}

export { StatusBarPlatformService as PlatformStatusBarService };
