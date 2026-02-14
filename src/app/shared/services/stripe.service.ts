import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  donationType: string;
  frequency?: string;
  donorName: string;
  donorEmail: string;
  donorMessage?: string;
  anonymous: boolean;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentId: string;
  customerId: string;
  type: 'payment_intent' | 'subscription';
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripePromise = loadStripe(environment.stripePublicKey);
  private elementsInstance = new BehaviorSubject<StripeElements | null>(null);
  private paymentElement = new BehaviorSubject<StripePaymentElement | null>(null);
  private paymentIntentClientSecret = new BehaviorSubject<string | null>(null);
  private currentPaymentType = new BehaviorSubject<string>('payment_intent');
  private isElementMounted = new BehaviorSubject<boolean>(false);
  
  // Currency detection based on user location
  private userCurrency = new BehaviorSubject<string>('usd');

  constructor(private http: HttpClient) {
    this.detectUserCurrency();
  }

  private detectUserCurrency(): void {
    const locale = navigator.language || 'en-US';
    const currencyMap: { [key: string]: string } = {
      'en-US': 'usd',
      'en-GB': 'gbp',
      'de-DE': 'eur',
      'fr-FR': 'eur',
      'ja-JP': 'jpy',
      'zh-CN': 'cny',
      'en-IN': 'inr',
      'en-CA': 'cad',
      'en-AU': 'aud'
    };
    
    const currency = currencyMap[locale] || 'usd';
    this.userCurrency.next(currency);
  }

  getUserCurrency(): Observable<string> {
    return this.userCurrency.asObservable();
  }

  async initializePaymentElement(
    amount: number, 
    donationType: string, 
    frequency?: string,
    donorInfo?: { name: string; email: string; message?: string; anonymous: boolean }
  ): Promise<StripePaymentElement> {
    try {
      // Clean up any existing elements
      this.cleanup();
      
      const currency = this.userCurrency.getValue();
      
      // Create payment intent with full donor information
      const request: PaymentIntentRequest = {
        amount: Math.round(amount * 100), // Convert to cents and ensure integer
        currency,
        donationType,
        frequency,
        donorName: donorInfo?.name || '',
        donorEmail: donorInfo?.email || '',
        donorMessage: donorInfo?.message,
        anonymous: donorInfo?.anonymous || false
      };
      
      const paymentIntent = await this.createPaymentIntent(request).toPromise();
      
      if (!paymentIntent || !paymentIntent.clientSecret) {
        throw new Error('Failed to create payment intent');
      }
      
      this.paymentIntentClientSecret.next(paymentIntent.clientSecret);
      this.currentPaymentType.next(paymentIntent.type);
      
      const stripe = await this.stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }
      
      // Create Elements with enhanced appearance
      const elements = stripe.elements({
        clientSecret: paymentIntent.clientSecret,
        appearance: this.getStripeAppearance(),
        loader: 'auto'
      });
      
      // Create Payment Element with enhanced options
      const paymentElement = elements.create('payment', {
        layout: 'tabs',
        defaultValues: {
          billingDetails: {
            name: donorInfo?.name || undefined,
            email: donorInfo?.email || undefined
          }
        },
        fields: {
          billingDetails: {
            name: donorInfo?.name ? 'never' : 'auto',
            email: donorInfo?.email ? 'never' : 'auto',
            phone: 'auto',
            address: 'auto'
          }
        },
        wallets: {
          applePay: 'auto',
          googlePay: 'auto'
        }
      });
      
      this.elementsInstance.next(elements);
      this.paymentElement.next(paymentElement);
      this.isElementMounted.next(false);
      
      // Return the payment element so the component can mount it
      return paymentElement;
      
    } catch (error) {
      console.error('Error initializing Stripe Payment Element:', error);
      throw error;
    }
  }

  // Call this after mounting the element to the DOM
  setElementMounted(mounted: boolean): void {
    this.isElementMounted.next(mounted);
  }

  async waitForElementMount(maxWaitTime: number = 5000): Promise<void> {
    const startTime = Date.now();
    
    while (!this.isElementMounted.getValue()) {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('Payment element mounting timeout');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async confirmPayment(returnUrl: string, metadata: any): Promise<{error?: any, success?: boolean}> {
    try {
      // Wait for element to be mounted
      await this.waitForElementMount();
      
      const stripe = await this.stripePromise;
      const clientSecret = this.paymentIntentClientSecret.getValue();
      const paymentType = this.currentPaymentType.getValue();
      const elements = this.elementsInstance.getValue();
      const paymentEl = this.paymentElement.getValue();
      
      if (!stripe || !clientSecret) {
        throw new Error('Stripe not initialized properly');
      }
      
      if (!elements) {
        throw new Error('Elements not initialized');
      }
      
      if (!paymentEl) {
        throw new Error('Payment element not initialized');
      }
      
      if (!this.isElementMounted.getValue()) {
        throw new Error('Payment element not mounted to DOM');
      }
      
      // For one-time payments
      if (paymentType === 'payment_intent') {
        // Confirm payment with the payment element
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: returnUrl,
            receipt_email: metadata.donorEmail
          },
          redirect: 'if_required'
        });
        
        if (error) {
          console.error('Stripe confirmation error:', error);
          return { error };
        }
        
        // If payment succeeded without redirect
        if (paymentIntent && paymentIntent.status === 'succeeded') {
          return { success: true };
        }
        
        // Payment requires redirect (will happen automatically)
        return { success: true };
      } else if (paymentType === 'subscription') {
        // For subscriptions, we need to confirm the setup
        const { error, setupIntent } = await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: returnUrl
          },
          redirect: 'if_required'
        });
        
        if (error) {
          return { error };
        }
        
        return { success: true };
      }
      
      return { error: { message: 'Unknown payment type' } };
      
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      return { error: { message: error.message || 'Payment failed' } };
    }
  }

  getPaymentElement(): Observable<StripePaymentElement | null> {
    return this.paymentElement.asObservable();
  }

  getElements(): Observable<StripeElements | null> {
    return this.elementsInstance.asObservable();
  }

  isElementReady(): Observable<boolean> {
    return this.isElementMounted.asObservable();
  }

  cleanup(): void {
    const paymentEl = this.paymentElement.getValue();
    if (paymentEl) {
      try {
        paymentEl.destroy();
      } catch (e) {
        console.warn('Error destroying payment element:', e);
      }
    }
    
    this.elementsInstance.next(null);
    this.paymentElement.next(null);
    this.paymentIntentClientSecret.next(null);
    this.currentPaymentType.next('payment_intent');
    this.isElementMounted.next(false);
  }

  private getStripeAppearance(): any {
    return {
        theme: 'flat',
        variables: {
          fontFamily: ' "Gill Sans", sans-serif',
          fontLineHeight: '1.5',
          borderRadius: '10px',
          colorBackground: '#F6F8FA',
          accessibleColorOnColorPrimary: '#262626'
        },
        rules: {
          '.Block': {
            backgroundColor: 'var(--colorBackground)',
            boxShadow: 'none',
            padding: '12px'
          },
          '.Input': {
            padding: '12px'
          },
          '.Input:disabled, .Input--invalid:disabled': {
            color: 'lightgray'
          },
          '.Tab': {
            padding: '10px 12px 8px 12px',
            border: 'none'
          },
          '.Tab:hover': {
            border: 'none',
            boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
          },
          '.Tab--selected, .Tab--selected:focus, .Tab--selected:hover': {
            border: 'none',
            backgroundColor: '#fff',
            boxShadow: '0 0 0 1.5px var(--colorPrimaryText), 0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
          },
          '.Label': {
            fontWeight: '500'
          }
        }
        
      }
    };
  

  createPaymentIntent(request: PaymentIntentRequest): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(`/stripe/create-payment-intent`, request)
      .pipe(
        timeout(30000),
        retry(2),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }
    
    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}