import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { TokenService } from '../services/token.service';
import { AuthService } from 'src/app/public/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private userService: UserService, 
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    console.log("AuthGuard: Checking authentication");
    
    // First check if token exists and is valid
    if (!this.tokenService.isTokenValid()) {
      console.log("AuthGuard: Token is invalid or expired");
      this.redirectToLogin(state.url);
      return false;
    }

    // Check if user data is available
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      console.log("AuthGuard: User is authenticated");
      return true;
    }

    // If token is valid but user data is not available, 
    // it might be during app initialization
    if (this.authService.isAuthenticated()) {
      console.log("AuthGuard: Token valid, allowing access");
      return true;
    }

    console.log("AuthGuard: User is not authenticated");
    this.redirectToLogin(state.url);
    return false;
  }

  private redirectToLogin(returnUrl: string): void {
    console.log("AuthGuard: Redirecting to login");
    this.router.navigate(['/signin'], {
      queryParams: { returnUrl },
    });
  }
}
