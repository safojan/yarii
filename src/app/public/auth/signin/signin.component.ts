import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DatetimeHelper } from 'src/app/_core/helpers/datetime.helper';
import { CommonService } from 'src/app/_core/services/common.service';
import { pageTransition } from 'src/app/shared/utils/animations';
import { Images } from 'src/assets/data/images';
import { AlertType } from '../../../shared/components/alert/alert.type';
import { PublicRoutes } from '../../public.routes';
import { AuthService } from '../auth.service';
import { AuthResponse } from '../auth.response';
import { Signin } from './signin.model';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
  animations: [pageTransition],
})
export class SigninComponent {
  readonly signinBannerImage: string = Images.bannerLogo;
  isLoading: boolean = false;
  readonly publicRoutes = PublicRoutes;
  readonly currentYear: number = DatetimeHelper.currentYear;
  serverErrors: string[] = [];
  
  signInForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private authservice: AuthService,
    public commonService: CommonService,
    private formBuilder: FormBuilder
  ) {}

  protected readonly AlertType = AlertType;

  protected onFormSubmitHandler = (event: SubmitEvent) => {
    event.preventDefault();
    
    if (this.signInForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    const signinData = this.signInForm.value as Signin;
    
    this.authservice.signIn(signinData).subscribe(
      (response: AuthResponse) => {
        console.log("the response: ", response);
        this.isLoading = false;
        localStorage.setItem('token', response.token);
      },
      (error) => {
        console.log("the error: ", error.message);
        this.isLoading = false;
        this.serverErrors = Array.isArray(error.message) ? error.message : [error.message];
      }
    );
  };

  protected onAlertCloseHandler = (e: any) => {
    this.serverErrors = [];
  };

  private markFormGroupTouched() {
    Object.keys(this.signInForm.controls).forEach(key => {
      const control = this.signInForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signInForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.signInForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return 'Password must be at least 6 characters';
      }
    }
    return '';
  }
}