import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    if (this.userService.getCurrentUser()) {
      return true;
    }
    console.log("I am in auth gaurd");

    // Navigate to the login page if not authenticated
    this.router.navigate(['/signin'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }
}
