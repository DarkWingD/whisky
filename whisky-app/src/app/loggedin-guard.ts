import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
// import {AdalService} from 'ng2-adal/dist/core';
import { environment } from '../environments/environment';

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(//private adalService: AdalService,
  private router: Router) {}

  canActivate() {
    if (environment.local){
      return true;
    }
    // if (this.adalService.userInfo.isAuthenticated) {
    //   return true;
    // } else {
    //   this.router.navigate(['/login']);
    //   return false;
    // }
  }
}