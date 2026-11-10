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

  /**
   * Envuelve listeners para asegurar captura tanto de excepciones síncronas
   * como de rechazos de promesas en callbacks asíncronos (evita unhandled rejection).
   */
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
        const safeListener = this.createSafeListener(
          listenerFunc as (token: Token) => void | Promise<void>
        );
        return await PushNotifications.addListener('registration', safeListener);
      }
      if (eventName === 'registrationError') {
        const safeListener = this.createSafeListener(
          listenerFunc as (error: RegistrationError) => void | Promise<void>
        );
        return await PushNotifications.addListener('registrationError', safeListener);
      }
      if (eventName === 'pushNotificationReceived') {
        const safeListener = this.createSafeListener(
          listenerFunc as (notification: PushNotificationSchema) => void | Promise<void>
        );
        return await PushNotifications.addListener('pushNotificationReceived', safeListener);
      }
      if (eventName === 'pushNotificationActionPerformed') {
        const safeListener = this.createSafeListener(
          listenerFunc as (action: ActionPerformed) => void | Promise<void>
        );
        return await PushNotifications.addListener('pushNotificationActionPerformed', safeListener);
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

