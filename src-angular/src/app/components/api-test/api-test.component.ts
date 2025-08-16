import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../auth/auth.service';

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
  
  healthResult: any = null;
  employmentResult: any = null;
  ptoResult: any = null;
  warResult: any = null;
  
  healthError: string | null = null;
  employmentError: string | null = null;
  ptoError: string | null = null;
  warError: string | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.isLoggedIn = await this.authService.isLoggedIn();
    console.log('isLoggedIn status:', this.isLoggedIn);
    if (this.isLoggedIn) {
  // grab normalized roles for display/debugging
  this.userRoles = this.authService.getRoles();
  // Log detailed role information for debugging
  console.log('Raw userRoles array:', this.userRoles);
  console.log('Has SystemAdmin role?', this.authService.isSystemAdmin());
  
  // Get the raw token to check the exact structure
  const tokenPayload = this.authService.getUserClaims();
  console.log('JWT token payload (partial):', {
    roles: tokenPayload?.roles,
    realm_access: tokenPayload?.realm_access,
    resource_access: tokenPayload?.resource_access
  });
  // single-source-of-truth role check
  this.hasSystemAdminRole = this.authService.isSystemAdmin();
  console.log('hasSystemAdminRole assigned value:', this.hasSystemAdminRole);
      // Only use roles in the SPA; API will enforce finer-grained permissions.
      // Allow the End War button to be clickable for authenticated users; the
      // API will return 403 if they're not allowed, and we'll show a friendly
      // unauthorized message based on that response.
      this.canEndWar = this.isLoggedIn;
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
    
    this.apiService.getEmploymentStatus().subscribe({
      next: (result) => {
        this.employmentResult = result;
      },
      error: (error) => {
        this.employmentError = this.getErrorMessage(error);
      }
    });
  }

  extendPTO() {
    this.ptoResult = null;
    this.ptoError = null;
    
    this.apiService.extendPTO(this.ptoDays).subscribe({
      next: (result) => {
        this.ptoResult = result;
      },
      error: (error) => {
        this.ptoError = this.getErrorMessage(error);
      }
    });
  }

  endWar() {
    this.warResult = null;
    this.warError = null;
    
    this.apiService.endWar().subscribe({
      next: (result) => {
        this.warResult = result;
      },
      error: (error) => {
        if (error.status === 403) {
          this.warError = 'Unauthorized: you do not have permission to perform this action.';
        } else {
          this.warError = this.getErrorMessage(error);
        }
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 401) {
      return 'Unauthorized: You need to log in to access this endpoint.';
    } else if (error.status === 403) {
      return 'Forbidden: You do not have permission to access this endpoint.';
    } else if (error.error && error.error.message) {
      return `Error: ${error.error.message}`;
    } else {
      return `Error: ${error.message || 'Unknown error'}`;
    }
  }
}
