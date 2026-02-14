import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { CanComponentDeactivate } from '../../shared/interfaces/can-component-deactivate.interface';

@Injectable({
  providedIn: 'root'
})
export class PendingChangesGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(component: CanComponentDeactivate): boolean | Promise<boolean> {
    console.log('[PendingChangesGuard] canDeactivate triggered.');

    if (typeof component.canDeactivate !== 'function') {
      console.warn('[PendingChangesGuard] Component does NOT implement canDeactivate(). Allowing navigation.');
      return true;
    }

    const result = component.canDeactivate();

    if (result instanceof Promise) {
      console.log('[PendingChangesGuard] canDeactivate() returned a Promise.');
      return result.then(res => {
        console.log('[PendingChangesGuard] Promise resolved to:', res);
        return res;
      });
    }

    console.log('[PendingChangesGuard] canDeactivate() returned:', result);
    return result;
  }
}
