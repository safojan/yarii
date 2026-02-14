// donation.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StripeService } from './stripe.service';
import { from } from 'rxjs';

export interface DonationData {
  amount: number;
  currency?: string;
  donationType: 'one-time' | 'recurring';
  frequency?: 'monthly' | 'quarterly' | 'annually';
  donorName?: string;
  donorEmail?: string;
  donorMessage?: string;
  anonymous: boolean;
  paymentMethod?: string;
  donationId?: string;
  paymentIntentId?: string;
  createdAt?: Date;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private currentStep = new BehaviorSubject<number>(1);
  private donationData = new BehaviorSubject<DonationData>({
    amount: 25,
    donationType: 'one-time',
    anonymous: false,
    currency: 'usd'
  });
  
  private processingDonation = new BehaviorSubject<boolean>(false);
  private apiUrl = ``;

  constructor(
    private http: HttpClient,
    private stripeService: StripeService
  ) {
    // Subscribe to currency changes
    this.stripeService.getUserCurrency().subscribe(currency => {
      this.updateDonationData({ currency });
    });
  }

  getCurrentStep(): Observable<number> {
    return this.currentStep.asObservable();
  }

  setCurrentStep(step: number): void {
    this.currentStep.next(step);
  }

  nextStep(): void {
    const currentStep = this.currentStep.getValue();
    if (currentStep < 4) {
      this.currentStep.next(currentStep + 1);
      
      // Initialize Stripe when moving to payment step
      if (currentStep === 2) {
        const data = this.donationData.getValue();
        this.initializeStripePayment(data);
      }
    }
  }

  previousStep(): void {
    const currentStep = this.currentStep.getValue();
    if (currentStep > 1) {
      this.currentStep.next(currentStep - 1);
    }
  }

  getDonationData(): Observable<DonationData> {
    return this.donationData.asObservable();
  }

  updateDonationData(data: Partial<DonationData>): void {
    this.donationData.next({
      ...this.donationData.getValue(),
      ...data
    });
  }

  resetDonation(): void {
    this.donationData.next({
      amount: 25,
      donationType: 'one-time',
      anonymous: false,
      currency: 'usd'
    });
    this.currentStep.next(1);
    this.stripeService.cleanup();
  }

  private initializeStripePayment(data: DonationData): void {
    this.processingDonation.next(true);
    
    const donorInfo = {
      name: data.donorName || '',
      email: data.donorEmail || '',
      message: data.donorMessage,
      anonymous: data.anonymous
    };
    
    this.stripeService.initializePaymentElement(
      data.amount,
      data.donationType,
      data.frequency,
      donorInfo
    ).then(() => {
      this.processingDonation.next(false);
    }).catch(error => {
      console.error('Failed to initialize Stripe payment:', error);
      this.processingDonation.next(false);
      // You might want to show an error message to the user here
    });
  }

  processDonation(): Observable<any> {
    this.processingDonation.next(true);
    
    const data = this.donationData.getValue();
    const returnUrl = `${window.location.origin}/donation-success`;
    
    // Confirm the payment with Stripe
    return from(this.stripeService.confirmPayment(returnUrl, {
      donorName: data.donorName,
      donorEmail: data.donorEmail,
      donorMessage: data.donorMessage,
      anonymous: data.anonymous
    })).pipe(
      map(result => {
        this.processingDonation.next(false);
        
        if (result.error) {
          throw new Error(result.error.message || 'Payment failed');
        }
        
        return {
          success: true
        };
      }),
      catchError(error => {
        this.processingDonation.next(false);
        return throwError(() => error);
      })
    );
  }

  isProcessing(): Observable<boolean> {
    return this.processingDonation.asObservable();
  }
  
  // Get donation history for a user
  getDonationHistory(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/donations/history`, {
      params: { email }
    }).pipe(
      catchError(error => {
        console.error('Error fetching donation history:', error);
        return of([]);
      })
    );
  }
  
  // Cancel a recurring donation
  cancelRecurringDonation(subscriptionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/donations/cancel-recurring`, {
      subscriptionId
    }).pipe(
      catchError(error => {
        console.error('Error canceling subscription:', error);
        return throwError(() => new Error('Failed to cancel subscription'));
      })
    );
  }
}