import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <div *ngIf="authService.isLoading$ | async" class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
    
    <router-outlet *ngIf="!(authService.isLoading$ | async)"></router-outlet>
  `
})
export class AppComponent implements OnInit {
  
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      const currentRoute = this.router.url;
      
      // Don't redirect if user is on landing, login, or signup pages
      if (currentRoute === '/' || currentRoute === '/login' || currentRoute === '/signup') {
        return;
      }
      
      if (user) {
        if (user.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (user.role === 'vendor') {
          this.router.navigate(['/vendor-dashboard']);
        } else if (user.role === 'client') {
          this.router.navigate(['/client-dashboard']);
        }
      } else {
        this.router.navigate(['/']);
      }
    });
  }
}