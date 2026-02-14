// src/app/shared/components/stripe-payment/stripe-payment.component.ts
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StripeService } from '../../services/stripe.service';
import { Subscription } from 'rxjs';
import { StripePaymentElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-stripe-payment',
  template: `
    <div class="stripe-payment-wrapper">
      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Loading secure payment form...</p>
      </div>
      
      <div #stripePaymentElement 
           class="stripe-payment-element" 
           [class.hidden]="isLoading"></div>
      
      <div class="error-state" *ngIf="errorMessage && !isLoading">
        <div class="error-icon">⚠️</div>
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .stripe-payment-wrapper {
      position: relative;
      width: 100%;
      min-height: 280px;
    }
    
    .stripe-payment-element {
      width: 100%;
      transition: opacity 0.3s ease;
    }
    
    .stripe-payment-element.hidden {
      opacity: 0;
      height: 0;
      overflow: hidden;
    }
    
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }
    
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(124, 58, 237, 0.2);
      border-radius: 50%;
      border-top-color: #7c3aed;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .loading-state p {
      color: #6b7280;
      font-size: 14px;
    }
    
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      background: #fef2f2;
      border-radius: 8px;
      border: 1px solid #fecaca;
    }
    
    .error-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }
    
    .error-state p {
      color: #dc2626;
      font-size: 14px;
      margin: 0;
    }
  `]
})
export class StripePaymentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stripePaymentElement', { static: true }) stripeElementRef!: ElementRef;
  @Output() elementReady = new EventEmitter<boolean>();
  @Output() elementError = new EventEmitter<string>();
  @Output() elementChange = new EventEmitter<{complete: boolean, error?: any}>();
  
  private subscriptions: Subscription[] = [];
  private paymentElement: StripePaymentElement | null = null;
  private isMounted = false;
  isLoading = true;
  errorMessage = '';

  constructor(private stripeService: StripeService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.stripeService.getPaymentElement().subscribe(element => {
        if (element && !this.paymentElement) {
          this.paymentElement = element;
          if (this.stripeElementRef?.nativeElement && !this.isMounted) {
            this.mountElement();
          }
        }
      })
    );
  }

  ngAfterViewInit(): void {
    if (this.paymentElement && !this.isMounted) {
      setTimeout(() => this.mountElement(), 0);
    }
  }

  private mountElement(): void {
    if (!this.paymentElement || !this.stripeElementRef?.nativeElement || this.isMounted) {
      return;
    }

    try {
      this.paymentElement.mount(this.stripeElementRef.nativeElement);
      this.isMounted = true;
      
      this.paymentElement.on('ready', () => {
        this.isLoading = false;
        this.errorMessage = '';
        this.stripeService.setElementMounted(true);
        this.elementReady.emit(true);
      });
      
      this.paymentElement.on('change', (event: any) => {
        if (event.error) {
          this.errorMessage = event.error.message;
          this.elementError.emit(event.error.message);
        } else {
          this.errorMessage = '';
        }
        
        this.elementChange.emit({
          complete: event.complete,
          error: event.error
        });
      });
      
      // Fallback for ready event
      setTimeout(() => {
        if (this.isLoading) {
          this.isLoading = false;
          this.stripeService.setElementMounted(true);
          this.elementReady.emit(true);
        }
      }, 3000);
      
    } catch (error: any) {
      console.error('Mount error:', error);
      this.errorMessage = 'Failed to load payment form. Please refresh and try again.';
      this.elementError.emit(this.errorMessage);
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    if (this.isMounted && this.paymentElement) {
      try {
        this.paymentElement.unmount();
      } catch (e) {
        // Ignore unmount errors
      }
    }
  }
}