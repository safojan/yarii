import { jwtDecode } from 'jwt-decode';

/**
 * JWT Helper utility functions
 */
export class JwtHelper {
  /**
   * Safely decode a JWT token
   */
  static decodeToken<T = any>(token: string): T | null {
    try {
      return jwtDecode<T>(token);
    } catch (error) {
      console.error('JWT decode error:', error);
      return null;
    }
  }

  /**
   * Check if a JWT token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) {
        return true;
      }
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get expiration date from JWT token
   */
  static getTokenExpirationDate(token: string): Date | null {
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) {
        return null;
      }
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get time remaining until token expires (in milliseconds)
   */
  static getTimeUntilExpiration(token: string): number {
    const expirationDate = this.getTokenExpirationDate(token);
    if (!expirationDate) {
      return 0;
    }
    return expirationDate.getTime() - Date.now();
  }

  /**
   * Extract user ID from JWT token
   */
  static getUserIdFromToken(token: string): string | null {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.sub || decoded.userId || decoded.id || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract user role from JWT token
   */
  static getUserRoleFromToken(token: string): string | null {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.role || decoded.roles || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is valid (not expired and properly formatted)
   */
  static isTokenValid(token: string): boolean {
    if (!token || token.trim() === '') {
      return false;
    }
    return !this.isTokenExpired(token);
  }

  /**
   * Get all claims from JWT token
   */
  static getTokenClaims(token: string): any {
    return this.decodeToken(token);
  }
}

