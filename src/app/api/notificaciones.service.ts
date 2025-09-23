import { Injectable } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {}

  async getTokenNotifications() {
    let permStatus = await PushNotifications.requestPermissions();

    PushNotifications.addListener('registration', async (token) => {
      console.log('Token FCM obtenido:', token.value);
    });
  }
}