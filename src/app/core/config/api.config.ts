import { InjectionToken } from '@angular/core';
import { environment } from '@env/environment';

export interface ApiConfig {
  baseUrlAldia: string;
  baseUrl3SL: string;
  urlCapacitaciones: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    baseUrlAldia: (environment.aldia?.uri || 'https://api.aldialogistica.com/api/').replace(/\/+$/, ''),
    baseUrl3SL: 'https://api.3slogistica.com/api',
    urlCapacitaciones: 'https://www.3slogistica.com/tr_panel/process/capacitaciones/'
  })
});

