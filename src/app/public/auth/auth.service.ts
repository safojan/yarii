import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Signin } from './signin/signin.model';
import { Observable } from 'rxjs';
import { AuthResponse } from './auth.response';
import { tap } from 'rxjs/operators';
import { IUser } from 'src/app/shared/interfaces/user.interface';
import { jwtDecode } from 'jwt-decode';
// import { UserRole } from 'src/app/shared/interfaces/roles.interface';
import { NavigationService } from 'src/app/_core/services/navigation.service';
import { LocalStorageService } from 'src/app/shared/services/localStorage.service';

//imported for test
import { NOTYF } from '../../shared/utils/notyf.token';
import { Notyf } from 'notyf';

@Injectable({
  providedIn: 'root',
})

//R3InjectorError(AppModule)[AuthService -> Notyf -> Notyf]: NullInjectorError: No provider for Notyf
export class AuthService {
  private endpoints: any = {
    signin: 'login',
    signinwithGoogle: 'login/google',
    signInwithToken: 'login/token',
  };

  constructor(
    private httpClient: HttpClient,
    private navigationservice: NavigationService,
    private localstorageservice: LocalStorageService,
    @Inject(NOTYF) private notyf: Notyf
  ) {}

  signIn(data: Signin): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(this.endpoints.signin, data).pipe(
      tap((response) => {
        this.localstorageservice.put('token', response.token);
        const user: IUser = this.currentUser() as IUser;
        const role = user.role;
        this.navigationservice.navigateByRole(role);
        this.notyf.dismissAll();
        this.notyf.success('You have successfully signed in.');
      })
    );
  }

  signOut() {
    this.localstorageservice.remove('token');
    this.navigationservice.navigateByRole(null);
    this.notyf.dismissAll();
    this.notyf.success('You have successfully signed out.');
  }

  currentUser(): IUser | null {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    } else {
      //decode using decoder
      const user = jwtDecode(token) as IUser;
      return user;
    }
  }
  signInwithToken() {
    //sign in with token
  }
}
