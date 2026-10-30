import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Network, ConnectionStatus } from '@capacitor/network';
import { AldiaDatabase, OutboxEntry } from './database';

@Injectable({
  providedIn: 'root'
})
export class OutboxSyncService {
  private isOnlineSubject = new BehaviorSubject<boolean>(true);
  public isOnline$ = this.isOnlineSubject.asObservable();

  private isSyncing = false;

  constructor(
    private http: HttpClient,
    private db: AldiaDatabase,
    private ngZone: NgZone
  ) {
    this.initNetworkListener();
  }

  /**
   * Inicializa la escucha de cambios de conectividad y dispara sincronización al volver en línea.
   */
  private async initNetworkListener(): Promise<void> {
    try {
      const initialStatus = await Network.getStatus();
      this.isOnlineSubject.next(initialStatus.connected);

      if (initialStatus.connected) {
        this.syncPendingQueue();
      }

      await Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
        this.ngZone.run(() => {
          this.isOnlineSubject.next(status.connected);
          if (status.connected) {
            console.info('[OutboxSyncService] Conexión restablecida. Sincronizando cola outbox...');
            this.syncPendingQueue();
          } else {
            console.warn('[OutboxSyncService] Conexión perdida. Operando en modo local/offline.');
          }
        });
      });
    } catch (err) {
      console.warn('[OutboxSyncService] No se pudo inicializar listener de Network:', err);
    }
  }

  /**
   * Retorna el estado actual síncrono de conexión.
   */
  get isConnected(): boolean {
    return this.isOnlineSubject.getValue();
  }

  /**
   * Procesa los registros pendientes o fallidos en la tabla outbox_queue de Dexie.
   */
  async syncPendingQueue(): Promise<void> {
    if (this.isSyncing || !this.isConnected) {
      return;
    }

    this.isSyncing = true;

    try {
      const pendingEntries = await this.db.outbox_queue
        .where('status')
        .anyOf(['PENDING', 'FAILED'])
        .toArray();

      if (pendingEntries.length === 0) {
        return;
      }

      console.info(`[OutboxSyncService] Procesando ${pendingEntries.length} transacciones offline pendientes...`);

      for (const entry of pendingEntries) {
        if (!this.isConnected) {
          console.warn('[OutboxSyncService] Se interrumpió la conexión durante la sincronización.');
          break;
        }

        await this.processEntry(entry);
      }
    } catch (err) {
      console.error('[OutboxSyncService] Error durante la sincronización de la cola outbox:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Ejecuta individualmente la petición HTTP de un elemento de la cola.
   */
  private async processEntry(entry: OutboxEntry): Promise<void> {
    if (!entry.id) return;

    try {
      await this.db.outbox_queue.update(entry.id, { status: 'SYNCING' });

      const headers = new HttpHeaders(entry.headers || {});

      await firstValueFrom(
        this.http.request(entry.method, entry.endpoint, {
          body: entry.payload,
          headers
        })
      );

      // Si se ejecutó exitosamente, se elimina de la cola para liberar almacenamiento
      await this.db.outbox_queue.delete(entry.id);
      console.info(`[OutboxSyncService] Transacción #${entry.id} (${entry.endpoint}) sincronizada con éxito.`);
    } catch (err: any) {
      const nextRetry = (entry.retryCount || 0) + 1;
      const lastError = err?.message || 'Error de conexión durante reintento';

      console.warn(`[OutboxSyncService] Falla al sincronizar transacción #${entry.id}. Intento ${nextRetry}:`, lastError);

      await this.db.outbox_queue.update(entry.id, {
        status: 'FAILED',
        retryCount: nextRetry,
        lastError
      });
    }
  }
}
