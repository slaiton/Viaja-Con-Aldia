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

export interface PushNotificationEventMap {
  registration: Token;
  registrationError: RegistrationError;
  pushNotificationReceived: PushNotificationSchema;
  pushNotificationActionPerformed: ActionPerformed;
}

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
    } catch {
      // Entorno sin soporte para notificaciones push
    }
  }

  async addPushListener(
    eventName: 'registration',
    listenerFunc: (token: Token) => void | Promise<void>
  ): Promise<PluginListenerHandle>;
  async addPushListener(
    eventName: 'registrationError',
    listenerFunc: (error: RegistrationError) => void | Promise<void>
  ): Promise<PluginListenerHandle>;
  async addPushListener(
    eventName: 'pushNotificationReceived',
    listenerFunc: (notification: PushNotificationSchema) => void | Promise<void>
  ): Promise<PluginListenerHandle>;
  async addPushListener(
    eventName: 'pushNotificationActionPerformed',
    listenerFunc: (action: ActionPerformed) => void | Promise<void>
  ): Promise<PluginListenerHandle>;
  async addPushListener<K extends keyof PushNotificationEventMap>(
    eventName: K,
    listenerFunc: (data: PushNotificationEventMap[K]) => void | Promise<void>
  ): Promise<PluginListenerHandle> {
    try {
      if (eventName === 'registration') {
        return await PushNotifications.addListener(
          'registration',
          listenerFunc as (token: Token) => void
        );
      }
      if (eventName === 'registrationError') {
        return await PushNotifications.addListener(
          'registrationError',
          listenerFunc as (error: RegistrationError) => void
        );
      }
      if (eventName === 'pushNotificationReceived') {
        return await PushNotifications.addListener(
          'pushNotificationReceived',
          listenerFunc as (notification: PushNotificationSchema) => void
        );
      }
      if (eventName === 'pushNotificationActionPerformed') {
        return await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          listenerFunc as (action: ActionPerformed) => void
        );
      }
      return {
        remove: async () => {}
      };
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
    } catch {
      // Entorno sin soporte para notificaciones locales
    }
  }
}

