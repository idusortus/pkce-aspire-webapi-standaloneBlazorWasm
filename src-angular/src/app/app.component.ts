import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Keycloak Angular Client';
  isLoggedIn = false;
  userProfile: any = {};

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.userProfile = this.authService.getUserClaims();
    }
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }
}
