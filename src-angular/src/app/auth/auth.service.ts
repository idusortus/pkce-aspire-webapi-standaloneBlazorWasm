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

  /**
   * Return a normalized array of role names (lowercased, trimmed, unique).
   * This gathers roles from keycloak-angular helper and token payload to be
   * tolerant of different shapes (realm_access, resource_access, client roles).
   */
  public getRoles(): string[] {
    try {
      const rolesSet = new Set<string>();

      // 1) roles returned by keycloak-angular helper (if available)
      const helperRoles = this.keycloakService.getUserRoles() || [];
      helperRoles.forEach(r => {
        if (typeof r === 'string' && r.trim()) rolesSet.add(r.trim().toLowerCase());
      });

      // 2) inspect token payload for realm_access and resource_access
      const token = this.keycloakService.getKeycloakInstance()?.tokenParsed as any | undefined;
      if (token) {
        // realm_access.roles
        if (token.realm_access && Array.isArray(token.realm_access.roles)) {
          token.realm_access.roles.forEach((r: any) => {
            if (typeof r === 'string' && r.trim()) rolesSet.add(r.trim().toLowerCase());
          });
        }

        // resource_access: collect roles across clients
        if (token.resource_access && typeof token.resource_access === 'object') {
          Object.values(token.resource_access).forEach((clientObj: any) => {
            if (clientObj && Array.isArray(clientObj.roles)) {
              clientObj.roles.forEach((r: any) => {
                if (typeof r === 'string' && r.trim()) rolesSet.add(r.trim().toLowerCase());
              });
            }
          });
        }
      }

      return Array.from(rolesSet);
    } catch (err) {
      // fallback to helper method if any error occurs
      const fallback = this.keycloakService.getUserRoles() || [];
      return fallback.map(r => (typeof r === 'string' ? r.trim().toLowerCase() : String(r))).filter(Boolean);
    }
  }

  public getToken(): Promise<string> {
    return this.keycloakService.getToken();
  }

  public isUserInRole(role: string): boolean {
    return this.keycloakService.isUserInRole(role);
  }

  /**
   * Case-insensitive role check against the normalized roles array. Falls back
   * to KeycloakService.isUserInRole if necessary.
   */
  public hasRole(role: string): boolean {
    if (!role) return false;
    const normalized = String(role).trim().toLowerCase();
    const roles = this.getRoles();
    if (roles && roles.length) {
      return roles.includes(normalized) || roles.some(r => r.includes(normalized));
    }
    // fallback to keycloak adapter check (case-sensitive)
    try {
      return this.keycloakService.isUserInRole(role);
    } catch {
      return false;
    }
  }

  // Convenience helpers for common roles
  public isSystemAdmin(): boolean { return this.hasRole('SystemAdmin'); }
  public isAdmin(): boolean { return this.hasRole('Admin'); }
  public isPaidUser(): boolean { return this.hasRole('PaidUser'); }
  public isFreeUser(): boolean { return this.hasRole('FreeUser'); }
  public isGuest(): boolean { return this.hasRole('Guest'); }

  public getUserInfo(): Observable<any> {
    return from(this.keycloakService.loadUserProfile());
  }

  public getUserClaims(): any {
    const token = this.keycloakService.getKeycloakInstance().tokenParsed;
    return token;
  }
}
