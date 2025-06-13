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
    @if (authService.isLoading$ | async) {
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600">
          <lucide-icon name="loader" class="w-8 h-8"></lucide-icon>
        </div>
      </div>
    }
    
    @if (!(authService.isLoading$ | async)) {
      <router-outlet></router-outlet>
    }
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