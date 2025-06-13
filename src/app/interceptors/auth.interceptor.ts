import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the auth token from localStorage
    const authToken = localStorage.getItem('authToken');
    
    // Skip adding token for login and public endpoints
    if (request.url.includes('/auth/login') || 
        request.url.includes('/assets/') || 
        !authToken) {
      return next.handle(request);
    }

    // Clone the request and add the authorization header
    const authReq = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${authToken}`)
    });

    // Handle the request and catch any authentication errors
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // If we get a 401 Unauthorized response, the token is invalid or expired
          console.log('🔒 Auth token expired or invalid, redirecting to login');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          this.router.navigate(['/login']);
        }
        return throwError(error);
      })
    );
  }
}