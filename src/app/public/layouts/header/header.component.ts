import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonService } from 'src/app/_core/services/common.service';
import { AdminRoutes } from 'src/app/admin/admin.routes';
import { AppRoutes } from 'src/app/app.routes';
import { Images } from 'src/assets/data/images';
import { PublicRoutes } from '../../public.routes';
import { employeeRoutes } from 'src/app/employee/employee.routes';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/public/auth/auth.service';

@Component({
  selector: 'public-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class PublicHeaderComponent {
  public mainLogo: string = Images.mainLogo;
  readonly publicRoutes = PublicRoutes;
  readonly appRoutes = AppRoutes;
  readonly adminRoutes = AdminRoutes;
  readonly employeeRoute = employeeRoutes;
  readonly authServices = AuthService;
  constructor(public readonly commonService: CommonService) {}
  user: any;

  isMobileMenuOpen = false;

  //open close button in mobile mode
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
