import { Injectable } from '@angular/core';
// import { PushNotifications } from '@capacitor/push-notifications'; // Deshabilitado temporalmente hasta configurar google-services.json

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {}

  async getTokenNotifications() {
    // Deshabilitado temporalmente: Push Notifications inactivas hasta configurar google-services.json
    // let permStatus = await PushNotifications.requestPermissions();

    // PushNotifications.addListener('registration', async (token) => {
    //   console.log('Token FCM obtenido:', token.value);
    // });
  }
}
