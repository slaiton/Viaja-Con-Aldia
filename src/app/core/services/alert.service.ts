import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    private alert: AlertController,
    private router: Router
  ) { }


  private async createAlert(options: {
    title: string;
    subheader: string;
    desc: string;
    buttons: any[];
    backdropDismiss?: boolean;
  }) {
    const alert = await this.alert.create({
      header: options.title,
      subHeader: options.subheader,
      message: options.desc,
      buttons: options.buttons,
      backdropDismiss: options.backdropDismiss ?? true
    });

    await alert.present();
    return alert;
  }


  async presentAlert(
    title: string,
    subheader: string,
    desc: string,
    botton: string
  ) {
    return this.createAlert({
      title,
      subheader,
      desc,
      buttons: [
        {
          text: botton,
          role: 'confirm'
        }
      ]
    });
  }

  async presentAlertRedirect(
    title: string,
    subheader: string,
    desc: string,
    button: string,
    redirectTo?: string
  ) {
    const alert = await this.createAlert({
      title,
      subheader,
      desc,
      buttons: [
        {
          text: button,
          role: 'confirm'
        }
      ]
    });

    await alert.onDidDismiss();

    if (redirectTo) {
      this.router.navigateByUrl(redirectTo);
    }
  }

  async presentAlertButtons(
    title: string,
    subheader: string,
    desc: string,
    p0: string,
    buttons: { text: string; handler: () => void }[]
  ) {
    return this.createAlert({
      title,
      subheader,
      desc,
      buttons,
      backdropDismiss: false
    });
  }

}
