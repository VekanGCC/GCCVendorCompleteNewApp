export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  company: string;
  permissions: AdminPermission[];
  createdAt: string;
  lastLogin?: string;
}

export interface AdminPermission {
  module: string;
  actions: string[];
}

export interface PendingApproval {
  id: string;
  type: 'vendor' | 'client' | 'skill';
  entityId: string;
  entityName: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  data: any;
}

export interface AdminSkill {
  id: string;
  name: string;
  category: string;
  description?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalVendors: number;
  totalClients: number;
  totalResources: number;
  totalRequirements: number;
  totalApplications: number;
  pendingApprovals: number;
  activeSkills: number;
  monthlyGrowth: {
    users: number;
    applications: number;
    placements: number;
  };
}

export interface TransactionData {
  id: string;
  type: 'application' | 'requirement' | 'resource' | 'user_registration';
  entityId: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: any;
  timestamp: string;
  status: string;
}