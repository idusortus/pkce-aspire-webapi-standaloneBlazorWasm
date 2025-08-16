import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { 
  ApiResponse, 
  HealthCheckResponse, 
  EmploymentResponse, 
  PtoExtensionResponse, 
  EndWarResponse 
} from '../models/api.models';
import { CorsHelperService } from './cors-helper.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private corsHelper: CorsHelperService
  ) { }

  // Health endpoint - no authentication required
  getHealth(): Observable<ApiResponse<HealthCheckResponse>> {
    return this.http.get<ApiResponse<HealthCheckResponse>>('/health');
  }

  // Create a method to get authenticated HttpHeaders
  private getAuthHeaders(): Observable<HttpHeaders> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });
        return of(headers);
      })
    );
  }

  // Endpoints that require authentication
  getEmploymentStatus(): Observable<ApiResponse<EmploymentResponse>> {
    // First get authentication headers
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const options = {
          headers,
          withCredentials: true
        };
        
        // Log to console for debugging
        console.log('Making authenticated request to /hr/employed');
        console.log('Headers:', headers.keys());
        
        return this.http.get<ApiResponse<EmploymentResponse>>('/hr/employed', options);
      }),
      catchError(error => {
        console.error('Error in employment status request:', error);
        throw error;
      })
    );
  }

  // Endpoint that requires the SystemAdmin role
  extendPTO(bonusDays: number): Observable<ApiResponse<PtoExtensionResponse>> {
    const url = `/corporate/pto/extend/${bonusDays}`;
    
    // First get authentication headers
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const options = {
          headers,
          withCredentials: true
        };
        
        // Log to console for debugging
        console.log(`Making authenticated request to ${url}`);
        console.log('Headers:', headers.keys());
        
        return this.http.get<ApiResponse<PtoExtensionResponse>>(url, options);
      }),
      catchError(error => {
        console.error('Error in extend PTO request:', error);
        throw error;
      })
    );
  }

  // Endpoint that requires a specific claim
  endWar(): Observable<ApiResponse<EndWarResponse>> {
    const url = '/politics/global/endwar';
    
    // First get authentication headers
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const options = {
          headers,
          withCredentials: true
        };
        
        // Log to console for debugging
        console.log(`Making authenticated request to ${url}`);
        console.log('Headers:', headers.keys());
        
        return this.http.get<ApiResponse<EndWarResponse>>(url, options);
      }),
      catchError(error => {
        console.error('Error in end war request:', error);
        throw error;
      })
    );
  }
}
