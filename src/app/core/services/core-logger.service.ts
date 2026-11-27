import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface SafeErrorLog {
  timestamp: string;
  context: string;
}

@Injectable({
  providedIn: 'root'
})
export class CoreLoggerService {
  private readonly maxEntries = 50;
  private readonly buffer: SafeErrorLog[] = [];

  /**
   * Registra errores de forma genérica en un buffer circular en memoria,
   * sin exponer datos sensibles ni recurrir a console.* en producción.
   */
  logSafeError(context: string): void {
    if (!context || typeof context !== 'string') {
      return;
    }

    const entry: SafeErrorLog = {
      timestamp: new Date().toISOString(),
      context: context.trim().slice(0, 150)
    };

    if (this.buffer.length >= this.maxEntries) {
      this.buffer.shift();
    }

    this.buffer.push(entry);
  }

  /**
   * Método de conveniencia para registrar mensajes estructurados o diagnósticos.
   */
  log(context: string, meta?: unknown): void {
    const detail = meta ? ` | ${typeof meta === 'object' ? JSON.stringify(meta).slice(0, 100) : String(meta)}` : '';
    this.logSafeError(`${context}${detail}`);
  }

  /**
   * Registra trazas informativas limpias en memoria y en consola solo fuera de producción.
   */
  info(context: string, meta?: unknown): void {
    this.log(context, meta);
    if (!environment.production && typeof console !== 'undefined' && typeof console.info === 'function') {
      console.info(`[CoreLogger] ${context}`, meta ?? '');
    }
  }

  /**
   * Retorna una vista inmutable de los errores registrados para telemetría y diagnóstico.
   */
  getRecentErrors(): readonly SafeErrorLog[] {
    return [...this.buffer];
  }

  /**
   * Limpia el buffer en memoria cuando sea requerido por el ciclo de vida de la aplicación.
   */
  clearLogs(): void {
    this.buffer.length = 0;
  }
}
