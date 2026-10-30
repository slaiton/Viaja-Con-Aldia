import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  set<T>(key: string, value: T): void {
    if (typeof value === 'string') {
      localStorage.setItem(key, value.replace(/^["']|["']$/g, ''));
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  get<T>(key: string): T | null {
    const value = localStorage.getItem(key);
    if (value === null || value === undefined) return null;
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'string') {
        return parsed.replace(/^["']|["']$/g, '') as unknown as T;
      }
      return parsed as T;
    } catch {
      return (typeof value === 'string' ? value.replace(/^["']|["']$/g, '') : value) as unknown as T;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}