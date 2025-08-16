import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { ApiTestComponent } from './components/api-test/api-test.component';
import { LoginComponent } from './components/login/login.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { environment } from '../environments/environment';

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      },
      // For initial testing we disable the silent SSO iframe flow which can
      // be blocked by browser third-party cookie settings or incorrect
      // Keycloak client web origins. Use 'login-required' to force the login
      // redirect and validate the rest of the app before re-enabling silent
      // checks in Keycloak.
      initOptions: {
        onLoad: 'login-required',
        pkceMethod: 'S256',
        checkLoginIframe: false
      },
      bearerExcludedUrls: ['/assets', '/health']
    });
}

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    KeycloakAngularModule,
    FormsModule,
    AppComponent,
    HomeComponent,
    ApiTestComponent,
    LoginComponent,
    UnauthorizedComponent
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
