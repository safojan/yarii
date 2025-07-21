import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    console.log('AuthGuard: Checking authentication...');
    
    // First check if there's a valid token
    if (!this.userService.isAuthenticated()) {
      console.log('AuthGuard: No valid token found - redirecting to signin');
      this.router.navigate(['/signin'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    // Always fetch fresh user data from server and wait for it to complete
    console.log('AuthGuard: Token found, fetching fresh user details from server...');
    
    return this.userService.fetchUserDetails().pipe(
      take(1), // Complete after first emission
      map(user => {
        if (user && user !== null) {
          console.log('AuthGuard: User successfully authenticated with fresh data!', user);
          console.log('AuthGuard: User role loaded:', user.role || 'No role found');
          return true;
        } else {
          console.log('AuthGuard: No user found - redirecting to signin');
          this.router.navigate(['/signin'], {
            queryParams: { returnUrl: state.url },
          });
          return false;
        }
      }),
      catchError(error => {
        console.log('AuthGuard: Error fetching user details - redirecting to signin:', error);
        this.userService.clearUserData();
        this.router.navigate(['/signin'], {
          queryParams: { returnUrl: state.url },
        });
        return of(false);
      })
    );
  }
}