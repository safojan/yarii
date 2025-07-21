import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { retry, catchError, tap, map, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IUser } from 'src/app/shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private user: IUser | null = null;
  private userSubject = new BehaviorSubject<IUser | null>(null);
  public user$ = this.userSubject.asObservable();

  private endpoints = {
    userDetails: '/users/current/details',  // API endpoint to fetch user details
  };

  constructor(
    private httpClient: HttpClient,
    private router: Router
  ) {
    // Initialize user on service creation if token exists
    this.initializeUser();
  }

  // Check if user has a valid authentication token
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    return !!token && !this.isTokenExpired(token);
  }

  // Get authentication token from storage
  private getAuthToken(): string | null {
    // Adjust this based on how you store your auth token
    return localStorage.getItem('token') || 
           localStorage.getItem('authToken') || 
           localStorage.getItem('accessToken');
  }

  // Check if token is expired (implement based on your token format)
  private isTokenExpired(token: string): boolean {
    try {
      // For JWT tokens, you would decode and check expiration
      // This is a basic implementation - adjust based on your token format
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Consider expired if we can't parse it
    }
  }

  // Set authentication token
  setAuthToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Remove authentication token
  removeAuthToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
  }

  // Fetch user details and return as an Observable (always fetches from server)
  fetchUserDetails(): Observable<IUser> {
    if (!this.isAuthenticated()) {
      console.log('UserService: No valid token found');
      this.clearUserData();
      return throwError(() => new Error('No valid authentication token'));
    }

    console.log('UserService: Fetching fresh user details from server...');
    
    return this.httpClient.get<IUser>(this.endpoints.userDetails).pipe(
      retry(2), // Reduced retries for better UX
      tap((user: IUser) => {
        this.user = user;
        this.userSubject.next(user);
        console.log('UserService: Fresh user details fetched and cached:', user);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('UserService: Failed to fetch user details', error);
        
        // If unauthorized, clear user data
        if (error.status === 401 || error.status === 403) {
          console.log('UserService: Unauthorized - clearing user data');
          this.clearUserData();
        }
        
        return throwError(() => new Error('Failed to fetch user details'));
      })
    );
  }

  // Get the current user from the cache
  getCurrentUser(): IUser | null {
    return this.user;
  }

  // Get current user as Observable (reactive)
  getCurrentUser$(): Observable<IUser | null> {
    return this.userSubject.asObservable();
  }

  // Wait for user to be loaded and return it
  waitForUser(): Observable<IUser | null> {
    // If user is already loaded, return it immediately
    if (this.user) {
      return of(this.user);
    }
    
    // Otherwise wait for the user to be loaded
    return this.userSubject.asObservable().pipe(
      filter(user => user !== null), // Wait until user is not null
      take(1) // Take only the first non-null value
    );
  }

  // Get user role (synchronous - may return null if user not loaded)
  getCurrentUserRole(): any {
    const role = this.user?.role || null;
    console.log('UserService: getCurrentUserRole() returning:', role);
    return role;
  }

  // Get user role as Observable (reactive)
  getCurrentUserRole$(): Observable<any> {
    return this.userSubject.pipe(
      map(user => user?.role || null)
    );
  }

  // Wait for user role to be available
  waitForUserRole(): Observable<any> {
    return this.waitForUser().pipe(
      map(user => user?.role || null)
    );
  }

  // Set user data (typically called after login)
  setUser(user: IUser): void {
    this.user = user;
    this.userSubject.next(user);
  }

  // Clear user data (for logout)
  clearUserData(): void {
    this.user = null;
    this.userSubject.next(null);
    this.removeAuthToken();
  }

  // Logout user
  logout(): void {
    this.clearUserData();
    this.router.navigate(['/signin']);
  }

  // Initialize user data when service starts (optional, since AuthGuard will handle fetching)
  initializeUser(): void {
    if (this.isAuthenticated()) {
      console.log('UserService: Token found during initialization');
      // Don't fetch here anymore since AuthGuard will always fetch fresh data
      // Just log that we have a valid token
    } else {
      console.log('UserService: No valid token found during initialization');
      this.clearUserData();
    }
  }

  // Check if user data is loaded
  isUserLoaded(): boolean {
    return this.user !== null;
  }
}