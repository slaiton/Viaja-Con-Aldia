import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { OutboxSyncService } from '@core/offline/outbox-sync.service';

@Component({
  selector: 'app-offline-banner',
  templateUrl: './offline-banner.component.html',
  styleUrls: ['./offline-banner.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class OfflineBannerComponent {
  @Input() forceShow: boolean | null = null;
  @Input() message: string = 'Sin señal · Mostrando caché local';

  public isOnline$: Observable<boolean>;

  constructor(private outboxSync: OutboxSyncService) {
    this.isOnline$ = this.outboxSync.isOnline$;
  }

  get shouldShow(): boolean {
    if (this.forceShow !== null) {
      return this.forceShow;
    }
    return !this.outboxSync.isConnected;
  }
}
