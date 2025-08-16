import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Health endpoint - no authentication required
  getHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }

  // Endpoints that require authentication
  getEmploymentStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/hr/employed`);
  }

  // Endpoint that requires the SystemAdmin role
  extendPTO(bonusDays: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/corporate/pto/extend/${bonusDays}`);
  }

  // Endpoint that requires a specific claim
  endWar(): Observable<any> {
    return this.http.get(`${this.apiUrl}/politics/global/endwar`);
  }
}
