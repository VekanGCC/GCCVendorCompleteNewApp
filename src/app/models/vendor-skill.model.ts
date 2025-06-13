export interface VendorSkill {
  id: string;
  vendorId: string;
  skillName: string;
  category: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}