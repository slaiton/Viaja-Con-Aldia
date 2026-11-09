import { Injectable } from '@angular/core';
import { Network, ConnectionStatus } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlatformNetworkService {
  private readonly isOnlineSubject = new BehaviorSubject<boolean>(true);
  public readonly isOnline$: Observable<boolean> = this.isOnlineSubject.asObservable();

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      const status = await Network.getStatus();
      this.isOnlineSubject.next(status.connected);

      Network.addListener('networkStatusChange', (s: ConnectionStatus) => {
        this.isOnlineSubject.next(s.connected);
      });
    } catch {
      this.isOnlineSubject.next(true);
    }
  }

  async getStatus(): Promise<ConnectionStatus> {
    try {
      return await Network.getStatus();
    } catch {
      return { connected: true, connectionType: 'wifi' };
    }
  }

  get isConnected(): boolean {
    return this.isOnlineSubject.value;
  }
}

