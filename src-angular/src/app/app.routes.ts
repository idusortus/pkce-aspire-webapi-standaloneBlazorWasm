import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ApiTestComponent } from './components/api-test/api-test.component';
import { LoginComponent } from './components/login/login.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { AuthGuard } from './auth/auth.guard';

/**
 * Application routes configuration for standalone component setup
 */
export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { 
    path: 'api-test', 
    component: ApiTestComponent,
    canActivate: [AuthGuard],
    data: { roles: [] } // Any authenticated user can access
  },
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', redirectTo: '/home' }
];
