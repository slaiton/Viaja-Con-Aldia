import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    private alert: AlertController
  ) { }

  
  async presentAlert(
    title: String,
    subheader: String,
    desc: String,
    botton: String
  ) {
    const alert = await this.alert.create({
      header: '' + title,
      subHeader: '' + subheader,
      message: '' + desc,
      buttons: ['' + botton],
    });

    await alert.present();
  }

  async presentAlertRedirect(
    title: string,
    subheader: string,
    desc: string,
    button: string,
    redirectTo?: string // nuevo parámetro opcional
  ) {
    const alert = await this.alert.create({
      header: title,
      subHeader: subheader,
      message: desc,
      buttons: [button],
    });
  
    await alert.present();
  
    await alert.onDidDismiss();
  
    if (redirectTo) {
      location.href = redirectTo;
      // this.router.navigateByUrl(redirectTo);
    }
  }

    async presentAlertButtons(title: String, subheader: String, desc: String, p0: string, buttons: { text: string; handler: () => void; }[]) {
    const alert = await this.alert.create({
      header: '' + title,
      subHeader: '' + subheader,
      message: '' + desc,
      buttons: buttons,
      backdropDismiss: false
    });

    await alert.present();
  }
  

}
