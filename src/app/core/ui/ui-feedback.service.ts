import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { AlertService } from '@core/services/alert.service';

export type ToastColor = 'success' | 'warning' | 'danger' | 'primary';

export interface ConfirmDialogOptions {
  header: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  destructive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UiFeedbackService {
  constructor(
    private readonly toastCtrl: ToastController,
    private readonly alertCtrl: AlertController,
    private readonly alertService: AlertService
  ) {}

  async showToast(
    message: string,
    color: ToastColor = 'primary',
    durationMs: number = 2400
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: durationMs,
      position: 'top',
      color
    });
    await toast.present();
  }

  async showAlert(header: string, message: string): Promise<void> {
    await this.alertService.presentAlert(header, '', message, 'Aceptar');
  }

  async confirm(options: ConfirmDialogOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let resolved = false;
      const done = (value: boolean): void => {
        if (!resolved) {
          resolved = true;
          resolve(value);
        }
      };

      void this.alertCtrl
        .create({
          header: options.header,
          message: options.message,
          backdropDismiss: false,
          buttons: [
            {
              text: options.cancelText || 'Cancelar',
              role: 'cancel',
              handler: () => done(false)
            },
            {
              text: options.confirmText,
              role: options.destructive ? 'destructive' : 'confirm',
              handler: () => done(true)
            }
          ]
        })
        .then(async (alert) => {
          await alert.present();
          const { role } = await alert.onDidDismiss();
          done(role === 'confirm' || role === 'destructive');
        });
    });
  }
}
