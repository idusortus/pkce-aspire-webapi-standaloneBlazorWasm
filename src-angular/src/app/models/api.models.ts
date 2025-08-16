/**
 * Common interface for API responses with consistent structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Health check endpoint response
 */
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  environment: string;
  version?: string;
}

/**
 * Employment status response
 */
export interface EmploymentResponse {
  employed: boolean;
  since?: string;
  position?: string;
}

/**
 * PTO extension response
 */
export interface PtoExtensionResponse {
  success: boolean;
  daysAdded: number;
  newBalance?: number;
  message: string;
}

/**
 * End war response
 */
export interface EndWarResponse {
  success: boolean;
  message: string;
  affectedRegions?: string[];
}

/**
 * User profile information from Keycloak
 */
export interface UserProfile {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  preferred_username?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  roles?: string[];
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
 * Error response format
 */
export interface ErrorResponse {
  status: number;
  message: string;
  details?: string;
}
