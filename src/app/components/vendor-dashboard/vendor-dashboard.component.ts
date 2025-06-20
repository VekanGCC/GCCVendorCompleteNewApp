import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { LayoutComponent } from '../layout/layout.component';
import { ApplicationsViewComponent } from '../applications-view/applications-view.component';
import { ResourceModalComponent } from '../modals/resource-modal/resource-modal.component';
import { ApplyResourceModalComponent } from '../modals/apply-resource-modal/apply-resource-modal.component';
import { AddUserModalComponent } from '../modals/add-user-modal/add-user-modal.component';
import { AddSkillModalComponent } from '../modals/add-skill-modal/add-skill-modal.component';
import { AuthService } from '../../services/auth.service';
import { AppService } from '../../services/app.service';
import { VendorManagementService } from '../../services/vendor-management.service';
import { Resource } from '../../models/resource.model';
import { Requirement } from '../../models/requirement.model';
import { Application } from '../../models/application.model';
import { VendorUser } from '../../models/vendor-user.model';
import { VendorSkill } from '../../models/vendor-skill.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule, 
    LayoutComponent,
    ApplicationsViewComponent,
    ResourceModalComponent,
    ApplyResourceModalComponent,
    AddUserModalComponent,
    AddSkillModalComponent
  ],
  templateUrl: './vendor-dashboard.component.html',
  styleUrls: ['./vendor-dashboard.component.css']
})
export class VendorDashboardComponent implements OnInit {
  user: User | null = null;
  resources: Resource[] = [];
  requirements: Requirement[] = [];
  applications: Application[] = [];
  vendorUsers: VendorUser[] = [];
  vendorSkills: VendorSkill[] = [];
  
  showResourceModal = false;
  showApplyModal = false;
  showAddUserModal = false;
  showAddSkillModal = false;
  selectedRequirementId = '';
  activeTab: 'overview' | 'resources' | 'requirements' | 'applications' | 'user-management' | 'skill-management' = 'overview';
  showVendorManagementDropdown = false;

  vendorResources: Resource[] = [];
  vendorApplications: Application[] = [];
  organizationUsers: VendorUser[] = [];
  organizationSkills: VendorSkill[] = [];

  stats = [
    {
      title: 'My Resources',
      value: 0,
      icon: 'users',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Available Opportunities',
      value: 0,
      icon: 'briefcase',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Active Applications',
      value: 0,
      icon: 'trending-up',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Placements',
      value: 0,
      icon: 'check-circle',
      color: 'text-teal-600',
      bg: 'bg-teal-50'
    }
  ];

  constructor(
    private authService: AuthService,
    private appService: AppService,
    private vendorManagementService: VendorManagementService
  ) {}

