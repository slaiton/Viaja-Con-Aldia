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

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.sessionStore.isSessionValid()) {
      this.sessionStore.clearSession();
      return this.router.createUrlTree(['/login']);
    }

    if (this.sessionStore.isRegistroSession()) {
      return this.router.createUrlTree(['/registro']);
    }

    if (this.sessionStore.isActiveConductorSession()) {
      return true;
    }

    this.sessionStore.clearSession();
    return this.router.createUrlTree(['/login']);
  }
}
