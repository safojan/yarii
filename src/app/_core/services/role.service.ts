//a role service for the app to manage roles
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';
import { Irole } from 'src/app/shared/interfaces/user.interface';
import { UserService } from './user.service';
import { TokenService } from './token.service';

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
    private userService: UserService,
    private tokenService: TokenService
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

  // Getter to retrieve the current role (with token validation)
  getCurrentUserRole(): Irole | null {
    // First check if token is valid
    if (!this.tokenService.isTokenValid()) {
      console.log("Token is invalid or expired, clearing role data");
      this.currentUserRole = null;
      return null;
    }

    console.log("Current user role:", this.currentUserRole);
    return this.currentUserRole;
  }

  // Set the current user role
  setCurrentUserRole(role: Irole | null): void {
    this.currentUserRole = role;
  }

  // Clear role data
  clearRoleData(): void {
    this.currentUserRole = null;
  }

  // Check if user has specific role
  hasRole(roleName: string): boolean {
    const role = this.getCurrentUserRole();
    return role?.name === roleName;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  // Get role from token if available
  getRoleFromToken(): string | null {
    return this.tokenService.getUserRoleFromToken();
  }
}
