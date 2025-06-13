import { Component, OnInit } from '@angular/core';
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

  // Approval Management
  openApprovalModal(approval: PendingApproval): void {
    this.selectedApproval = approval;
    this.showApprovalModal = true;
  }

  closeApprovalModal(): void {
    this.showApprovalModal = false;
    this.selectedApproval = null;
  }

  openRejectModal(approval: PendingApproval): void {
    this.selectedApproval = approval;
    this.showRejectModal = true;
    this.rejectNotes = '';
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedApproval = null;
    this.rejectNotes = '';
  }

  async approveEntity(approval: PendingApproval): Promise<void> {
    try {
      await this.adminService.approveEntity(approval.id);
      this.closeApprovalModal();
    } catch (error) {
      console.error('Error approving entity:', error);
    }
  }

  async rejectEntity(): Promise<void> {
    if (!this.selectedApproval || !this.rejectNotes.trim()) return;

    try {
      await this.adminService.rejectEntity(this.selectedApproval.id, this.rejectNotes);
      this.closeRejectModal();
    } catch (error) {
      console.error('Error rejecting entity:', error);
    }
  }

  // Vendor Skill Approval Management
  openSkillApprovalModal(skill: VendorSkill): void {
    this.selectedVendorSkill = skill;
    this.showSkillApprovalModal = true;
  }

  closeSkillApprovalModal(): void {
    this.showSkillApprovalModal = false;
    this.selectedVendorSkill = null;
  }

  openSkillRejectModal(skill: VendorSkill): void {
    this.selectedVendorSkill = skill;
    this.showSkillRejectModal = true;
    this.skillRejectNotes = '';
  }

  closeSkillRejectModal(): void {
    this.showSkillRejectModal = false;
    this.selectedVendorSkill = null;
    this.skillRejectNotes = '';
  }

  async approveVendorSkill(skill: VendorSkill): Promise<void> {
    try {
      await this.vendorManagementService.updateSkillStatus(skill.id, 'approved', 'Skill approved by admin');
      this.closeSkillApprovalModal();
    } catch (error) {
      console.error('Error approving vendor skill:', error);
    }
  }

  async rejectVendorSkill(): Promise<void> {
    if (!this.selectedVendorSkill || !this.skillRejectNotes.trim()) return;

    try {
      await this.vendorManagementService.updateSkillStatus(
        this.selectedVendorSkill.id, 
        'rejected', 
        this.skillRejectNotes
      );
      this.closeSkillRejectModal();
    } catch (error) {
      console.error('Error rejecting vendor skill:', error);
    }
  }

  // Skill Management
  async toggleSkillStatus(skill: AdminSkill): Promise<void> {
    try {
      await this.adminService.updateAdminSkill(skill.id, { isActive: !skill.isActive });
    } catch (error) {
      console.error('Error toggling skill status:', error);
    }
  }

  async deleteSkill(skillId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this skill? This action cannot be undone.')) {
      try {
        await this.adminService.deleteAdminSkill(skillId);
      } catch (error) {
        console.error('Error deleting skill:', error);
      }
    }
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

  getTransactionTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      application: 'trending-up',
      requirement: 'briefcase',
      resource: 'users',
      user_registration: 'user-plus'
    };
    return icons[type] || 'activity';
  }

  formatTransactionType(type: string): string {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getFilteredApprovals(): PendingApproval[] {
    if (this.approvalFilter === 'all') {
      return this.pendingApprovals;
    }
    return this.pendingApprovals.filter(approval => approval.type === this.approvalFilter);
  }

  getFilteredTransactions(): TransactionData[] {
    if (this.transactionFilter === 'all') {
      return this.transactions;
    }
    return this.transactions.filter(transaction => transaction.type === this.transactionFilter);
  }

  getFilteredSkills(): AdminSkill[] {
    if (this.skillFilter === 'all') {
      return this.adminSkills;
    }
    return this.adminSkills.filter(skill => skill.category === this.skillFilter);
  }

  getFilteredVendorSkills(): VendorSkill[] {
    if (this.skillApprovalFilter === 'all') {
      return this.vendorSkills;
    }
    return this.vendorSkills.filter(skill => skill.status === this.skillApprovalFilter);
  }

  getPaginatedItems<T>(items: T[]): T[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return items.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getTotalPages<T>(items: T[]): number {
    return Math.ceil(items.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  getSkillCategories(): string[] {
    return this.adminService.getSkillCategories();
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

  getVendorName(vendorId: string): string {
    const user = this.allUsers.find(u => u.id === vendorId);
    return user ? user.company : 'Unknown Vendor';
  }

  // Helper methods for user management
  getUserResourceCount(user: User): number {
    return this.allResources.filter(r => r.vendorId === user.id).length;
  }

  getUserRequirementCount(user: User): number {
    return this.allRequirements.filter(r => r.clientId === user.id).length;
  }

  getUserVendorApplicationCount(user: User): number {
    return this.allApplications.filter(a => a.vendorId === user.id).length;
  }

  getUserClientApplicationCount(user: User): number {
    return this.allApplications.filter(a => a.clientId === user.id).length;
  }

  // Stats calculations
  getGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  isGrowthPositive(growth: number): boolean {
    return growth > 0;
  }

  // Check if reject notes are valid
  isRejectNotesValid(): boolean {
    return this.rejectNotes.trim().length > 0;
  }

  isSkillRejectNotesValid(): boolean {
    return this.skillRejectNotes.trim().length > 0;
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