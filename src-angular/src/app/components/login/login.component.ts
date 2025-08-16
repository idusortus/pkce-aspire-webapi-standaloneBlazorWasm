import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const isLoggedIn = this.authService.isLoggedIn();
    if (isLoggedIn) {
      this.router.navigate(['/home']);
    }
  }

  login() {
    this.authService.login();
  }
}
