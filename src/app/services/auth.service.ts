import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(true);

  public user$ = this.userSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.checkStoredUser();
  }

  private checkStoredUser(): void {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        this.userSubject.next(user);
        console.log('✅ Restored user session:', user.name, user.role);
      } catch (error) {
        console.error('❌ Error parsing stored user:', error);
        this.clearStoredAuth();
      }
    }
    this.isLoadingSubject.next(false);
  }

  private clearStoredAuth(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  }

  async login(email: string, password: string): Promise<boolean> {
    this.isLoadingSubject.next(true);
    console.log('🔐 Attempting login for:', email);
    
    try {
      const response = await this.apiService.login({ email, password }).toPromise();
      console.log('📡 Login response:', response);
      
      if (response && response.success && response.user) {
        // Store user and token
        this.userSubject.next(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token);
        
        console.log('✅ Login successful for:', response.user.name, response.user.role);
        
        // Navigate based on user role
        if (response.user.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (response.user.role === 'vendor') {
          this.router.navigate(['/vendor-dashboard']);
        } else if (response.user.role === 'client') {
          this.router.navigate(['/client-dashboard']);
        }
        
        this.isLoadingSubject.next(false);
        return true;
      } else {
        console.log('❌ Login failed - invalid response:', response);
        this.isLoadingSubject.next(false);
        return false;
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      this.isLoadingSubject.next(false);
      return false;
    }
  }

  async logout(): Promise<void> {
    console.log('🚪 Logging out user');
    
    try {
      await this.apiService.logout().toPromise();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.userSubject.next(null);
      this.clearStoredAuth();
      this.router.navigate(['/']);
    }
  }

  getUsers(): Observable<User[]> {
    return this.apiService.getUsers().pipe(
      map(response => response.success ? response.data : [])
    );
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.userSubject.value !== null;
  }
}