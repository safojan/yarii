import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Signin } from './signin/signin.model';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { AuthResponse } from './auth.response';
import { tap, catchError } from 'rxjs/operators';
import { IUser } from 'src/app/shared/interfaces/user.interface';
import { jwtDecode } from 'jwt-decode';
import { NavigationService } from 'src/app/_core/services/navigation.service';
import { LocalStorageService } from 'src/app/shared/services/localStorage.service';
import { TokenService } from 'src/app/_core/services/token.service';
import { Router } from '@angular/router';

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
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    validate: '/auth/validate'
  };

  // Authentication state observables
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<IUser | null>(null);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private httpClient: HttpClient,
    private navigationservice: NavigationService,
    private localstorageservice: LocalStorageService,
    private tokenService: TokenService,
    private roleService: RoleService,
    private userService: UserService,
    private router: Router,
    @Inject(NOTYF) private notyf: Notyf
  ) {
    // Initialize authentication state on service creation
    this.initializeAuthState();
  }

  /**
   * Initialize authentication state on service creation
   */
  private initializeAuthState(): void {
    const isValid = this.tokenService.isTokenValid();
    this.isAuthenticatedSubject.next(isValid);
    
    if (isValid) {
      // If token is valid, fetch user details
      this.userService.fetchUserDetails().subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
        },
        error: () => {
          this.handleAuthenticationError();
        }
      });
    }
  }

  /**
   * Sign in user with credentials
   */
  signIn(data: Signin): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(this.endpoints.signin, data).pipe(
      tap((response) => {
        if (response.token) {
          // Store token using TokenService
          this.tokenService.setToken(response.token);
          
          // Update authentication state
          this.isAuthenticatedSubject.next(true);
          
          // Fetch user details
          this.userService.fetchUserDetails().subscribe({
            next: (user) => {
              this.currentUserSubject.next(user);
              
              // Fetch the role before navigating
              this.roleService.fetchCurrentUserRole().subscribe({
                next: () => {
                  this.navigationservice.navigateByRole();
                  console.log("navigation by role is called");

                  // Display success message
                  this.notyf.dismissAll();
                  this.notyf.success('You have successfully signed in.');
                },
                error: (error) => {
                  console.error('Error fetching user role:', error);
                  this.notyf.error('Error loading user role');
                }
              });
            },
            error: (error) => {
              console.error('Error fetching user details:', error);
              this.notyf.error('Error loading user details');
            }
          });
        } else {
          this.notyf.error('Invalid credentials');
        }
      }),
      catchError((error) => {
        console.error('Sign in error:', error);
        this.notyf.error('Sign in failed. Please try again.');
        return throwError(() => error);
      })
    );
  }

  /**
   * Sign out user and clear all authentication data
   */
  signOut(): void {
    // Clear token and authentication data
    this.tokenService.clearAuthData();
    
    // Update authentication state
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    
    // Navigate to login
    this.router.navigate(['/signin']);
    
    // Display success message
    this.notyf.dismissAll();
    this.notyf.success('You have successfully signed out.');
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.tokenService.isTokenValid();
  }

  /**
   * Get current user
   */
  getCurrentUser(): IUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if current user has admin role
   */
  isAdmin(): boolean {
    return this.tokenService.isAdmin();
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role: string): boolean {
    return this.tokenService.hasRole(role);
  }

  /**
   * Handle authentication errors (token expired, invalid, etc.)
   */
  private handleAuthenticationError(): void {
    this.tokenService.clearAuthData();
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/signin']);
    this.notyf.error('Your session has expired. Please sign in again.');
  }

  /**
   * Validate current token
   */
  validateToken(): Observable<boolean> {
    if (!this.tokenService.hasToken()) {
      return throwError(() => new Error('No token found'));
    }

    return this.httpClient.post<any>(this.endpoints.validate, {}).pipe(
      tap(() => {
        this.isAuthenticatedSubject.next(true);
      }),
      catchError((error) => {
        this.handleAuthenticationError();
        return throwError(() => error);
      })
    );
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(this.endpoints.refresh, {}).pipe(
      tap((response) => {
        if (response.token) {
          this.tokenService.setToken(response.token);
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError((error) => {
        this.handleAuthenticationError();
        return throwError(() => error);
      })
    );
  }
}
