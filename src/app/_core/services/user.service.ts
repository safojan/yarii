import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IUser } from 'src/app/shared/interfaces/user.interface';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private user: IUser | null = null;

  private endpoints = {
    userDetails: '/users/current/details',  // API endpoint to fetch user details
  };

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private tokenService: TokenService
  ) {}

  // Fetch user details and return as an Observable
  fetchUserDetails(): Observable<IUser> {
    return this.httpClient.get<IUser>(this.endpoints.userDetails).pipe(
      retry(3),
      tap((user: IUser) => {
        this.user = user;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to fetch user details', error);
        return throwError(() => new Error('Failed to fetch user details'));
      })
    );
  }

  // Get the current user from the cache (with token validation)
  getCurrentUser(): IUser | null {
    // First check if token is valid
    if (!this.tokenService.isTokenValid()) {
      console.log("Token is invalid or expired, clearing user data");
      this.user = null;
      return null;
    }

    console.log("Current user:", this.user);
    return this.user;
  }

  // Set the current user
  setCurrentUser(user: IUser | null): void {
    this.user = user;
  }

  // Clear user data
  clearUserData(): void {
    this.user = null;
  }

  // Check if user is authenticated (has valid token and user data)
  isAuthenticated(): boolean {
    return this.tokenService.isTokenValid() && this.user !== null;
  }

  // Get user from token if available
  getUserFromToken(): any {
    return this.tokenService.getUserFromToken();
  }
}
