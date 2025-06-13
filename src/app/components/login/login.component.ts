import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  error = '';
  isLoading = false;
  successMessage = '';

  demoCredentials = [
    { 
      role: 'Vendor', 
      email: 'vendor@techcorp.com', 
      password: 'demo123',
      company: 'TechCorp Solutions',
      description: 'IT staffing vendor with multiple resources'
    },
    { 
      role: 'Client', 
      email: 'client@innovate.com', 
      password: 'demo123',
      company: 'Innovate Inc',
      description: 'Technology company seeking IT talent'
    },
    { 
      role: 'Vendor', 
      email: 'vendor2@devstudio.com', 
      password: 'demo123',
      company: 'DevStudio',
      description: 'Software development consultancy'
    },
    { 
      role: 'Client', 
      email: 'client2@startup.com', 
      password: 'demo123',
      company: 'StartupXYZ',
      description: 'Fast-growing startup needing developers'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Check for success message from registration
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.successMessage = params['message'];
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.error = '';
      this.isLoading = true;
      
      const { email, password } = this.loginForm.value;
      
      try {
        const success = await this.authService.login(email, password);
        if (!success) {
          this.error = 'Invalid email or password. Please try again.';
        }
        // If successful, the AuthService will handle navigation
      } catch (error) {
        console.error('Login error:', error);
        this.error = 'An error occurred during login. Please try again.';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  async handleDemoLogin(email: string, password: string): Promise<void> {
    this.loginForm.patchValue({ email, password });
    this.error = '';
    this.isLoading = true;

    try {
      const success = await this.authService.login(email, password);
      if (!success) {
        this.error = 'Demo account login failed. Please try again.';
      }
    } catch (error) {
      console.error('Demo login error:', error);
      this.error = 'An error occurred during demo login. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return fieldName === 'email' ? 'Email is required' : 'Password is required';
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }
}