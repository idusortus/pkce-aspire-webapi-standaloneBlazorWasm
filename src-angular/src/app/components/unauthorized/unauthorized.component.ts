import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent {
  
  constructor(private authService: AuthService) {}

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }
}
