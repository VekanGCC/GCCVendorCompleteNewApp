import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map(user => {
      if (user) {
        // User is logged in, allow access
        return true;
      } else {
        // Check if there's a token in localStorage
        const token = localStorage.getItem('authToken');
        if (token) {
          // There's a token, but user data isn't loaded yet
          // Let the auth service handle token verification
          return true;
        } else {
          // No token, redirect to login
          router.navigate(['/login']);
          return false;
        }
      }
    })
  );
};