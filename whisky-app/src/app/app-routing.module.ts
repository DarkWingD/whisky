import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { WhiskyHomeComponent } from './whisky-home/whisky-home.component';
import { LoggedInGuard } from './loggedin-guard';
import { WhiskyCreateComponent } from './whisky-create/whisky-create.component';
import { WhiskyListComponent } from './whisky-list/whisky-list.component';
import { WhiskyEditComponent } from './whisky-edit/whisky-edit.component';



// import { LoginComponent } from './authentication/login/login.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: WhiskyHomeComponent
  },
  {
    path: 'create',
    component: WhiskyCreateComponent,
    canActivate: [LoggedInGuard]
  },
  {
    path: 'list',
    component: WhiskyListComponent
  },
  {
    path: 'edit/:id',
    component: WhiskyEditComponent,
    canActivate: [LoggedInGuard]
  }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
