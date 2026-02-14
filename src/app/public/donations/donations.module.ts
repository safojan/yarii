import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DonationsRoutingModule } from './donations-routing.module';
import { DonationsComponent } from './donations.component';
import { ReactiveFormsModule } from '@angular/forms';
import { StripePaymentComponent } from 'src/app/shared/components/stripe-payment/stripe-payment.component'


@NgModule({
  declarations: [
    DonationsComponent
  ],
  imports: [
    CommonModule,
    DonationsRoutingModule,
    ReactiveFormsModule,
    StripePaymentComponent
  ]
})
export class DonationsModule { }
