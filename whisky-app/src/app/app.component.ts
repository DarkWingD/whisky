import { Component } from '@angular/core';
import {
  Router,
  // import as RouterEvent to avoid confusion with the DOM Event
  Event as RouterEvent,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfigService } from "../services/config.service";
import { AdalService } from "ng2-adal/dist/services/adal.service";
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Three Amigoes Whisky Review App!';
  loading = true;
  authenticated = false;
  currentUser = '';
  version = "1.0.0.0";

  ngOnInit(): void {
    if (environment.local) {
      this.currentUser = 'Marc Fortescue-Brickdale';
    }
    else {
      this.authenticated = this.adalService.userInfo.isAuthenticated;
      this.adalService.handleWindowCallback();
      this.adalService.getUser().subscribe(
        data => {
          this.currentUser = data.userName;
        }
      );
    }
  }

  showSpinner() {
    this.spinnerService.show();
  }

  hideSpinner() {
    this.spinnerService.hide();
  }
  // Sets initial value to true to show loading spinner on first load

  constructor(
    private router: Router,
    private adalService: AdalService,
    private configService: ConfigService,
    private spinnerService: NgxSpinnerService) {
    this.adalService.init(this.configService.adalConfig);
    router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event)
    }
    )
  }

  // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.showSpinner();
    }
    if (event instanceof NavigationEnd) {
      this.hideSpinner();
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.hideSpinner();
    }
    if (event instanceof NavigationError) {
      this.hideSpinner();
    }
  }

  public logIn() {
    this.adalService.login();
  }

  public logOut() {
    this.adalService.logOut();
    this.currentUser = '';
  }
}
