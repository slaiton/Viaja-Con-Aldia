import Dexie, { Table } from 'dexie';
import { Injectable } from '@angular/core';

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  updatedAt: number;
  expiresAt?: number;
}

export interface OutboxEntry {
  id?: number;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload?: any;
  headers?: Record<string, string>;
  createdAt: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED' | 'COMPLETED';
  retryCount: number;
  lastError?: string;
}

export interface GpsLogEntry {
  id?: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
  synced: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AldiaDatabase extends Dexie {
  cache_store!: Table<CacheEntry, string>;
  outbox_queue!: Table<OutboxEntry, number>;
  gps_logs!: Table<GpsLogEntry, number>;

  constructor() {
    super('AldiaDatabase');
    this.version(1).stores({
      cache_store: 'key, updatedAt, expiresAt',
      outbox_queue: '++id, endpoint, method, createdAt, status',
      gps_logs: '++id, timestamp, synced'
    });
  }

  /**
   * Obtiene un registro del cache_store. Si ha expirado según su TTL, lo elimina y retorna null.
   */
  async getCache<T>(key: string): Promise<T | null> {
    try {
      const entry = await this.cache_store.get(key);
      if (!entry) {
        return null;
      }
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        await this.cache_store.delete(key);
        return null;
      }
      return entry.data as T;
    } catch (err) {
      console.warn(`[AldiaDatabase] Error leyendo clave '${key}' de cache_store:`, err);
      return null;
    }
  }

  /**
   * Guarda o actualiza un registro en el cache_store con opción de tiempo de vida (TTL en ms).
   */
  async setCache<T>(key: string, data: T, ttlMs?: number): Promise<void> {
    try {
      const now = Date.now();
      const entry: CacheEntry<T> = {
        key,
        data,
        updatedAt: now,
        expiresAt: ttlMs ? now + ttlMs : undefined
      };
      await this.cache_store.put(entry);
    } catch (err) {
      console.warn(`[AldiaDatabase] Error guardando clave '${key}' en cache_store:`, err);
    }
  }

  /**
   * Elimina un registro puntual del cache_store.
   */
  async deleteCache(key: string): Promise<void> {
    try {
      await this.cache_store.delete(key);
    } catch (err) {
      console.warn(`[AldiaDatabase] Error eliminando clave '${key}' de cache_store:`, err);
    }
  }

  /**
   * Limpia todos los registros almacenados en cache_store.
   */
  async clearCache(): Promise<void> {
    try {
      await this.cache_store.clear();
    } catch (err) {
      console.warn('[AldiaDatabase] Error limpiando cache_store:', err);
    }
  }
}

export const aldiaDb = new AldiaDatabase();
