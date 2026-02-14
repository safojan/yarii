import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { RoleService } from 'src/app/_core/services/role.service';
import { UserService } from 'src/app/_core/services/user.service';
import { AuthService } from 'src/app/public/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  isOpen: boolean = false;
  currentTime: Date = new Date();

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    readonly userService: UserService,
    readonly roleService: RoleService,
    readonly authService: AuthService
  ) {
    // Update time every minute
    setInterval(() => {
      this.currentTime = new Date();
    }, 60000);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const profileDropdown = this.element.nativeElement.querySelector('.profile-dropdown');
    const clickedInside = profileDropdown?.contains(event.target);
    
    if (!clickedInside) {
      const profileDropdownList = this.element.nativeElement.querySelector('.profile-dropdown-list');
      this.renderer.setAttribute(profileDropdownList, 'aria-expanded', 'false');
    }
  }

  onClickProfile = () => {
    const profileDropdownList = this.element.nativeElement.querySelector('.profile-dropdown-list');
    const isExpanded = profileDropdownList.getAttribute('aria-expanded') === 'true';
    this.renderer.setAttribute(profileDropdownList, 'aria-expanded', (!isExpanded).toString());
  };

  onClickLogout = () => {
    this.authService.signOut();
  };

  getGreeting(): string {
    const hour = this.currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  get displayName(): string {
    const name = this.userService.getCurrentUser()?.name?.split(' ')[0];
    return name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : 'User';
  }
}