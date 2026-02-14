import { Injectable, ComponentRef, ViewContainerRef, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef } from '@angular/core';
import { AdminModalComponent, ModalConfig } from '';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalComponentRef: ComponentRef<AdminModalComponent> | null = null;
  private modalResult = new Subject<any>();

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  open(config: ModalConfig): Promise<any> {
    // Create component
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(AdminModalComponent);
    const componentRef = componentFactory.create(this.injector);
    this.modalComponentRef = componentRef;

    // Set config
    componentRef.instance.config = { ...componentRef.instance.config, ...config };
    
    // Subscribe to events
    componentRef.instance.primaryAction.subscribe((data) => {
      this.modalResult.next({ action: 'primary', data });
      this.close();
    });

    componentRef.instance.secondaryAction.subscribe((data) => {
      this.modalResult.next({ action: 'secondary', data });
      this.close();
    });

    componentRef.instance.closed.subscribe(() => {
      this.modalResult.next({ action: 'closed' });
      this.close();
    });

    // Attach to DOM
    this.appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    // Open modal
    setTimeout(() => {
      componentRef.instance.open();
    });

    // Return promise
    return new Promise((resolve) => {
      const subscription = this.modalResult.subscribe((result) => {
        resolve(result);
        subscription.unsubscribe();
      });
    });
  }

  close() {
    if (this.modalComponentRef) {
      this.appRef.detachView(this.modalComponentRef.hostView);
      this.modalComponentRef.destroy();
      this.modalComponentRef = null;
    }
  }
}