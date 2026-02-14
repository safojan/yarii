// src/app/donations/donations.component.ts
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DonationService, DonationData } from 'src/app/shared/services/donation.service';
import { StripeService } from 'src/app/shared/services/stripe.service';
import { Subscription } from 'rxjs';
import { StripePaymentComponent } from 'src/app/shared/components/stripe-payment/stripe-payment.component';

@Component({
  selector: 'app-donations',
  templateUrl: './donations.component.html',
  styleUrls: ['./donations.component.css']
})
export class DonationsComponent implements OnInit, OnDestroy {
  @ViewChild(StripePaymentComponent) stripePaymentComponent?: StripePaymentComponent;
  
  currentStep = 1;
  donationForm: FormGroup;
  submitting = false;
  donationSuccess = false;
  donationError = false;
  errorMessage = '';
  isPaymentElementReady = false;
  
  // Suggested donation amounts
  suggestedAmounts = [10, 25, 50, 100, 250];
  
  private subscriptions: Subscription[] = [];
  private stripeInitialized = false;

  constructor(
    private fb: FormBuilder,
    private donationService: DonationService,
    private stripeService: StripeService
  ) {
    this.donationForm = this.fb.group({
      // Step 1
      amount: [25, [Validators.required, Validators.min(1)]],
      donationType: ['one-time', Validators.required],
      frequency: ['monthly'],
      
      // Step 2
      donorName: ['', Validators.required],
      donorEmail: ['', [Validators.required, Validators.email]],
      donorMessage: [''],
      anonymous: [false],
      
      // Step 3 (will be set when payment method is selected)
      paymentMethod: ['card']
    });
  }

  ngOnInit(): void {
    // Track current step
    this.subscriptions.push(
      this.donationService.getCurrentStep().subscribe(step => {
        this.currentStep = step;
        
        // Initialize Stripe when reaching payment step
        if (step === 3 && !this.stripeInitialized) {
          this.initializeStripePayment();
        }
      })
    );
    
    // Load donation data into form
    this.subscriptions.push(
      this.donationService.getDonationData().subscribe(data => {
        Object.keys(data).forEach(key => {
          if (this.donationForm.get(key)) {
            this.donationForm.get(key)?.setValue(data[key as keyof DonationData]);
          }
        });
      })
    );
    
    // Track processing state
    this.subscriptions.push(
      this.donationService.isProcessing().subscribe(processing => {
        this.submitting = processing;
      })
    );
    
    // Track Stripe element ready state
    this.subscriptions.push(
      this.stripeService.isElementReady().subscribe(ready => {
        this.isPaymentElementReady = ready;
      })
    );
    
    // Handle donation type changes
    this.donationForm.get('donationType')?.valueChanges.subscribe(type => {
      const frequencyControl = this.donationForm.get('frequency');
      if (type === 'recurring') {
        frequencyControl?.setValidators([Validators.required]);
      } else {
        frequencyControl?.clearValidators();
      }
      frequencyControl?.updateValueAndValidity();
    });
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.stripeService.cleanup();
  }
  
  // Initialize Stripe Payment Element
  private async initializeStripePayment(): Promise<void> {
    try {
      const amount = this.donationForm.get('amount')?.value || 0;
      const donationType = this.donationForm.get('donationType')?.value;
      const frequency = this.donationForm.get('frequency')?.value;
      const donorInfo = {
        name: this.donationForm.get('donorName')?.value,
        email: this.donationForm.get('donorEmail')?.value,
        message: this.donationForm.get('donorMessage')?.value,
        anonymous: this.donationForm.get('anonymous')?.value
      };
      
      await this.stripeService.initializePaymentElement(
        amount,
        donationType,
        frequency,
        donorInfo
      );
      
      this.stripeInitialized = true;
    } catch (error: any) {
      console.error('Failed to initialize Stripe:', error);
      this.errorMessage = 'Failed to initialize payment. Please try again.';
      this.donationError = true;
    }
  }
  
  // Handle Stripe element ready event
  onStripeElementReady(ready: boolean): void {
    this.isPaymentElementReady = ready;
    if (ready) {
      console.log('Payment element is ready for use');
    }
  }

  onStripeElementChange(event: {complete: boolean, error?: any}): void {
    if (event.complete) {
      // Payment details are complete, enable submit button
      console.log('Payment details complete');
    }
    if (event.error) {
      this.errorMessage = event.error.message;
    }
  }
  
