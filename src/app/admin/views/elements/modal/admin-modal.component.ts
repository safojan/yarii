import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { ModalModule } from 'src/app/shared/components/modal/modal.module';
import { pageTransition } from 'src/app/shared/utils/animations';

export interface ModalConfig {
  title?: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'custom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  showFooter?: boolean;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  primaryButtonClass?: string;
  secondaryButtonClass?: string;
  customTemplate?: TemplateRef<any>;
  data?: any;
}

@Component({
  selector: 'admin-modal',
  standalone: true,
  imports: [
    CommonModule,
    ModalModule
  ],
  templateUrl: './admin-modal.component.html',
  styleUrl: './admin-modal.component.css',
  animations: [pageTransition]
})
export class AdminModalComponent {
  @Input() config: ModalConfig = {
    type: 'info',
    size: 'md',
    showCloseButton: true,
    showFooter: true,
    primaryButtonText: 'Confirm',
    secondaryButtonText: 'Cancel'
  };
  
  @Output() primaryAction = new EventEmitter<any>();
  @Output() secondaryAction = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  showModal: boolean = false;
  modalComponent: ModalComponent;

  constructor() {
    this.modalComponent = new ModalComponent();
  }

  open(config?: Partial<ModalConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.showModal = true;
  }

  close() {
    this.showModal = false;
    this.closed.emit();
  }

  onPrimaryAction() {
    this.primaryAction.emit(this.config.data);
    this.close();
  }

  onSecondaryAction() {
    this.secondaryAction.emit(this.config.data);
    this.close();
  }

  onModalCloseHandler(event: boolean) {
    this.showModal = event;
    if (!event) {
      this.closed.emit();
    }
  }

  getIconClass(): string {
    const iconClasses = {
      'info': 'text-blue-600',
      'success': 'text-green-600',
      'warning': 'text-yellow-600',
      'error': 'text-red-600',
      'confirm': 'text-blue-600',
      'custom': ''
    };
    return iconClasses[this.config.type || 'info'];
  }

  getIconBgClass(): string {
    const bgClasses = {
      'info': 'bg-blue-50',
      'success': 'bg-green-50',
      'warning': 'bg-yellow-50',
      'error': 'bg-red-50',
      'confirm': 'bg-blue-50',
      'custom': ''
    };
    return bgClasses[this.config.type || 'info'];
  }

  getSizeClass(): string {
    const sizeClasses = {
      'sm': 'max-w-md',
      'md': 'max-w-lg',
      'lg': 'max-w-2xl',
      'xl': 'max-w-4xl'
    };
    return sizeClasses[this.config.size || 'md'];
  }
}