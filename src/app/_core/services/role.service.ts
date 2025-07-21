// src/app/core/services/role.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, retry } from 'rxjs/operators';
import { Irole } from 'src/app/shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly endpoints = {
    CurrentUserRole: '/users/current/role',
  };

  // BehaviorSubject to store and emit the current role
  private currentUserRole$ = new BehaviorSubject<Irole | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Fetch the current user role from the backend and store it in BehaviorSubject.
   */
  fetchCurrentUserRole(): Observable<Irole> {
    return this.http.get<Irole>(this.endpoints.CurrentUserRole).pipe(
      retry(3), // Retry the request up to 3 times
      tap((role: Irole) => {
        console.log('Fetched user role:', role);
        this.currentUserRole$.next(role); // Update BehaviorSubject
      }),
      catchError((error) => {
        console.error('Failed to fetch user role', error);
        return throwError(() => new Error('Failed to fetch user role'));
      })
    );
  }

  /**
   * Returns the current user role as an observable.
   * Subscribe to this to get the latest value.
   */
  getCurrentUserRole$(): Observable<Irole | null> {
    return this.currentUserRole$.asObservable();
  }

  /**
   * Synchronously get the current role value (not recommended for async flows).
   */
  getCurrentUserRoleValue(): Irole | null {
    const role = this.currentUserRole$.value;
    console.log('Current user role (sync):', role);
    return role;
  }
}
