import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  private useMockData = environment.useMockData;

  constructor(private http: HttpClient) {}

  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  private getHttpOptions(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      })
    };
  }

  private simulateApiCall<T>(endpoint: string, method: string = 'GET', data?: any, delay_ms: number = 500): Observable<any> {
    console.log(`🔄 API ${method}: ${endpoint}`, data ? data : '');
    
    if (this.useMockData) {
      return this.http.get<any>(`/assets/mock-data/${endpoint}.json`).pipe(
        delay(delay_ms),
        map(response => {
          console.log(`✅ Mock API ${method} response:`, response);
          return { success: true, data: response };
        }),
        catchError(error => {
          console.error(`❌ Mock API ${method} error:`, error);
          return of({ success: false, message: 'Error fetching mock data' });
        })
      );
    } else {
      // Real API call
      let request: Observable<any>;
      const httpOptions = this.getHttpOptions();
      
      switch (method) {
        case 'POST':
          request = this.http.post(`${this.baseUrl}/${endpoint}`, data, httpOptions);
          break;
        case 'PUT':
          request = this.http.put(`${this.baseUrl}/${endpoint}`, data, httpOptions);
          break;
        case 'PATCH':
          request = this.http.patch(`${this.baseUrl}/${endpoint}`, data, httpOptions);
          break;
        case 'DELETE':
          request = this.http.delete(`${this.baseUrl}/${endpoint}`, httpOptions);
          break;
        default:
          request = this.http.get(`${this.baseUrl}/${endpoint}`, httpOptions);
      }
      
      return request.pipe(
        catchError(error => {
          console.error(`❌ API ${method} error:`, error);
          return of({ success: false, message: 'API error' });
        })
      );
    }
  }

  // Authentication APIs
  login(credentials: { email: string; password: string }): Observable<any> {
    console.log('🔐 API: Login attempt for:', credentials.email);
    
    // For mock data, we'll simulate a login response
    if (this.useMockData) {
      return this.http.get<any>('/assets/mock-data/users.json').pipe(
        delay(800),
        map(users => {
          const user = users.find((u: any) => u.email.toLowerCase() === credentials.email.toLowerCase());
          
          if (user && credentials.password === 'demo123') {
            const response = {
              success: true,
              user: user,
              token: 'mock-jwt-token-' + user.id + '-' + Date.now()
            };
            console.log('✅ API: Login successful for:', user.name, '(' + user.role + ')');
            return response;
          } else {
            console.log('❌ API: Login failed - invalid credentials for:', credentials.email);
            return { 
              success: false, 
              message: 'Invalid email or password' 
            };
          }
        }),
        catchError(error => {
          console.error('❌ API: Login error:', error);
          return of({ success: false, message: 'Login error' });
        })
      );
    } else {
      return this.http.post(`${this.baseUrl}/auth/login`, credentials, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(
        catchError(error => {
          console.error('❌ API: Login error:', error);
          return of({ success: false, message: 'Login error' });
        })
      );
    }
  }

  verifyToken(token: string): Observable<any> {
    console.log('🔒 API: Verifying token');
    
    if (this.useMockData) {
      // For mock data, we'll simulate token verification
      // In a real app, this would validate the token with the backend
      return of({ success: true }).pipe(delay(300));
    } else {
      return this.http.get(`${this.baseUrl}/auth/verify`, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
      }).pipe(
        catchError(error => {
          console.error('❌ API: Token verification error:', error);
          return of({ success: false, message: 'Token verification error' });
        })
      );
    }
  }

  logout(): Observable<any> {
    console.log('🚪 API: Logout');
    
    if (this.useMockData) {
      return of({ success: true }).pipe(delay(300));
    } else {
      return this.http.post(`${this.baseUrl}/auth/logout`, {}, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Logout error:', error);
          return of({ success: false, message: 'Logout error' });
        })
      );
    }
  }

  // User APIs
  getUsers(): Observable<any> {
    console.log('👥 API: Fetching users...');
    return this.simulateApiCall('users');
  }

  // Resource APIs
  getResources(): Observable<any> {
    console.log('🧑‍💼 API: Fetching resources...');
    return this.simulateApiCall('resources');
  }

  createResource(resource: any): Observable<any> {
    console.log('➕ API: Creating resource:', resource.name);
    
    if (this.useMockData) {
      return this.http.get<any>('/assets/mock-data/resources.json').pipe(
        delay(500),
        map(resources => {
          const newResource = {
            ...resource,
            id: Date.now().toString(),
            createdAt: new Date().toISOString().split('T')[0]
          };
          console.log('✅ API: Resource created:', newResource);
          return { success: true, data: newResource };
        }),
        catchError(error => {
          console.error('❌ API: Create resource error:', error);
          return of({ success: false, message: 'Error creating resource' });
        })
      );
    } else {
      return this.http.post(`${this.baseUrl}/resources`, resource, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Create resource error:', error);
          return of({ success: false, message: 'Error creating resource' });
        })
      );
    }
  }

  updateResource(id: string, resource: any): Observable<any> {
    console.log('📝 API: Updating resource:', id);
    
    if (this.useMockData) {
      return of({ success: true, data: { ...resource, id } }).pipe(delay(500));
    } else {
      return this.http.put(`${this.baseUrl}/resources/${id}`, resource, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Update resource error:', error);
          return of({ success: false, message: 'Error updating resource' });
        })
      );
    }
  }

  deleteResource(id: string): Observable<any> {
    console.log('🗑️ API: Deleting resource:', id);
    
    if (this.useMockData) {
      return of({ success: true }).pipe(delay(500));
    } else {
      return this.http.delete(`${this.baseUrl}/resources/${id}`, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Delete resource error:', error);
          return of({ success: false, message: 'Error deleting resource' });
        })
      );
    }
  }

  // Requirement APIs
  getRequirements(): Observable<any> {
    console.log('📋 API: Fetching requirements...');
    return this.simulateApiCall('requirements');
  }

  createRequirement(requirement: any): Observable<any> {
    console.log('➕ API: Creating requirement:', requirement.title);
    
    if (this.useMockData) {
      return this.http.get<any>('/assets/mock-data/requirements.json').pipe(
        delay(500),
        map(requirements => {
          const newRequirement = {
            ...requirement,
            id: Date.now().toString(),
            createdAt: new Date().toISOString().split('T')[0]
          };
          console.log('✅ API: Requirement created:', newRequirement);
          return { success: true, data: newRequirement };
        }),
        catchError(error => {
          console.error('❌ API: Create requirement error:', error);
          return of({ success: false, message: 'Error creating requirement' });
        })
      );
    } else {
      return this.http.post(`${this.baseUrl}/requirements`, requirement, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Create requirement error:', error);
          return of({ success: false, message: 'Error creating requirement' });
        })
      );
    }
  }

  updateRequirement(id: string, requirement: any): Observable<any> {
    console.log('📝 API: Updating requirement:', id);
    
    if (this.useMockData) {
      return of({ success: true, data: { ...requirement, id } }).pipe(delay(500));
    } else {
      return this.http.put(`${this.baseUrl}/requirements/${id}`, requirement, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Update requirement error:', error);
          return of({ success: false, message: 'Error updating requirement' });
        })
      );
    }
  }

  updateRequirementStatus(id: string, status: string): Observable<any> {
    console.log('🔄 API: Updating requirement status:', id, status);
    
    if (this.useMockData) {
      return of({ success: true, data: { id, status } }).pipe(delay(500));
    } else {
      return this.http.patch(`${this.baseUrl}/requirements/${id}/status`, { status }, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Update requirement status error:', error);
          return of({ success: false, message: 'Error updating requirement status' });
        })
      );
    }
  }

  // Application APIs
  getApplications(): Observable<any> {
    console.log('📊 API: Fetching applications...');
    return this.simulateApiCall('applications');
  }

  createApplication(application: any): Observable<any> {
    console.log('➕ API: Creating application...');
    
    if (this.useMockData) {
      return this.http.get<any>('/assets/mock-data/applications.json').pipe(
        delay(500),
        map(applications => {
          const newApplication = {
            ...application,
            id: Date.now().toString(),
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
          };
          console.log('✅ API: Application created:', newApplication);
          return { success: true, data: newApplication };
        }),
        catchError(error => {
          console.error('❌ API: Create application error:', error);
          return of({ success: false, message: 'Error creating application' });
        })
      );
    } else {
      return this.http.post(`${this.baseUrl}/applications`, application, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Create application error:', error);
          return of({ success: false, message: 'Error creating application' });
        })
      );
    }
  }

  updateApplicationStatus(id: string, status: string, notes?: string): Observable<any> {
    console.log('🔄 API: Updating application status:', id, status);
    
    if (this.useMockData) {
      return of({ 
        success: true, 
        data: { 
          id, 
          status, 
          notes,
          updatedAt: new Date().toISOString().split('T')[0]
        } 
      }).pipe(delay(500));
    } else {
      return this.http.patch(`${this.baseUrl}/applications/${id}/status`, { status, notes }, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Update application status error:', error);
          return of({ success: false, message: 'Error updating application status' });
        })
      );
    }
  }

  // Vendor User APIs
  getVendorUsers(): Observable<any> {
    console.log('👥 API: Fetching vendor users...');
    return this.simulateApiCall('vendor-users');
  }

  createVendorUser(user: any): Observable<any> {
    console.log('➕ API: Creating vendor user:', user.name);
    
    if (this.useMockData) {
      return this.http.get<any>('/assets/mock-data/vendor-users.json').pipe(
        delay(500),
        map(users => {
          const newUser = {
            ...user,
            id: Date.now().toString(),
            createdAt: new Date().toISOString().split('T')[0]
          };
          console.log('✅ API: Vendor user created:', newUser);
          return { success: true, data: newUser };
        }),
        catchError(error => {
          console.error('❌ API: Create vendor user error:', error);
          return of({ success: false, message: 'Error creating vendor user' });
        })
      );
    } else {
      return this.http.post(`${this.baseUrl}/vendor-users`, user, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Create vendor user error:', error);
          return of({ success: false, message: 'Error creating vendor user' });
        })
      );
    }
  }

  updateVendorUserStatus(id: string, status: string): Observable<any> {
    console.log('🔄 API: Updating vendor user status:', id, status);
    
    if (this.useMockData) {
      return of({ success: true, data: { id, status } }).pipe(delay(500));
    } else {
      return this.http.patch(`${this.baseUrl}/vendor-users/${id}/status`, { status }, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Update vendor user status error:', error);
          return of({ success: false, message: 'Error updating vendor user status' });
        })
      );
    }
  }

  // Vendor Skill APIs
  getVendorSkills(): Observable<any> {
    console.log('🎯 API: Fetching vendor skills...');
    return this.simulateApiCall('vendor-skills');
  }

  createVendorSkill(skill: any): Observable<any> {
    console.log('➕ API: Creating vendor skill:', skill.skillName);
    
    if (this.useMockData) {
      return this.http.get<any>('/assets/mock-data/vendor-skills.json').pipe(
        delay(500),
        map(skills => {
          const newSkill = {
            ...skill,
            id: Date.now().toString(),
            submittedAt: new Date().toISOString().split('T')[0]
          };
          console.log('✅ API: Vendor skill created:', newSkill);
          return { success: true, data: newSkill };
        }),
        catchError(error => {
          console.error('❌ API: Create vendor skill error:', error);
          return of({ success: false, message: 'Error creating vendor skill' });
        })
      );
    } else {
      return this.http.post(`${this.baseUrl}/vendor-skills`, skill, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Create vendor skill error:', error);
          return of({ success: false, message: 'Error creating vendor skill' });
        })
      );
    }
  }

  updateVendorSkillStatus(id: string, status: string, reviewNotes?: string): Observable<any> {
    console.log('🔄 API: Updating vendor skill status:', id, status);
    
    if (this.useMockData) {
      return of({ 
        success: true, 
        data: { 
          id, 
          status, 
          reviewNotes,
          reviewedAt: new Date().toISOString().split('T')[0]
        } 
      }).pipe(delay(500));
    } else {
      return this.http.patch(`${this.baseUrl}/vendor-skills/${id}/status`, { status, reviewNotes }, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Update vendor skill status error:', error);
          return of({ success: false, message: 'Error updating vendor skill status' });
        })
      );
    }
  }

  // Admin APIs
  getPendingApprovals(): Observable<any> {
    console.log('⏳ API: Fetching pending approvals...');
    return this.simulateApiCall('pending-approvals');
  }

  approveEntity(approvalId: string, notes?: string): Observable<any> {
    console.log('✅ API: Approving entity:', approvalId);
    
    if (this.useMockData) {
      return of({ 
        success: true, 
        data: { 
          id: approvalId, 
          status: 'approved',
          reviewNotes: notes,
          reviewedAt: new Date().toISOString()
        } 
      }).pipe(delay(500));
    } else {
      return this.http.post(`${this.baseUrl}/admin/approvals/${approvalId}/approve`, { notes }, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Approve entity error:', error);
          return of({ success: false, message: 'Error approving entity' });
        })
      );
    }
  }

  rejectEntity(approvalId: string, notes: string): Observable<any> {
    console.log('❌ API: Rejecting entity:', approvalId);
    
    if (this.useMockData) {
      return of({ 
        success: true, 
        data: { 
          id: approvalId, 
          status: 'rejected',
          reviewNotes: notes,
          reviewedAt: new Date().toISOString()
        } 
      }).pipe(delay(500));
    } else {
      return this.http.post(`${this.baseUrl}/admin/approvals/${approvalId}/reject`, { notes }, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Reject entity error:', error);
          return of({ success: false, message: 'Error rejecting entity' });
        })
      );
    }
  }

  getAdminSkills(): Observable<any> {
    console.log('🎯 API: Fetching admin skills...');
    return this.simulateApiCall('admin-skills');
  }

  createAdminSkill(skill: any): Observable<any> {
    console.log('➕ API: Creating admin skill:', skill.name);
    
    if (this.useMockData) {
      return of({ 
        success: true, 
        data: {
          ...skill,
          id: 'skill-' + Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } 
      }).pipe(delay(500));
    } else {
      return this.http.post(`${this.baseUrl}/admin/skills`, skill, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Create admin skill error:', error);
          return of({ success: false, message: 'Error creating admin skill' });
        })
      );
    }
  }

  updateAdminSkill(id: string, updates: any): Observable<any> {
    console.log('📝 API: Updating admin skill:', id);
    
    if (this.useMockData) {
      return of({ 
        success: true, 
        data: { 
          ...updates, 
          id,
          updatedAt: new Date().toISOString()
        } 
      }).pipe(delay(500));
    } else {
      return this.http.put(`${this.baseUrl}/admin/skills/${id}`, updates, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Update admin skill error:', error);
          return of({ success: false, message: 'Error updating admin skill' });
        })
      );
    }
  }

  deleteAdminSkill(id: string): Observable<any> {
    console.log('🗑️ API: Deleting admin skill:', id);
    
    if (this.useMockData) {
      return of({ success: true }).pipe(delay(500));
    } else {
      return this.http.delete(`${this.baseUrl}/admin/skills/${id}`, this.getHttpOptions()).pipe(
        catchError(error => {
          console.error('❌ API: Delete admin skill error:', error);
          return of({ success: false, message: 'Error deleting admin skill' });
        })
      );
    }
  }

  getPlatformStats(): Observable<any> {
    console.log('📊 API: Fetching platform stats...');
    return this.simulateApiCall('platform-stats');
  }

  getAllTransactions(): Observable<any> {
    console.log('📋 API: Fetching all transactions...');
    return this.simulateApiCall('transactions');
  }
}