import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class CorsInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Add CORS headers to every request
    const corsReq = request.clone({
      setHeaders: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    return next.handle(corsReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          // Handle CORS and network errors
          console.error('Possible CORS error detected:', error);
          
          // You could implement a retry mechanism here
          // or custom error handling for CORS issues
        }
        return throwError(() => error);
      })
    );
  }
}
