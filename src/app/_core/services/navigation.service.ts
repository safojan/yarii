import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from 'src/app/shared/interfaces/roles.interface';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor(private router: Router) {}

  navigateByRole(role: any) {
    switch (role) {
      case UserRole.Admin:
        this.router.navigate(['/admin/dashboard']);
        break;
      case UserRole.Employee:
        this.router.navigate(['/employee/dashboard']);
        break;
      case UserRole.User:
        this.router.navigate(['/user/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }
}
