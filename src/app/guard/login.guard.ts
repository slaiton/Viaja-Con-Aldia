import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from '@core/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private storage: StorageService, private router: Router) { }

  /**
   * Un JWT expirado o corrupto no debe dejar pasar al guard. Si el token no
   * es un JWT (dos puntos, payload base64url con `exp`) se deja pasar tal
   * cual para no romper sesiones existentes con tokens de otro formato.
   */
  private isExpired(token: string): boolean {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (!payload.exp) {
        return false;
      }
      return Date.now() >= payload.exp * 1000;
    } catch {
      return false;
    }
  }

  redirect(flag: boolean): boolean {
    if (!flag) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const token = this.storage.get<string>('token');
    const isValid = !!token && !this.isExpired(token);

    if (!isValid && token) {
      this.storage.remove('token');
    }

    return this.redirect(isValid);
  }

}
