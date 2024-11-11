import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IUser } from 'src/app/shared/interfaces/user.interface';

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
    private router: Router
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

  // Get the current user from the cache
  getCurrentUser(): IUser | null {
    console.log("Current user:", this.user);
    return this.user;
  }

  // Ensure the user details are fetched when this service is initialized
}
