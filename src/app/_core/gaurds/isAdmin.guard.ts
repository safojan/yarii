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

@Injectable({
  providedIn: 'root',
})
export class IsAdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private roleService: RoleService
    ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const currentUserRole = this.roleService.getCurrentUserRole();
    console.log("Current user role in admin gaurd !!:", currentUserRole);
    if (currentUserRole && currentUserRole.name === 'Admin') {
      return true;
    }

    // Navigate to the home page if not an admin
    this.router.navigate(['/signin']);
    return false;
  }
}
