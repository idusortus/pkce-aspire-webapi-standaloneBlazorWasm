import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { UserProfile } from '../../models/api.models';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  userRoles: string[] = [];
  userClaims: UserProfile | null = null;
  
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.userRoles = this.authService.getRoles();
      this.userClaims = this.authService.getUserClaims();
    }
  }

  login() {
    this.authService.login();
  }

  getClaimEntries(): [string, any][] {
    if (!this.userClaims) {
      return [];
    }
    return Object.entries(this.userClaims)
      .filter(([key]) => !['exp', 'iat', 'auth_time', 'jti', 'nbf', 'session_state'].includes(key));
  }
}
