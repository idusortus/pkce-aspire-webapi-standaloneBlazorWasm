import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';

@Injectable()
export class AuthClassInterceptor implements HttpInterceptor {
  constructor(private keycloakService: KeycloakService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Don't add the token for health checks or other public endpoints
    const bearerExcludedUrls = ['/health', '/assets'];
    const isBearerExcluded = bearerExcludedUrls.some(url => request.url.includes(url));
    
    if (isBearerExcluded) {
      return next.handle(request);
    }

    // For all other requests, add the Authorization header with the token
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        if (token) {
          // Clone the request with the Authorization header
          const authReq = request.clone({
            setHeaders: {
              // Use explicit 'Bearer ' prefix for JWT token
              Authorization: `Bearer ${token}`,
              // Add CORS headers
              'X-Requested-With': 'XMLHttpRequest'
            },
            // Ensure credentials are sent
            withCredentials: true
          });
          // Log the token for debugging (masked for security)
          const maskedToken = token.substring(0, 10) + '...' + token.substring(token.length - 10);
          console.log(`Adding auth token: ${maskedToken}`);
          return next.handle(authReq);
        }
        return next.handle(request);
      }),
      catchError((error: HttpErrorResponse) => {
        // Handle CORS errors
        if (error.status === 0) {
          console.error('CORS error or network error:', error);
        }
        return throwError(() => error);
      })
    );
  }
}
