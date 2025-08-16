import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

/**
 * Service to handle CORS preflight requests and ensure proper authentication
 */
@Injectable({
  providedIn: 'root'
})
export class CorsHelperService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Makes a preflight OPTIONS request before making the actual API request
   * This helps ensure CORS headers are properly established
   */
  preflightRequest<T>(url: string, method: string = 'GET'): Observable<boolean> {
    // Create headers using modern Object.assign instead of util._extend
    const headersObj = Object.assign({}, {
      'Access-Control-Request-Method': method,
      'Access-Control-Request-Headers': 'authorization,content-type'
    });
    
    const headers = new HttpHeaders(headersObj);

    // Using Object.assign for options too
    const options = Object.assign({}, { 
      headers,
      observe: 'response' as const,
      withCredentials: true
    });

    return this.http.options(url, options).pipe(
      mergeMap(() => of(true)),
      catchError((error) => {
        console.warn(`Preflight request failed for ${url}:`, error);
        return of(false);
      })
    );
  }

  /**
   * Helper method to add auth token to a request
   */
  async addAuthHeader(headers: any = {}): Promise<any> {
    try {
      const token = await this.authService.getToken();
      if (token) {
        return Object.assign({}, headers, {
          Authorization: `Bearer ${token}`
        });
      }
      return headers;
    } catch (err) {
      console.error('Error getting auth token:', err);
      return headers;
    }
  }
}
