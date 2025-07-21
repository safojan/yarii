import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from 'src/app/shared/interfaces/roles.interface';
import { RoleService } from './role.service';
import { Irole } from 'src/app/shared/interfaces/user.interface';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor(
    private router: Router,
    private roleService: RoleService,
    private commonService: CommonService
  ) {}

  navigateByRole(): void {
    this.roleService.getCurrentUserRole$().subscribe((role) => {
      if (role) {
        console.log("I am in navigate by role");
        this.navigateToRolePage(role);
      } else {
        // If the role is null, try fetching it
        this.roleService.fetchCurrentUserRole().subscribe((fetchedRole: Irole) => {
          this.navigateToRolePage(fetchedRole);
        });
      }
    });
  }

  private navigateToRolePage(role: Irole | null): void {
    if (!role || !role.name) {
      console.warn("No role or role name found. Redirecting to root.");
      this.router.navigate(['/']);
      return;
    }

    switch (role.name) {
      case UserRole.Admin:
        console.log("Navigating as Admin");
        this.router.navigate(['/admin/dashboard']);
        break;
      case UserRole.Employee:
        console.log("Navigating as Employee");
        this.router.navigate(['/employee/dashboard']);
        break;
      case UserRole.User:
        console.log("Navigating as User");
        this.router.navigate(['/user/dashboard']);
        break;
      default:
        console.warn("Unknown role: " + role.name);
        this.router.navigate(['/']);
        break;
    }
  }
}
