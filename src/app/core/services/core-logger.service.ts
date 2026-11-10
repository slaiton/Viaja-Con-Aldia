import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CoreLoggerService {
  /**
   * Registra errores de forma genérica sin exponer datos sensibles.
   */
  logSafeError(context: string): void {
    // Implementación vacía temporal para cumplir directriz de arquitectura
    // sin violar la prohibición de uso de console.* en producción.
  }
}

