import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/public/auth/auth.service';
import { RoleService } from '../services/role.service';
import { Irole } from 'src/app/shared/interfaces/user.interface';

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
  ): Observable<boolean> {
    return this.roleService.getCurrentUserRole$().pipe(
      switchMap((role: Irole | null) => {
        // If role is already loaded, check it
        if (role) {
          const isAdmin = role.name === 'Admin';
          if (!isAdmin) {
            this.router.navigate(['/signin']);
          }
          return of(isAdmin);
        } else {
          // Fetch the role if not yet loaded
          return this.roleService.fetchCurrentUserRole().pipe(
            map((fetchedRole: Irole) => {
              const isAdmin = fetchedRole.name === 'Admin';
              if (!isAdmin) {
                this.router.navigate(['/signin']);
              }
              return isAdmin;
            }),
            catchError((err) => {
              console.error('Role fetch failed in guard:', err);
              this.router.navigate(['/signin']);
              return of(false);
            })
          );
        }
      })
    );
  }
}
