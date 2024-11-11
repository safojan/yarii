import { Component, ElementRef, Renderer2 } from '@angular/core';
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

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    readonly userService : UserService,
    readonly roleService : RoleService,
    readonly authService: AuthService
  ) {}

  onClickProfile = () => {
    const profileDropdownList = this.element.nativeElement.querySelector(
      '.profile-dropdown-list'
    );
    this.renderer.setAttribute(profileDropdownList, 'aria-expanded', 'true');
  };

  onClickLogout = () => {
    this.authService.signOut();
  };
}
