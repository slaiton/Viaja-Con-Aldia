import { Injectable } from '@angular/core';
import { PluginListenerHandle } from '@capacitor/core';
import {
  PushNotifications,
  PermissionStatus as PushPermissionStatus,
  Token,
  RegistrationError,
  PushNotificationSchema,
  ActionPerformed
} from '@capacitor/push-notifications';
import {
  LocalNotifications,
  PermissionStatus as LocalPermissionStatus,
  ScheduleOptions
} from '@capacitor/local-notifications';

export {
  PushPermissionStatus,
  LocalPermissionStatus,
  Token,
  RegistrationError,
  PushNotificationSchema,
  ActionPerformed,
  PluginListenerHandle,
  ScheduleOptions
};

@Injectable({
  providedIn: 'root'
})
export class NotificationPlatformService {
  // Push Notifications API
  async checkPushPermissions(): Promise<PushPermissionStatus> {
    try {
      return await PushNotifications.checkPermissions();
    } catch {
      return { receive: 'denied' };
    }
  }

  async requestPushPermissions(): Promise<PushPermissionStatus> {
    try {
      return await PushNotifications.requestPermissions();
    } catch {
      return { receive: 'denied' };
    }
  }

  async registerPush(): Promise<void> {
    try {
      await PushNotifications.register();
    } catch (error) {
      console.warn('PushNotifications.register no soportado en este entorno:', error);
    }
  }

  async addPushListener(
    eventName: 'registration',
    listenerFunc: (token: Token) => void
  ): Promise<PluginListenerHandle>;
  async addPushListener(
    eventName: 'registrationError',
    listenerFunc: (error: RegistrationError) => void
  ): Promise<PluginListenerHandle>;
  async addPushListener(
    eventName: 'pushNotificationReceived',
    listenerFunc: (notification: PushNotificationSchema) => void
  ): Promise<PluginListenerHandle>;
  async addPushListener(
    eventName: 'pushNotificationActionPerformed',
    listenerFunc: (action: ActionPerformed) => void
  ): Promise<PluginListenerHandle>;
  async addPushListener(eventName: any, listenerFunc: any): Promise<PluginListenerHandle> {
    try {
      return await PushNotifications.addListener(eventName, listenerFunc);
    } catch {
      return {
        remove: async () => {}
      };
    }
  }

  // Local Notifications API
  async checkLocalPermissions(): Promise<LocalPermissionStatus> {
    try {
      return await LocalNotifications.checkPermissions();
    } catch {
      return { display: 'denied' };
    }
  }

  async requestLocalPermissions(): Promise<LocalPermissionStatus> {
    try {
      return await LocalNotifications.requestPermissions();
    } catch {
      return { display: 'denied' };
    }
  }

  async scheduleLocal(options: ScheduleOptions): Promise<void> {
    try {
      await LocalNotifications.schedule(options);
    } catch (error) {
      console.warn('LocalNotifications.schedule no soportado o fallido en este entorno:', error);
    }
  }
}
