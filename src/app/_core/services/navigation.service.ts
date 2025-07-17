import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from 'src/app/shared/interfaces/roles.interface';
import { RoleService } from './role.service';
import { Irole } from 'src/app/shared/interfaces/user.interface';
import { CommonService } from './common.service';
import { TokenService } from './token.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {

  constructor(
    private router: Router,
    private roleService: RoleService,
    private commonService: CommonService,
    private tokenService: TokenService,
    private userService: UserService
  ) {}

  // Wait for role to be fetched before navigating
  navigateByRole(): void {
    console.log("NavigationService: Starting navigation by role");
    
    // First check if user is authenticated
    if (!this.tokenService.isTokenValid()) {
      console.log("NavigationService: No valid token, redirecting to signin");
      this.router.navigate(['/signin']);
      return;
    }

    // Try to get role from token first (faster)
    const roleFromToken = this.tokenService.getUserRoleFromToken();
    if (roleFromToken) {
      console.log("NavigationService: Got role from token:", roleFromToken);
      this.navigateToRolePageByName(roleFromToken);
      return;
    }

    // Fallback to role service
    const currentRole = this.roleService.getCurrentUserRole();
    if (currentRole) {
      console.log("NavigationService: Got role from service:", currentRole);
      this.navigateToRolePage(currentRole);
    } else {
      // Fetch the role if not already available
      console.log("NavigationService: Fetching role from server");
      this.roleService.fetchCurrentUserRole().subscribe({
        next: (role: Irole) => {
          this.navigateToRolePage(role);
        },
        error: (error) => {
          console.error("NavigationService: Error fetching role:", error);
          this.router.navigate(['/signin']);
        }
      });
    }
  }

  private navigateToRolePage(role: Irole | null) {
    this.navigateToRolePageByName(role?.name || '');
  }

  private navigateToRolePageByName(roleName: string) {
    console.log("NavigationService: Navigating to role page for:", roleName);
    
    switch (roleName) {
      case UserRole.Admin:
      case 'Admin':
        console.log("NavigationService: Navigating to admin dashboard");
        this.router.navigate(['/admin/dashboard']);
        break;
      case UserRole.Employee:
      case 'Employee':
        console.log("NavigationService: Navigating to employee dashboard");
        this.router.navigate(['/employee/dashboard']);
        break;
      case UserRole.User:
      case 'User':
        console.log("NavigationService: Navigating to user dashboard");
        this.router.navigate(['/user/dashboard']);
        break;
      default:
        console.log("NavigationService: Unknown role, navigating to default");
        this.router.navigate(['/signin']);
        break;
    }
  }

  /**
   * Navigate to login page
   */
  navigateToLogin(): void {
    this.router.navigate(['/signin']);
  }

  /**
   * Check if user is authenticated and navigate accordingly
   */
  navigateBasedOnAuth(): void {
    if (this.tokenService.isTokenValid()) {
      this.navigateByRole();
    } else {
      this.navigateToLogin();
    }
  }
}
