import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class LocalNotificationService {

  constructor() { }

    async executeNotification(id: any, title: any, body: any, largeBody:any, sumaryBody:any) {

    await LocalNotifications.schedule({
      notifications: [
        {
          id: id,
          title: title,
          body: body,
          largeBody: largeBody,
          summaryText: sumaryBody
        }
      ]
    });
  }

}
