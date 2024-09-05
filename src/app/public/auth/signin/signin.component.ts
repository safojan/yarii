import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
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
    username: [''],
    password: [''],
  });

  constructor(
    private authservice: AuthService,
    public commonService: CommonService,
    private formBuilder: FormBuilder
  ) {}
  protected readonly AlertType = AlertType;

  protected onFormSubmitHandler = (event: SubmitEvent) => {
    event.preventDefault();
    this.isLoading = true;
    const signinData = this.signInForm.value as Signin;
    this.authservice.signIn(signinData).subscribe(
      (response: AuthResponse) => {
        this.isLoading = false;
        localStorage.setItem('token', response.token);
      },
      (error) => {
        this.isLoading = false;
        this.serverErrors = error.error.errors;
      }
    );
  };

  protected onAlertCloseHandler = (e: any) => {
    this.serverErrors = [];
  };
}
