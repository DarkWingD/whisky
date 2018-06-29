import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { WhiskyHomeComponent } from './whisky-home/whisky-home.component';
import { WhiskyCreateComponent } from './whisky-create/whisky-create.component';
import { WhiskyEditComponent } from './whisky-edit/whisky-edit.component';
import { WhiskyListComponent } from './whisky-list/whisky-list.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    WhiskyHomeComponent,
    WhiskyCreateComponent,
    WhiskyEditComponent,
    WhiskyListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
