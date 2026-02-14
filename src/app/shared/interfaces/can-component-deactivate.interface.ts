// can-component-deactivate.interface.ts
export interface CanComponentDeactivate {
    canDeactivate: () => boolean | Promise<boolean>;
  }