  ngOnInit(): void {
    console.log('🔄 VendorDashboard: Initializing...');
    
    this.authService.user$.subscribe(user => {
      console.log('👤 VendorDashboard: User updated:', user?.name, user?.role);
      this.user = user;
      this.updateData();
    });

    this.appService.resources$.subscribe(resources => {
      console.log('📦 VendorDashboard: Resources updated:', resources?.length || 0);
      this.resources = resources || [];
      this.updateData();
    });

    this.appService.requirements$.subscribe(requirements => {
      console.log('📋 VendorDashboard: Requirements updated:', requirements?.length || 0);
      this.requirements = requirements || [];
      this.updateData();
    });

    this.appService.applications$.subscribe(applications => {
      console.log('📊 VendorDashboard: Applications updated:', applications?.length || 0);
      this.applications = applications || [];
      this.updateData();
    });

    this.vendorManagementService.vendorUsers$.subscribe(users => {
      console.log('👥 VendorDashboard: Vendor users updated:', users?.length || 0);
      this.vendorUsers = users || [];
      this.updateData();
    });

    this.vendorManagementService.vendorSkills$.subscribe(skills => {
      console.log('🎯 VendorDashboard: Vendor skills updated:', skills?.length || 0);
      this.vendorSkills = skills || [];
      this.updateData();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.vendor-management-dropdown')) {
        this.showVendorManagementDropdown = false;
      }
    });
  }

  private updateData(): void {
    if (this.user) {
      console.log('🔄 VendorDashboard: Updating data for user:', this.user.name);
      
      // Use safe filtering with null checks
      this.vendorResources = (this.resources || []).filter(r => r && r.vendorId === this.user!.id);
      this.vendorApplications = (this.applications || []).filter(a => a && a.vendorId === this.user!.id);
      this.organizationUsers = (this.vendorUsers || []).filter(u => u && u.vendorId === this.user!.id);
      this.organizationSkills = (this.vendorSkills || []).filter(s => s && s.vendorId === this.user!.id);
      
      console.log('📊 VendorDashboard: Filtered data:', {
        vendorResources: this.vendorResources.length,
        vendorApplications: this.vendorApplications.length,
        organizationUsers: this.organizationUsers.length,
        organizationSkills: this.organizationSkills.length,
        totalRequirements: (this.requirements || []).length
      });
      
      // Update stats with safe values
      this.stats[0].value = this.vendorResources.length;
      this.stats[1].value = (this.requirements || []).length;
      this.stats[2].value = this.vendorApplications.filter(a => a && !['rejected', 'onboarded'].includes(a.status)).length;
      this.stats[3].value = this.vendorApplications.filter(a => a && a.status === 'onboarded').length;
    } else {
      console.log('⚠️ VendorDashboard: No user found');
      // Reset arrays to empty when no user
      this.vendorResources = [];
      this.vendorApplications = [];
      this.organizationUsers = [];
      this.organizationSkills = [];
    }
  }

  setActiveTab(tabId: string): void {
    console.log('🔄 VendorDashboard: Setting active tab to:', tabId);
    this.activeTab = tabId as 'overview' | 'resources' | 'requirements' | 'applications' | 'user-management' | 'skill-management';
    this.showVendorManagementDropdown = false;
  }

  toggleVendorManagementDropdown(): void {
    this.showVendorManagementDropdown = !this.showVendorManagementDropdown;
  }

  getResourceName(resourceId: string): string {
    if (!resourceId) return 'Unknown Resource';
    const resource = (this.resources || []).find(r => r && r.id === resourceId);
    return resource?.name || 'Unknown Resource';
  }

  getRequirementTitle(requirementId: string): string {
    if (!requirementId) return 'Unknown Requirement';
    const requirement = (this.requirements || []).find(r => r && r.id === requirementId);
    return requirement?.title || 'Unknown Requirement';
  }

  getFirstThreeSkills(skills: string[]): string[] {
    if (!skills || !Array.isArray(skills)) return [];
    return skills.slice(0, 3);
  }

  getAvailabilityClass(availability: string): string {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'engaged':
        return 'bg-blue-100 text-blue-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getUserRoleClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getUserStatusClass(status: string): string {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getSkillStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getProficiencyClass(level: string): string {
    switch (level) {
      case 'expert':
        return 'bg-purple-100 text-purple-800';
      case 'advanced':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusBadge(status: string): { color: string; icon: string } {
    const statusConfig: { [key: string]: { color: string; icon: string } } = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: 'clock' },
      shortlisted: { color: 'bg-blue-100 text-blue-800', icon: 'eye' },
      rejected: { color: 'bg-red-100 text-red-800', icon: 'x-circle' },
      'under-interview': { color: 'bg-purple-100 text-purple-800', icon: 'user' },
      selected: { color: 'bg-green-100 text-green-800', icon: 'check-circle' },
      onboarded: { color: 'bg-teal-100 text-teal-800', icon: 'check-circle' }
    };
    
    return statusConfig[status] || statusConfig['pending'];
  }

  handleApplyResources(requirementId: string): void {
    if (!requirementId) return;
    this.selectedRequirementId = requirementId;
    this.showApplyModal = true;
  }

  closeApplyModal(): void {
    this.showApplyModal = false;
    this.selectedRequirementId = '';
  }

  toggleUserStatus(userId: string, currentStatus: string): void {
    if (!userId) return;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    this.vendorManagementService.updateUserStatus(userId, newStatus as VendorUser['status']);
  }

  formatStatus(status: string): string {
    if (!status) return 'Unknown';
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Track by functions for *ngFor loops
  trackByTitle(index: number, item: any): any {
    return item?.title || index;
  }

  trackById(index: number, item: any): any {
    return item?.id || index;
  }

  trackByStatTitle(index: number, item: any): any {
    return item?.title || index;
  }
}