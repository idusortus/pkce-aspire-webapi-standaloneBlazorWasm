/**
 * Type definitions for authentication
 */

/**
 * User profile from JWT token
 */
export interface UserProfile {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  preferred_username?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
  [key: string]: any; // For additional claims
}

/**
 * Keycloak token structure
 */
export interface KeycloakTokenParsed extends UserProfile {
  exp?: number;
  iat?: number;
  auth_time?: number;
  jti?: string;
  iss?: string;
  aud?: string;
  typ?: string;
  azp?: string;
  session_state?: string;
  acr?: string;
  scope?: string;
}

/**
 * Role definition
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
  composite?: boolean;
  clientRole?: boolean;
  containerId?: string;
}
