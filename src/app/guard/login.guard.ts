import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private cookie:CookieService,private router:Router){}

  redirect(flag: any): any{

    if (!flag) {
      this.router.navigate(["/login"]);
      return false;
    }

    return true;


  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      const token_access = localStorage.getItem('token');
      const validate = this.redirect(token_access);

      
    return validate;
  }
  
}
