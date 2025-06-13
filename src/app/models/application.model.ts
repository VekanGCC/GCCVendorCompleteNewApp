export interface Application {
  id: string;
  resourceId: string;
  requirementId: string;
  vendorId: string;
  clientId: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'under-interview' | 'selected' | 'onboarded';
  appliedBy: 'vendor' | 'client';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type ApplicationStatus = Application['status'];