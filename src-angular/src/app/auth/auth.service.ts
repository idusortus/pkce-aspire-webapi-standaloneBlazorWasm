import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private keycloakService: KeycloakService) {}

  public isLoggedIn(): boolean {
    return this.keycloakService.isLoggedIn();
  }

  public login(): void {
    this.keycloakService.login();
  }

  public logout(): void {
    this.keycloakService.logout(window.location.origin);
  }

  public getUsername(): string | undefined {
    return this.keycloakService.getUsername();
  }

  public getRoles(): string[] {
    return this.keycloakService.getUserRoles();
  }

  public getToken(): Promise<string> {
    return this.keycloakService.getToken();
  }

  public isUserInRole(role: string): boolean {
    return this.keycloakService.isUserInRole(role);
  }

  public hasRealmRole(role: string): boolean {
    const roles = this.keycloakService.getUserRoles();
    return roles.includes(role);
  }

  public getUserInfo(): Observable<any> {
    return from(this.keycloakService.loadUserProfile());
  }

  public getUserClaims(): any {
    const token = this.keycloakService.getKeycloakInstance().tokenParsed;
    return token;
  }
}
