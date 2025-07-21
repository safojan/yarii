import { Component } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { DatetimeHelper } from 'src/app/_core/helpers/datetime.helper';
import { CommonService } from 'src/app/_core/services/common.service';
import { pageTransition } from 'src/app/shared/utils/animations';
import { PublicRoutes } from '../../public.routes';
import { AppRoutes } from 'src/app/app.routes';
import { AdminRoutes } from 'src/app/admin/admin.routes';
import { Images } from 'src/assets/data/images';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  animations: [pageTransition]
})
export class SignupComponent {
  readonly signupbannerImage: string = Images.auth.signup;
  isLoading: boolean = false;
  readonly currentYear: number = DatetimeHelper.currentYear;
  readonly publicRoutes = PublicRoutes;
  serverErrors: string[] = [];

  signUpForm = this.formBuilder.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  // Charity stats for right panel
  charityImpact = [
    { number: '2K+', label: 'New Volunteers This Year' },
    { number: '1748', label: 'Successful Campaigns' },
    { number: '4287', label: 'Children Helped' },
    { number: '1284', label: 'Communities Reached' }
  ];

  constructor(
    public commonService: CommonService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  // Custom validator for password confirmation
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onFormSubmitHandler = (event: SubmitEvent) => {
    event.preventDefault();
    
    if (this.signUpForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate([AppRoutes.Admin, AdminRoutes.Dashboard]);
    }, 3000);
  };

  private markFormGroupTouched() {
    Object.keys(this.signUpForm.controls).forEach(key => {
      const control = this.signUpForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signUpForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.signUpForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters`;
      }
    }
    
    // Check for password mismatch
    if (fieldName === 'confirmPassword' && this.signUpForm.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }
    
    return '';
  }
}