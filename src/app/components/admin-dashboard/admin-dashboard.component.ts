import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AddAdminSkillModalComponent } from '../modals/add-admin-skill-modal/add-admin-skill-modal.component';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { AppService } from '../../services/app.service';
import { VendorManagementService } from '../../services/vendor-management.service';
import { PendingApproval, AdminSkill, PlatformStats, TransactionData } from '../../models/admin.model';
import { VendorSkill } from '../../models/vendor-skill.model';
import { User } from '../../models/user.model';
import { Resource } from '../../models/resource.model';
import { Requirement } from '../../models/requirement.model';
import { Application } from '../../models/application.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    LucideAngularModule, 
    AddAdminSkillModalComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  user: User | null = null;
  activeTab: 'overview' | 'approvals' | 'skills' | 'skill-approvals' | 'transactions' | 'users' = 'overview';
  
  // Data
  pendingApprovals: PendingApproval[] = [];
  adminSkills: AdminSkill[] = [];
  vendorSkills: VendorSkill[] = [];
  platformStats: PlatformStats | null = null;
  transactions: TransactionData[] = [];
  allUsers: User[] = [];
  allResources: Resource[] = [];
  allRequirements: Requirement[] = [];
  allApplications: Application[] = [];

  // Modals
  showAddSkillModal = false;
  showApprovalModal = false;
  showRejectModal = false;
  showSkillApprovalModal = false;
  showSkillRejectModal = false;
  selectedApproval: PendingApproval | null = null;
  selectedVendorSkill: VendorSkill | null = null;
  rejectNotes = '';
  skillRejectNotes = '';

  // Filters
  approvalFilter = 'all';
  transactionFilter = 'all';
  skillFilter = 'all';
  skillApprovalFilter = 'all';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  // Computed properties for template
  navigationTabs: any[] = [];
  pendingApprovalsCount = 0;
  pendingSkillApprovalsCount = 0;
  pendingVendorSkills: VendorSkill[] = [];

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private appService: AppService,
    private vendorManagementService: VendorManagementService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (user?.role !== 'admin') {
        // Redirect non-admin users
        this.authService.logout();
      }
    });

    // Load admin data
    this.adminService.pendingApprovals$.subscribe(approvals => {
      this.pendingApprovals = approvals;
      this.updateNavigationTabs();
    });

    this.adminService.adminSkills$.subscribe(skills => {
      this.adminSkills = skills;
    });

    this.adminService.platformStats$.subscribe(stats => {
      this.platformStats = stats;
    });

    this.adminService.transactions$.subscribe(transactions => {
      this.transactions = transactions;
    });

    // Load vendor skills for approval
    this.vendorManagementService.vendorSkills$.subscribe(skills => {
      this.vendorSkills = skills;
      this.pendingVendorSkills = skills.filter(s => s.status === 'pending');
      this.updateNavigationTabs();
    });

    // Load app data
    this.appService.resources$.subscribe(resources => {
      this.allResources = resources;
    });

    this.appService.requirements$.subscribe(requirements => {
      this.allRequirements = requirements;
    });

    this.appService.applications$.subscribe(applications => {
      this.allApplications = applications;
    });

    // Load all users
    this.loadAllUsers();

    // Initialize navigation tabs
    this.updateNavigationTabs();
  }

  private async loadAllUsers(): Promise<void> {
    // In a real app, this would be an API call
    // For now, we'll use the mock data from the auth service
    this.allUsers = [
      { id: "1", email: "vendor@techcorp.com", name: "John Smith", role: "vendor", company: "TechCorp Solutions" },
      { id: "2", email: "client@innovate.com", name: "Sarah Johnson", role: "client", company: "Innovate Inc" },
      { id: "3", email: "vendor2@devstudio.com", name: "Mike Chen", role: "vendor", company: "DevStudio" },
      { id: "4", email: "client2@startup.com", name: "Emily Davis", role: "client", company: "StartupXYZ" },
      { id: "admin", email: "admin@talentbridge.com", name: "Admin User", role: "admin", company: "TalentBridge" }
    ];
  }

  private updateNavigationTabs(): void {
    this.pendingApprovalsCount = this.pendingApprovals.filter(a => a.status === 'pending').length;
    this.pendingSkillApprovalsCount = this.vendorSkills.filter(s => s.status === 'pending').length;
    
    this.navigationTabs = [
      { id: 'overview', label: 'Dashboard', icon: 'bar-chart' },
      { id: 'approvals', label: 'Pending Approvals', icon: 'clock', badge: this.pendingApprovalsCount },
      { id: 'skill-approvals', label: 'Skill Approvals', icon: 'check-circle', badge: this.pendingSkillApprovalsCount },
      { id: 'skills', label: 'Skill Management', icon: 'briefcase' },
      { id: 'transactions', label: 'All Transactions', icon: 'activity' },
      { id: 'users', label: 'User Management', icon: 'users' }
    ];
  }

  setActiveTab(tab: 'overview' | 'approvals' | 'skills' | 'skill-approvals' | 'transactions' | 'users'): void {
    this.activeTab = tab;
  }

  // Utility Methods
  getApprovalTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      vendor: 'package',
      client: 'target',
      skill: 'briefcase'
    };
    return icons[type] || 'help-circle';
  }

  getApprovalTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      vendor: 'text-blue-600 bg-blue-100',
      client: 'text-purple-600 bg-purple-100',
      skill: 'text-green-600 bg-green-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: 'text-yellow-800 bg-yellow-100',
      approved: 'text-green-800 bg-green-100',
      rejected: 'text-red-800 bg-red-100'
    };
    return colors[status] || 'text-gray-800 bg-gray-100';
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

  // Helper method to get pending vendor skills for template
  getPendingVendorSkills(): VendorSkill[] {
    return this.pendingVendorSkills.slice(0, 5);
  }

  // Helper method to check if pending vendor skills exist
  hasPendingVendorSkills(): boolean {
    return this.pendingVendorSkills.length > 0;
  }
}