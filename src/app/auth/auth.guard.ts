import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
      const isAuth = this.authService.getIsAuth();
      if(!isAuth) {
        this.router.navigate(['/auth/login'])
      }
      return isAuth;
  }

}

//* Bu dosyadaki amaç --> login yapmadan post create etmek ve edit etme hususunu engellemek
//! we dont want to access edit or new post props. So we use route guard ts. For attach we must add to app-routing module as providers and paths that we will not access
