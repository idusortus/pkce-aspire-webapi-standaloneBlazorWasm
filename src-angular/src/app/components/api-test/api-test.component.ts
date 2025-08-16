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
  hasCEORole = false;
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
    if (this.isLoggedIn) {
      this.userRoles = this.authService.getRoles();
      this.hasCEORole = this.authService.hasRealmRole('systemadmin');
      
      // Check if user has the claim to create whirled peas
      const claims = this.authService.getUserClaims();
      this.canEndWar = claims && claims.CanCreateWhirledPeas === 'true';
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
        this.warError = this.getErrorMessage(error);
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
