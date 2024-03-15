import { Injectable } from '@angular/core';
import {
  Plugins,
  
} from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications';


@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  constructor() { 
    
   }

  // async requestPermission() {
  //   const { PushNotifications } = Plugins;
  //   const { granted } = await PushNotifications.requestPermission();
  //   if (!granted) {
  //     console.error('Permisos de notificación no otorgados.');
  //   }
  // }

}
