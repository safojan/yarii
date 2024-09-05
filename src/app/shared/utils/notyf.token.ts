import { InjectionToken } from '@angular/core';
import { Notyf } from 'notyf';

export const NOTYF = new InjectionToken<Notyf>('NotyfToken');

export function notyfFactory(): Notyf {
  return new Notyf({
    position: { x: 'right', y: 'top' },
    duration: 4000,
    dismissible: true,
  });
}
