import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { AuthService } from '../public/auth/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  title = 'event-bud-frontend';

  constructor(
    private element: ElementRef, 
    private rendered: Renderer2,
    private authService: AuthService
  ) { }

  @HostListener('click', ['$event.target']) onClick(e: Element) {
    const profileDropdown = this.element.nativeElement.querySelector('.profile-dropdown') as Element;

    if (!profileDropdown.contains(e)) {
      const profileDropdownList = this.element.nativeElement.querySelector('.profile-dropdown-list');
      this.rendered.setAttribute(profileDropdownList, 'aria-expanded', 'false')
    }
  }

  /**
   * Handle user logout
   */
  logout(): void {
    this.authService.signOut();
  }
}
