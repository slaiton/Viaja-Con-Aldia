import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SessionStore } from '@core/session/session.store';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private readonly router: Router,
    private readonly sessionStore: SessionStore
  ) {}

  private redirect(isValid: boolean): boolean {
    if (!isValid) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isValid = this.sessionStore.isSessionValid();
    return this.redirect(isValid);
  }
}
