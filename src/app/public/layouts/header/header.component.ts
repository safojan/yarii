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
  isScrolled = false;

  // Navigation items for charity website
  navigationItems = [
    { name: 'Home', route: this.publicRoutes.Home },
    // { name: 'About Us', route: '#about' },
    // { name: 'Causes', route: '#causes' },
    // { name: 'Events', route: '#events' },
    // { name: 'Pages', route: '#pages' },
    // { name: 'News', route: '#news' },
    // { name: 'Contact', route: '#contact' }
  ];

  // Social media links
  socialLinks = [
    { name: 'Facebook', icon: '📘', url: '#' },
    { name: 'Twitter', icon: '🐦', url: '#' },
    { name: 'Instagram', icon: '📷', url: '#' },
    { name: 'LinkedIn', icon: '💼', url: '#' }
  ];

  // Contact information
  contactInfo = {
    phone: '+92 348 41 23 561',
    fax: 'Fax',
    email: 'info@jagowelfare.org'
  };

  // Toggle mobile menu
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Handle scroll effect
  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled = window.scrollY > 50;
      });
    }
  }
}