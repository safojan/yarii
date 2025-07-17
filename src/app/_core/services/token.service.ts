import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { LocalStorageService } from '../../shared/services/localStorage.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'token';

  constructor(private localStorageService: LocalStorageService) {}

  /**
   * Get the stored token from localStorage
   */
  getToken(): string | null {
    return this.localStorageService.get(this.TOKEN_KEY);
  }

  /**
   * Store token in localStorage
   */
  setToken(token: string): void {
    this.localStorageService.put(this.TOKEN_KEY, token);
  }

  /**
   * Remove token from localStorage
   */
  removeToken(): void {
    this.localStorageService.remove(this.TOKEN_KEY);
  }

  /**
   * Check if a token exists
   */
  hasToken(): boolean {
    const token = this.getToken();
    return token !== null && token !== undefined && token.trim() !== '';
  }

  /**
   * Decode JWT token and return payload
   */
  decodeToken(token?: string): JwtPayload | null {
    try {
      const tokenToUse = token || this.getToken();
      if (!tokenToUse) {
        return null;
      }
      return jwtDecode<JwtPayload>(tokenToUse);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token?: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  /**
   * Check if token is valid (exists and not expired)
   */
  isTokenValid(token?: string): boolean {
    const tokenToCheck = token || this.getToken();
    if (!tokenToCheck) {
      return false;
    }
    return !this.isTokenExpired(tokenToCheck);
  }

  /**
   * Get token expiration date
   */
  getTokenExpirationDate(token?: string): Date | null {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return null;
    }
    return new Date(payload.exp * 1000);
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  getTimeUntilExpiration(token?: string): number {
    const expirationDate = this.getTokenExpirationDate(token);
    if (!expirationDate) {
      return 0;
    }
    return expirationDate.getTime() - Date.now();
  }

  /**
   * Get user information from token
   */
  getUserFromToken(token?: string): any {
    const payload = this.decodeToken(token);
    if (!payload) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      // Add other user properties as needed based on your JWT payload
    };
  }

  /**
   * Get user role from token
   */
  getUserRoleFromToken(token?: string): string | null {
    const payload = this.decodeToken(token);
    return payload?.role || null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string, token?: string): boolean {
    const userRole = this.getUserRoleFromToken(token);
    return userRole === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(token?: string): boolean {
    return this.hasRole('Admin', token);
  }

  /**
   * Clear all authentication data
   */
  clearAuthData(): void {
    this.removeToken();
    // Clear any other auth-related data from localStorage if needed
  }
}

