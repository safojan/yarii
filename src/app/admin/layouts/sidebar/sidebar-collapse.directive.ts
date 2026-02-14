import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[sidebarCollapse]',
  standalone: true,
})
export class SidebarCollapseDirective {
  constructor(private elementRef: ElementRef) {}

  @HostListener('click') onClick() {
    const sidebar = document.querySelector('app-sidebar');
    const sidebarIsCollapsed = sidebar?.getAttribute('aria-expanded');

    if (sidebarIsCollapsed === 'false') {
      sidebar?.setAttribute('aria-expanded', 'true');
    } else {
      sidebar?.setAttribute('aria-expanded', 'false');
    }

    // Close all submenus when collapsing on mobile
    if (window.innerWidth < 768) {
      const subMenus = sidebar?.querySelectorAll('.sub-menu');
      subMenus?.forEach((subMenu: Element) => {
        if (subMenu.getAttribute('aria-expanded') == 'true')
          subMenu.setAttribute('aria-expanded', 'false');
      });
    }
  }
}