  // Handle Stripe element error
  onStripeElementError(error: string): void {
    this.errorMessage = error;
  }
  
  // Form navigation
  async nextStep(): Promise<void> {
    this.updateDonationData();
    
    if (this.validateCurrentStep()) {
      // Initialize Stripe when moving to payment step
      if (this.currentStep === 2 && !this.stripeInitialized) {
        await this.initializeStripePayment();
      }
      this.donationService.nextStep();
    }
  }
  
  previousStep(): void {
    this.donationService.previousStep();
  }
  
  // Amount selection
  selectAmount(amount: number): void {
    this.donationForm.get('amount')?.setValue(amount);
  }
  
  // Data management
  updateDonationData(): void {
    let data: Partial<DonationData> = {};
    
    switch (this.currentStep) {
      case 1:
        data = {
          amount: this.donationForm.get('amount')?.value,
          donationType: this.donationForm.get('donationType')?.value,
          frequency: this.donationForm.get('frequency')?.value
        };
        break;
      case 2:
        data = {
          donorName: this.donationForm.get('donorName')?.value,
          donorEmail: this.donationForm.get('donorEmail')?.value,
          donorMessage: this.donationForm.get('donorMessage')?.value,
          anonymous: this.donationForm.get('anonymous')?.value
        };
        break;
      case 3:
        data = {
          paymentMethod: this.donationForm.get('paymentMethod')?.value || 'card'
        };
        break;
    }
    
    this.donationService.updateDonationData(data);
  }
  
  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return (this.donationForm.get('amount')?.valid ?? false) && 
               (this.donationForm.get('donationType')?.valid ?? false) &&
               (
                 this.donationForm.get('donationType')?.value !== 'recurring' || 
                 (this.donationForm.get('frequency')?.valid ?? false)
               );
      case 2:
        return (this.donationForm.get('donorName')?.valid ?? false) && 
               (this.donationForm.get('donorEmail')?.valid ?? false);
      case 3:
        return this.isPaymentElementReady;
      default:
        return true;
    }
  }
  
  // Submit donation
  async submitDonation(): Promise<void> {
    if (!this.donationForm.valid) {
      this.errorMessage = 'Please complete all required fields';
      return;
    }

    if (!this.isPaymentElementReady) {
      this.errorMessage = 'Payment form is not ready. Please wait a moment and try again.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    
    try {
      // Update final donation data
      this.updateDonationData();
      
      // Process the donation through Stripe
      const returnUrl = `${window.location.origin}/donations/success`;
      const metadata = {
        donorName: this.donationForm.get('donorName')?.value,
        donorEmail: this.donationForm.get('donorEmail')?.value
      };
      
      const result = await this.stripeService.confirmPayment(returnUrl, metadata);
      
      if (result.error) {
        this.donationError = true;
        this.errorMessage = result.error.message || 'Payment failed. Please try again.';
        this.submitting = false;
      } else if (result.success) {
        // Save donation to backend
        this.donationService.processDonation().subscribe({
          next: (response) => {
            this.donationSuccess = true;
            this.submitting = false;
          },
          error: (error) => {
            // Payment succeeded but failed to save to backend
            // Still show success but log the error
            console.error('Failed to save donation record:', error);
            this.donationSuccess = true;
            this.submitting = false;
          }
        });
      }
    } catch (error: any) {
      this.donationError = true;
      this.errorMessage = error.message || 'We couldn\'t process your donation. Please try again.';
      this.submitting = false;
      console.error('Donation error:', error);
    }
  }
  
  // Reset after error
  tryAgain(): void {
    this.donationError = false;
    this.errorMessage = '';
    this.stripeInitialized = false;
    // Re-initialize Stripe if on payment step
    if (this.currentStep === 3) {
      this.initializeStripePayment();
    }
  }
  
  // Start new donation after success
  donateAgain(): void {
    this.donationSuccess = false;
    this.stripeInitialized = false;
    this.stripeService.cleanup();
    this.donationService.resetDonation();
    this.donationForm.reset({
      amount: 25,
      donationType: 'one-time',
      frequency: 'monthly',
      anonymous: false,
      paymentMethod: 'card'
    });
  }
}