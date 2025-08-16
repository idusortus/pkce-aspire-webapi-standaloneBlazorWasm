import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Observable, from, switchMap } from 'rxjs';

/**
 * This interceptor adds the Authorization header with the JWT token
 * to all HTTP requests that are not excluded from authentication.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloakService = inject(KeycloakService);
  
  // Don't add the token for health checks or other public endpoints
  const bearerExcludedUrls = ['/health', '/assets'];
  const isBearerExcluded = bearerExcludedUrls.some(url => req.url.includes(url));
  
  if (isBearerExcluded) {
    return next(req);
  }
  
  // For all other requests, add the Authorization header with the token
  return from(keycloakService.getToken()).pipe(
    switchMap(token => {
      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(authReq);
      }
      return next(req);
    })
  );
}
