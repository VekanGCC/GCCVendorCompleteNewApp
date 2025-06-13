import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LucideAngularModule],
  template: `
    <div *ngIf="authService.isLoading$ | async" class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600">
        <lucide-icon name="loader" class="w-8 h-8"></lucide-icon>
      </div>
    </div>
    
    <div *ngIf="!(authService.isLoading$ | async)">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent implements OnInit {
  
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to user changes and handle navigation
    this.authService.user$.subscribe(user => {
      const currentRoute = this.router.url;
      
      console.log('🔄 User state changed:', user?.name, user?.role, 'Current route:', currentRoute);
      
      // Don't redirect if user is on landing, login, or signup pages
      if (currentRoute === '/' || currentRoute === '/login' || currentRoute === '/signup') {
        // Only redirect if user is logged in and on login/signup pages
        if (user && (currentRoute === '/login' || currentRoute === '/signup')) {
          console.log('🧭 User logged in from login/signup page, redirecting...');
          this.navigateBasedOnRole(user);
        }
        return;
      }
      
      // If user is logged in, navigate to appropriate dashboard
      if (user) {
        console.log('🧭 User is logged in, checking if navigation is needed...');
        this.navigateBasedOnRole(user);
      } else {
        // User is not logged in, redirect to landing page
        console.log('🧭 User not logged in, redirecting to landing page');
        this.router.navigate(['/']);
      }
    });
  }

  private navigateBasedOnRole(user: any): void {
    console.log('🧭 Navigating based on role:', user.role);
    
    const currentRoute = this.router.url;
    let targetRoute = '';
    
    if (user.role === 'admin') {
      targetRoute = '/admin-dashboard';
    } else if (user.role === 'vendor') {
      targetRoute = '/vendor-dashboard';
    } else if (user.role === 'client') {
      targetRoute = '/client-dashboard';
    } else {
      console.warn('⚠️ Unknown user role:', user.role);
      this.router.navigate(['/']);
      return;
    }
    
    // Only navigate if we're not already on the target route
    if (currentRoute !== targetRoute) {
      console.log('🧭 Navigating from', currentRoute, 'to', targetRoute);
      this.router.navigate([targetRoute]);
    } else {
      console.log('🧭 Already on correct route:', currentRoute);
    }
  }
}