export interface Requirement {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  skills: string[];
  experience: number;
  location: string;
  duration: string;
  budget: number;
  description: string;
  status: 'open' | 'in-progress' | 'closed';
  createdAt: string;
}