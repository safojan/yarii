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
import { RoleService } from 'src/app/_core/services/role.service';
import { UserService } from 'src/app/_core/services/user.service';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private endpoints: any = {
    signin: '/auth/login',
  };

  constructor(
    private httpClient: HttpClient,
    private navigationservice: NavigationService,
    private localstorageservice: LocalStorageService,
    private roleService: RoleService,  // Add RoleService here
    private userService: UserService,
    @Inject(NOTYF) private notyf: Notyf
  ) {}

  signIn(data: Signin): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(this.endpoints.signin, data).pipe(
      tap((response) => {
        if (response.token) {
          // Store token in local storage
          this.localstorageservice.put('token', response.token);
          //call the user service to get the user details
          this.userService.fetchUserDetails().subscribe();

          // Fetch the role before navigating
          this.roleService.fetchCurrentUserRole().subscribe(() => {
            this.navigationservice.navigateByRole();
            console.log("navigation by role is called");

            // Display success message
            this.notyf.dismissAll();
            this.notyf.success('You have successfully signed in.');
          });
        } else {
          this.notyf.error('Invalid credentials');
        }
      })
    );
  }

  signOut() {
    this.localstorageservice.remove('token');
    this.navigationservice.navigateByRole();
    this.notyf.dismissAll();
    this.notyf.success('You have successfully signed out.');
  }
}
