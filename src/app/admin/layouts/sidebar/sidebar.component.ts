import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
  HostListener,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/_core/services/common.service';
import { AppRoutes } from 'src/app/app.routes';
import { AdminRoutes, ElementRoutes, SettingRoutes } from '../../admin.routes';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  sidebarIsCollapsed: boolean = false;
  readonly appRoutes = AppRoutes;
  readonly adminRoutes = AdminRoutes;
  readonly settingRoutes = SettingRoutes;
  readonly elementRoutes = ElementRoutes;
  private routerSubscription: Subscription = new Subscription();

  @Output() sidebarCollapsed = new EventEmitter<boolean>();

  constructor(
    public readonly commonServices: CommonService,
    private readonly elementRef: ElementRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
  }

  ngAfterViewInit(): void {
    this.subMenuToggleHandlerOnRouteChange();
    setTimeout(() => {
      this.subMenuToggleHandlerOnPageReload();
    }, 1);
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    const sidebar = this.elementRef.nativeElement.parentElement;
    
    if (window.innerWidth < 768) {
      // Mobile - hide sidebar by default
      this.sidebarIsCollapsed = true;
      sidebar?.setAttribute('aria-expanded', 'false');
    } else if (window.innerWidth >= 768 && window.innerWidth < 1024) {
      // Tablet - show collapsed sidebar
      this.sidebarIsCollapsed = true;
      sidebar?.setAttribute('aria-expanded', 'false');
    } else {
      // Desktop - show expanded sidebar
      this.sidebarIsCollapsed = false;
      sidebar?.setAttribute('aria-expanded', 'true');
    }
  }

  subMenuToggleHandler = (event: MouseEvent): void => {
    const elem = event.target as HTMLElement;
    const subMenu = elem.closest('a.sub-menu') as Element;

    if (subMenu.getAttribute('aria-expanded') == 'false')
      subMenu.setAttribute('aria-expanded', 'true');
    else subMenu.setAttribute('aria-expanded', 'false');
  };

  subMenuToggleHandlerOnPageReload = (): void => {
    const elem = this.elementRef.nativeElement
      .querySelector('[aria-current="page"]')
      ?.closest('ul.sub-menu-item') as Element;

    const subMenu = elem?.previousSibling as Element;

    subMenu?.setAttribute('aria-expanded', 'true');
  };

  subMenuToggleHandlerOnRouteChange = (): void => {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const subMenu =
          this.elementRef.nativeElement.querySelectorAll('.sub-menu');
        const elem = this.elementRef.nativeElement.querySelector(
          `[href='${event.url}']`
        ) as Element;

        if (elem?.closest('ul.sub-menu-item')) return;

        subMenu.forEach((subMenu: Element) => {
          if (subMenu.getAttribute('aria-expanded') == 'true')
            subMenu.setAttribute('aria-expanded', 'false');
        });

        // Close sidebar on mobile after navigation
        if (window.innerWidth < 768) {
          const sidebar = this.elementRef.nativeElement.parentElement;
          sidebar?.setAttribute('aria-expanded', 'false');
        }
      }
    });
  };
}