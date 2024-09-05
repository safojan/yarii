import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  put(key: string, value: any) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  }

  get(key: string): any {
    return localStorage.getItem(key);
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }

  destroy() {
    localStorage.clear();
  }
}
