export interface Resource {
  id: string;
  vendorId: string;
  vendorName: string;
  name: string;
  skills: string[];
  experience: number;
  location: string;
  availability: 'available' | 'engaged' | 'unavailable';
  rate: number;
  description: string;
  createdAt: string;
}