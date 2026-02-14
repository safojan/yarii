import { Component, ElementRef, HostListener, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  title = 'event-bud-frontend';

  constructor(private element: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // Set initial sidebar state based on screen size
    this.checkInitialSidebarState();
  }

  @HostListener('click', ['$event']) onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    // Handle profile dropdown
    const profileDropdown = this.element.nativeElement.querySelector('.profile-dropdown') as Element;
    if (profileDropdown && !profileDropdown.contains(target)) {
      const profileDropdownList = this.element.nativeElement.querySelector('.profile-dropdown-list');
      if (profileDropdownList) {
        this.renderer.setAttribute(profileDropdownList, 'aria-expanded', 'false');
      }
    }

    // Handle sidebar overlay click on mobile
    if (window.innerWidth < 768) {
      const sidebar = this.element.nativeElement.querySelector('.sidebar');
      const sidebarContainer = this.element.nativeElement.querySelector('.sidebar-container');
      const toggleButton = this.element.nativeElement.querySelector('.sidebar-toggle');
      
      if (sidebar?.getAttribute('aria-expanded') === 'true' && 
          !sidebarContainer?.contains(target) && 
          !toggleButton?.contains(target)) {
        sidebar.setAttribute('aria-expanded', 'false');
      }
    }
  }

  @HostListener('window:resize') onResize() {
    this.checkInitialSidebarState();
  }

  private checkInitialSidebarState() {
    const sidebar = this.element.nativeElement.querySelector('.sidebar');
    if (sidebar) {
      if (window.innerWidth < 768) {
        sidebar.setAttribute('aria-expanded', 'false');
      } else {
        sidebar.setAttribute('aria-expanded', 'true');
      }
    }
  }
}
