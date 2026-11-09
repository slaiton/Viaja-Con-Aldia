import { Injectable } from '@angular/core';
import { Geolocation, Position, PositionOptions, PermissionStatus } from '@capacitor/geolocation';

export { Position, PositionOptions, PermissionStatus };

@Injectable({
  providedIn: 'root'
})
export class PlatformGeolocationService {
  async getCurrentPosition(options?: PositionOptions): Promise<Position> {
    return await Geolocation.getCurrentPosition(options);
  }

  async checkPermissions(): Promise<PermissionStatus> {
    try {
      return await Geolocation.checkPermissions();
    } catch {
      return { location: 'granted', coarseLocation: 'granted' };
    }
  }

  async requestPermissions(): Promise<PermissionStatus> {
    try {
      return await Geolocation.requestPermissions();
    } catch {
      return { location: 'granted', coarseLocation: 'granted' };
    }
  }
}

