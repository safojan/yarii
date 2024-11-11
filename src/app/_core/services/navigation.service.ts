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

  // Wait for role to be fetched before navigating
  navigateByRole(): void {
    if (this.roleService.getCurrentUserRole()) {
      console.log("I am in navigate by role");
      this.navigateToRolePage(this.roleService.getCurrentUserRole());
    } else {
      // Fetch the role if not already available
      this.roleService.fetchCurrentUserRole().subscribe((role: Irole) => {
        this.navigateToRolePage(role);
      });
    }
  }

  private navigateToRolePage(role: Irole | null) {
    switch (role?.name) {
      case UserRole.Admin:
        console.log("I am admin");
        this.router.navigate(['/admin/dashboard']);
        break;
      case UserRole.Employee:
        this.router.navigate(['/employee/dashboard']);
        break;
      case UserRole.User:
        this.router.navigate(['/user/dashboard']);
        break;
      default:
        console.log("I am in default");
        this.router.navigate(['/']);
        break;
    }
  }
}
