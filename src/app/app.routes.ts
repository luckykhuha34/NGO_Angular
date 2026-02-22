import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { TierbreakdownComponent } from './tierbreakdown/tierbreakdown.component';
import { ImpactMetricsChartsComponent } from './impact-metrics-charts/impact-metrics-charts.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { VolunteersComponent } from './volunteers/volunteers.component';

// export const routes: Routes = [
//     { path: '', component: HomeComponent },
//     { path: 'home', component: HomeComponent },
//     { path: 'profile', component: ProfileComponent },
//     { path: 'login', component: AuthenticationComponent },
//     { path: 'adminlogin', component: AdminLoginComponent }, 
//     { path: 'changepassword', component: ChangePasswordComponent },

//     { path: '**', redirectTo: '' },
// ];


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'changepassword', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  { path: 'tierbreakdown', component: TierbreakdownComponent, canActivate: [AuthGuard] },
  { path: 'volunteers', component: VolunteersComponent, canActivate: [AuthGuard] },
  { path: 'chart', component: ImpactMetricsChartsComponent, canActivate: [AuthGuard] },
  
  { path: 'login', component: AuthenticationComponent, canActivate: [LoginGuard] },
  { path: 'adminlogin', component: AdminLoginComponent, canActivate: [LoginGuard] },
  { path: 'forgetPassword', component: ForgetPasswordComponent, canActivate: [LoginGuard] },

  { path: '**', redirectTo: 'home' }
];