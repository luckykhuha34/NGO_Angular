import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {

    const token = localStorage.getItem('authToken');

    if (token) {
      // Already logged in, redirect to home
      this.router.navigate(['/home']);
      return false;
    }

    return true; // allow login page only if not logged in
  }
}
