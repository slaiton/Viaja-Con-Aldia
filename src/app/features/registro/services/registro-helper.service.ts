import { Injectable } from '@angular/core';
import { UserService } from '@core/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class RegistroHelperService {
  aceptaTerminos = false;
  aceptaHabeasData = false;

  constructor(private readonly user: UserService) {}

  toggleTerminos(checked: boolean): void {
    this.aceptaTerminos = checked;
  }

  toggleHabeasData(checked: boolean): void {
    this.aceptaHabeasData = checked;
  }

  async procesarFirmasContrato(cedula: string, placa: string, token: string): Promise<void> {
    try {
      await this.user.firmaContrato(1, cedula, '', token);
      await this.user.firmaContrato(2, cedula, placa, token);
    } catch {
      // Error silencioso en firma preliminar
    }
  }

  validarConsentimientos(): boolean {
    return this.aceptaTerminos && this.aceptaHabeasData;
  }

  reset(): void {
    this.aceptaTerminos = false;
    this.aceptaHabeasData = false;
  }
}

