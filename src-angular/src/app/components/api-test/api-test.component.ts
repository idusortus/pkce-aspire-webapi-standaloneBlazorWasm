import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../auth/auth.service';
import { TokenDebugService } from '../../services/token-debug.service';
import { 
  ApiResponse, 
  HealthCheckResponse, 
  EmploymentResponse, 
  PtoExtensionResponse, 
  EndWarResponse 
} from '../../models/api.models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-api-test',
  templateUrl: './api-test.component.html',
  styleUrls: ['./api-test.component.scss']
})
export class ApiTestComponent implements OnInit {
  isLoggedIn = false;
  userRoles: string[] = [];
  hasSystemAdminRole = false;
  canEndWar = false;
  ptoDays = 5;
  
  healthResult: ApiResponse<HealthCheckResponse> | null = null;
  employmentResult: ApiResponse<EmploymentResponse> | null = null;
  ptoResult: ApiResponse<PtoExtensionResponse> | null = null;
  warResult: ApiResponse<EndWarResponse> | null = null;
  
  healthError: string | null = null;
  employmentError: string | null = null;
  ptoError: string | null = null;
  warError: string | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private tokenDebugService: TokenDebugService
  ) {}

  async ngOnInit() {
    this.isLoggedIn = await this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      // grab normalized roles for display/debugging
      this.userRoles = this.authService.getRoles();
      // single-source-of-truth role check
      this.hasSystemAdminRole = this.authService.isSystemAdmin();
      // Only use roles in the SPA; API will enforce finer-grained permissions.
      // Allow the End War button to be clickable for authenticated users; the
      // API will return 403 if they're not allowed, and we'll show a friendly
      // unauthorized message based on that response.
      this.canEndWar = this.isLoggedIn;
      
      // Debug token information to help diagnose authentication issues
      await this.tokenDebugService.logTokenInfo();
      console.log('User roles from authService:', this.userRoles);
      console.log('Has SystemAdmin role:', this.hasSystemAdminRole);
    }
  }

  checkHealth() {
    this.healthResult = null;
    this.healthError = null;
    
    this.apiService.getHealth().subscribe({
      next: (result) => {
        this.healthResult = result;
      },
      error: (error) => {
        this.healthError = this.getErrorMessage(error);
      }
    });
  }

  checkEmployment() {
    this.employmentResult = null;
    this.employmentError = null;
    
    console.log('Requesting employment status...');
    // Debug token once more before making the request
    this.tokenDebugService.logTokenInfo();
    
    this.apiService.getEmploymentStatus().subscribe({
      next: (result) => {
        console.log('Employment status response:', result);
        this.employmentResult = result;
      },
      error: (error) => {
        console.error('Employment status error:', error);
        this.employmentError = this.getErrorMessage(error);
      }
    });
  }

  extendPTO() {
    this.ptoResult = null;
    this.ptoError = null;
    
    console.log(`Requesting PTO extension of ${this.ptoDays} days...`);
    // Debug token once more before making the request
    this.tokenDebugService.logTokenInfo();
    
    this.apiService.extendPTO(this.ptoDays).subscribe({
      next: (result) => {
        console.log('PTO extension response:', result);
        this.ptoResult = result;
      },
      error: (error) => {
        console.error('PTO extension error:', error);
        this.ptoError = this.getErrorMessage(error);
      }
    });
  }

  endWar() {
    this.warResult = null;
    this.warError = null;
    
    console.log('Requesting to end war...');
    // Debug token once more before making the request
    this.tokenDebugService.logTokenInfo();
    
    this.apiService.endWar().subscribe({
      next: (result) => {
        console.log('End war response:', result);
        this.warResult = result;
      },
      error: (error) => {
        console.error('End war error:', error);
        if (error.status === 403) {
          this.warError = 'Unauthorized: you do not have permission to perform this action. Your account lacks the required roles or claims.';
        } else {
          this.warError = this.getErrorMessage(error);
        }
      }
    });
  }

  private getErrorMessage(error: any): string {
    console.log('Full error object:', error);
    
    if (error.status === 401) {
      return 'Unauthorized: You need to log in to access this endpoint. Please check your authentication token.';
    } else if (error.status === 403) {
      return 'Forbidden: You do not have permission to access this endpoint. Your account lacks the required roles or permissions.';
    } else if (error.status === 0) {
      return 'Network error: Unable to connect to the API. This may be due to CORS restrictions or the API being unavailable.';
    } else if (error.error && error.error.message) {
      return `Error: ${error.error.message}`;
    } else if (error.message) {
      return `Error: ${error.message}`;
    } else {
      return `Unknown error (Status: ${error.status || 'N/A'})`;
    }
  }
}
