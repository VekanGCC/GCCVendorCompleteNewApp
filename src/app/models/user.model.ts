export interface User {
  id: string;
  email: string;
  name: string;
  role: 'vendor' | 'client' | 'admin';
  company: string;
}