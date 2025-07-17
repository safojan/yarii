import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { UserService } from './user.service';
import { RoleService } from './role.service';
import { AuthService } from 'src/app/public/auth/auth.service';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
    private roleService: RoleService,
    private authService: AuthService
  ) {}

  /**
   * Initialize the application by checking for existing authentication
   * This runs when the app starts up
   */
  initializeApp(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('AppInitService: Initializing application...');
      
      // Check if we have a valid token
      if (!this.tokenService.isTokenValid()) {
        console.log('AppInitService: No valid token found, skipping initialization');
        resolve(true);
        return;
      }

      console.log('AppInitService: Valid token found, fetching user data...');
      
      // If we have a valid token, try to fetch user and role data
      const userDetails$ = this.userService.fetchUserDetails().pipe(
        catchError((error) => {
          console.error('AppInitService: Error fetching user details:', error);
          // Clear invalid token data
          this.tokenService.clearAuthData();
          return of(null);
        })
      );

      const userRole$ = this.roleService.fetchCurrentUserRole().pipe(
        catchError((error) => {
          console.error('AppInitService: Error fetching user role:', error);
          return of(null);
        })
      );

      // Execute both requests in parallel
      forkJoin({
        user: userDetails$,
        role: userRole$
      }).subscribe({
        next: (result) => {
          if (result.user) {
            console.log('AppInitService: User data loaded successfully');
          }
          if (result.role) {
            console.log('AppInitService: Role data loaded successfully');
          }
          resolve(true);
        },
        error: (error) => {
          console.error('AppInitService: Error during initialization:', error);
          // Clear any invalid data
          this.tokenService.clearAuthData();
          this.userService.clearUserData();
          this.roleService.clearRoleData();
          resolve(true);
        }
      });
    });
  }

  /**
   * Check authentication status and return user data if available
   */
  checkAuthenticationStatus(): Observable<any> {
    if (!this.tokenService.isTokenValid()) {
      return of({ authenticated: false, user: null, role: null });
    }

    const userDetails$ = this.userService.fetchUserDetails().pipe(
      catchError(() => of(null))
    );

    const userRole$ = this.roleService.fetchCurrentUserRole().pipe(
      catchError(() => of(null))
    );

    return forkJoin({
      user: userDetails$,
      role: userRole$
    }).pipe(
      tap((result) => {
        console.log('AppInitService: Authentication status checked', result);
      }),
      catchError((error) => {
        console.error('AppInitService: Error checking auth status:', error);
        return of({ authenticated: false, user: null, role: null });
      })
    );
  }

  /**
   * Restore user session from stored token
   */
  restoreUserSession(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.tokenService.hasToken()) {
        resolve(false);
        return;
      }

      if (!this.tokenService.isTokenValid()) {
        console.log('AppInitService: Token expired, clearing session');
        this.tokenService.clearAuthData();
        resolve(false);
        return;
      }

      // Token is valid, try to restore session
      this.initializeApp().then(() => {
        const user = this.userService.getCurrentUser();
        const isAuthenticated = user !== null;
        console.log('AppInitService: Session restore result:', isAuthenticated);
        resolve(isAuthenticated);
      });
    });
  }
}

