import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/public/auth/auth.service';
import { RoleService } from '../services/role.service';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root',
})
export class IsAdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private roleService: RoleService,
    private tokenService: TokenService
    ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    console.log("IsAdminGuard: Checking admin access");
    
    // First check if user is authenticated
    if (!this.tokenService.isTokenValid()) {
      console.log("IsAdminGuard: Token is invalid, redirecting to login");
      this.router.navigate(['/signin']);
      return false;
    }

    // Check role from token first (faster)
    const roleFromToken = this.tokenService.getUserRoleFromToken();
    if (roleFromToken === 'Admin') {
      console.log("IsAdminGuard: Admin role confirmed from token");
      return true;
    }

    // Fallback to role service
    const currentUserRole = this.roleService.getCurrentUserRole();
    console.log("IsAdminGuard: Current user role:", currentUserRole);
    
    if (currentUserRole && currentUserRole.name === 'Admin') {
      console.log("IsAdminGuard: Admin role confirmed from role service");
      return true;
    }

    // Check if AuthService has admin check
    if (this.authService.isAdmin()) {
      console.log("IsAdminGuard: Admin role confirmed from auth service");
      return true;
    }

    console.log("IsAdminGuard: User is not admin, redirecting to login");
    this.router.navigate(['/signin']);
    return false;
  }
}
