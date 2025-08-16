import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class TokenDebugService {
  constructor(private keycloakService: KeycloakService) {}
  
  /**
   * Logs token information for debugging purposes
   */
  async logTokenInfo(): Promise<void> {
    try {
      const token = await this.keycloakService.getToken();
      if (!token) {
        console.warn('No token available');
        return;
      }
      
      // Print token length and first/last few characters (safely)
      console.log(`Token length: ${token.length}`);
      console.log(`Token prefix: ${token.substring(0, 10)}...`);
      
      // Parse and print token payload without sensitive info
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          
          // Log relevant authentication info
          console.log('Token subject:', payload.sub);
          console.log('Token expiration:', new Date(payload.exp * 1000).toISOString());
          console.log('Token issuer:', payload.iss);
          
          // Log roles information
          if (payload.realm_access && payload.realm_access.roles) {
            console.log('Realm roles:', payload.realm_access.roles);
          }
          
          if (payload.resource_access) {
            console.log('Resource access:', Object.keys(payload.resource_access));
            // Log roles for each client
            Object.keys(payload.resource_access).forEach(client => {
              if (payload.resource_access[client].roles) {
                console.log(`Roles for ${client}:`, payload.resource_access[client].roles);
              }
            });
          }
          
          // Check if token has SystemAdmin role
          const hasSystemAdminInRealm = payload.realm_access?.roles?.includes('SystemAdmin') || false;
          const clientWithSystemAdmin = Object.keys(payload.resource_access || {}).find(
            client => payload.resource_access[client]?.roles?.includes('SystemAdmin')
          );
          
          console.log('Has SystemAdmin in realm roles:', hasSystemAdminInRealm);
          console.log('Client with SystemAdmin role:', clientWithSystemAdmin || 'None');
        } catch (e) {
          console.error('Error parsing token payload:', e);
        }
      }
    } catch (e) {
      console.error('Error getting token:', e);
    }
  }
}
