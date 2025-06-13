import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AdminUser, PendingApproval, AdminSkill, PlatformStats, TransactionData } from '../models/admin.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private pendingApprovalsSubject = new BehaviorSubject<PendingApproval[]>([]);
  private adminSkillsSubject = new BehaviorSubject<AdminSkill[]>([]);
  private platformStatsSubject = new BehaviorSubject<PlatformStats | null>(null);
  private transactionsSubject = new BehaviorSubject<TransactionData[]>([]);

  public pendingApprovals$ = this.pendingApprovalsSubject.asObservable();
  public adminSkills$ = this.adminSkillsSubject.asObservable();
  public platformStats$ = this.platformStatsSubject.asObservable();
  public transactions$ = this.transactionsSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    try {
      await Promise.all([
        this.loadPendingApprovals(),
        this.loadAdminSkills(),
        this.loadPlatformStats(),
        this.loadTransactions()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  }

  private async loadPendingApprovals(): Promise<void> {
    try {
      const response = await this.apiService.getPendingApprovals().toPromise();
      if (response && response.success && response.data) {
        this.pendingApprovalsSubject.next(response.data);
      } else {
        this.pendingApprovalsSubject.next([]);
      }
    } catch (error) {
      console.error('Error loading pending approvals:', error);
      this.pendingApprovalsSubject.next([]);
    }
  }

  private async loadAdminSkills(): Promise<void> {
    try {
      const response = await this.apiService.getAdminSkills().toPromise();
      if (response && response.success && response.data) {
        this.adminSkillsSubject.next(response.data);
      } else {
        this.adminSkillsSubject.next([]);
      }
    } catch (error) {
      console.error('Error loading admin skills:', error);
      this.adminSkillsSubject.next([]);
    }
  }

  private async loadPlatformStats(): Promise<void> {
    try {
      const response = await this.apiService.getPlatformStats().toPromise();
      if (response && response.success && response.data) {
        this.platformStatsSubject.next(response.data);
      } else {
        this.platformStatsSubject.next(null);
      }
    } catch (error) {
      console.error('Error loading platform stats:', error);
      this.platformStatsSubject.next(null);
    }
  }

  private async loadTransactions(): Promise<void> {
    try {
      const response = await this.apiService.getAllTransactions().toPromise();
      if (response && response.success && response.data) {
        this.transactionsSubject.next(response.data);
      } else {
        this.transactionsSubject.next([]);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      this.transactionsSubject.next([]);
    }
  }

  async approveEntity(approvalId: string, notes?: string): Promise<void> {
    try {
      const response = await this.apiService.approveEntity(approvalId, notes).toPromise();
      if (response.success) {
        const currentApprovals = this.pendingApprovalsSubject.value;
        const updatedApprovals = currentApprovals.map(approval => 
          approval.id === approvalId 
            ? { ...approval, status: 'approved' as const, reviewNotes: notes, reviewedAt: new Date().toISOString() }
            : approval
        );
        this.pendingApprovalsSubject.next(updatedApprovals);
        await this.loadPlatformStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error approving entity:', error);
      throw error;
    }
  }

  async rejectEntity(approvalId: string, notes: string): Promise<void> {
    try {
      const response = await this.apiService.rejectEntity(approvalId, notes).toPromise();
      if (response.success) {
        const currentApprovals = this.pendingApprovalsSubject.value;
        const updatedApprovals = currentApprovals.map(approval => 
          approval.id === approvalId 
            ? { ...approval, status: 'rejected' as const, reviewNotes: notes, reviewedAt: new Date().toISOString() }
            : approval
        );
        this.pendingApprovalsSubject.next(updatedApprovals);
      }
    } catch (error) {
      console.error('Error rejecting entity:', error);
      throw error;
    }
  }

  async addAdminSkill(skillData: Omit<AdminSkill, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const response = await this.apiService.createAdminSkill(skillData).toPromise();
      if (response.success) {
        const currentSkills = this.adminSkillsSubject.value;
        this.adminSkillsSubject.next([...currentSkills, response.data]);
      }
    } catch (error) {
      console.error('Error adding admin skill:', error);
      throw error;
    }
  }

  async updateAdminSkill(skillId: string, updates: Partial<AdminSkill>): Promise<void> {
    try {
      const response = await this.apiService.updateAdminSkill(skillId, updates).toPromise();
      if (response.success) {
        const currentSkills = this.adminSkillsSubject.value;
        const updatedSkills = currentSkills.map(skill => 
          skill.id === skillId ? { ...skill, ...updates, updatedAt: new Date().toISOString() } : skill
        );
        this.adminSkillsSubject.next(updatedSkills);
      }
    } catch (error) {
      console.error('Error updating admin skill:', error);
      throw error;
    }
  }

  async deleteAdminSkill(skillId: string): Promise<void> {
    try {
      const response = await this.apiService.deleteAdminSkill(skillId).toPromise();
      if (response.success) {
        const currentSkills = this.adminSkillsSubject.value;
        const updatedSkills = currentSkills.filter(skill => skill.id !== skillId);
        this.adminSkillsSubject.next(updatedSkills);
      }
    } catch (error) {
      console.error('Error deleting admin skill:', error);
      throw error;
    }
  }

  getSkillCategories(): string[] {
    return [
      'Programming Languages',
      'Frameworks & Libraries',
      'Databases',
      'Cloud Platforms',
      'DevOps & Tools',
      'Mobile Development',
      'Web Development',
      'Data Science & Analytics',
      'Cybersecurity',
      'Project Management',
      'Design & UX',
      'Quality Assurance',
      'Other'
    ];
  }

  get pendingApprovals(): PendingApproval[] {
    return this.pendingApprovalsSubject.value;
  }

  get adminSkills(): AdminSkill[] {
    return this.adminSkillsSubject.value;
  }

  get platformStats(): PlatformStats | null {
    return this.platformStatsSubject.value;
  }

  get transactions(): TransactionData[] {
    return this.transactionsSubject.value;
  }
}