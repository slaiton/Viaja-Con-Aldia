import { Injectable } from '@angular/core';
import { PluginListenerHandle } from '@capacitor/core';
import {
  // PushNotifications, // Deshabilitado temporalmente hasta configurar google-services.json
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
import { CoreLoggerService } from '../services/core-logger.service';

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
  constructor(private readonly coreLogger: CoreLoggerService) {}

  // Push Notifications API
  async checkPushPermissions(): Promise<PushPermissionStatus> {
    // Deshabilitado temporalmente: Push Notifications inactivas hasta configurar google-services.json
    return { receive: 'denied' };
  }

  async requestPushPermissions(): Promise<PushPermissionStatus> {
    // Deshabilitado temporalmente: Push Notifications inactivas hasta configurar google-services.json
    return { receive: 'denied' };
  }

  async registerPush(): Promise<void> {
    // Deshabilitado temporalmente: Push Notifications inactivas hasta configurar google-services.json
    return;
  }

  /*
  private createSafeListener<T>(
    listenerFunc: (data: T) => void | Promise<void>
  ): (data: T) => void {
    return (data: T): void => {
      try {
        const result = listenerFunc(data);
        if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
          Promise.resolve(result).catch(() => {
            this.coreLogger.logSafeError('Error genérico en callback de notificaciones');
          });
        }
      } catch {
        this.coreLogger.logSafeError('Error genérico en callback de notificaciones');
      }
    };
  }
  */

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
    _eventName: K,
    _listenerFunc: (data: PushNotificationEventMap[K]) => void | Promise<void>
  ): Promise<PluginListenerHandle> {
    // Deshabilitado temporalmente: Push Notifications inactivas hasta configurar google-services.json
    // En no-op se retorna handler seguro con remove()
    return {
      remove: async () => {}
    };
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

