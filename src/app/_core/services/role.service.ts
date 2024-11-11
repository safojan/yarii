//a role service for the app to manage roles
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';
import { Irole } from 'src/app/shared/interfaces/user.interface';
import { UserService } from './user.service';

@Injectable
({
  providedIn : 'root'
})
export class RoleService {
  private endpoints = {
    CurrentUserRole: '/users/current/role',
  };

  private currentUserRole: Irole | null = null;

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {}

  // Fetch and return the current user role as an Observable
  fetchCurrentUserRole(): Observable<Irole> {
    return this.http.get<Irole>(this.endpoints.CurrentUserRole).pipe(
      retry(3),
      tap((role: Irole) => {
        this.currentUserRole = role;
      }),
      catchError((error) => {
        console.error('Failed to fetch user role', error);
        return throwError(() => new Error('Failed to fetch user role'));
      })
    );
  }

  // Getter to retrieve the current role
  getCurrentUserRole(): Irole | null {
    console.log("Current user role:", this.currentUserRole);
    return this.currentUserRole;
  }
}
