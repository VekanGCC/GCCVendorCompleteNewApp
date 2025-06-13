import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Mock users data - these are the demo accounts
const mockUsers = [
  {
    "id": "1",
    "email": "vendor@techcorp.com",
    "name": "John Smith",
    "role": "vendor",
    "company": "TechCorp Solutions"
  },
  {
    "id": "2",
    "email": "client@innovate.com",
    "name": "Sarah Johnson",
    "role": "client",
    "company": "Innovate Inc"
  },
  {
    "id": "3",
    "email": "vendor2@devstudio.com",
    "name": "Mike Chen",
    "role": "vendor",
    "company": "DevStudio"
  },
  {
    "id": "4",
    "email": "client2@startup.com",
    "name": "Emily Davis",
    "role": "client",
    "company": "StartupXYZ"
  },
  {
    "id": "admin",
    "email": "admin@talentbridge.com",
    "name": "Admin User",
    "role": "admin",
    "company": "TalentBridge"
  }
];

const mockResources = [
  {
    "id": "1",
    "vendorId": "1",
    "vendorName": "TechCorp Solutions",
    "name": "Alex Rodriguez",
    "skills": ["React", "Node.js", "TypeScript", "AWS", "MongoDB"],
    "experience": 5,
    "location": "Remote",
    "availability": "available",
    "rate": 75,
    "description": "Senior full-stack developer with expertise in modern web technologies and cloud platforms",
    "createdAt": "2024-01-15"
  },
  {
    "id": "2",
    "vendorId": "3",
    "vendorName": "DevStudio",
    "name": "Maria Garcia",
    "skills": ["Python", "Django", "PostgreSQL", "Docker", "Kubernetes"],
    "experience": 4,
    "location": "New York",
    "availability": "available",
    "rate": 70,
    "description": "Backend developer specializing in Python and database optimization with DevOps experience",
    "createdAt": "2024-01-16"
  },
  {
    "id": "3",
    "vendorId": "1",
    "vendorName": "TechCorp Solutions",
    "name": "David Kim",
    "skills": ["Java", "Spring Boot", "Microservices", "Kubernetes", "Redis"],
    "experience": 6,
    "location": "San Francisco",
    "availability": "available",
    "rate": 80,
    "description": "Enterprise Java developer with microservices architecture and distributed systems experience",
    "createdAt": "2024-01-17"
  },
  {
    "id": "4",
    "vendorId": "3",
    "vendorName": "DevStudio",
    "name": "Sarah Chen",
    "skills": ["React", "Vue.js", "JavaScript", "CSS", "Figma"],
    "experience": 3,
    "location": "Remote",
    "availability": "available",
    "rate": 65,
    "description": "Frontend developer with strong design skills and experience in modern JavaScript frameworks",
    "createdAt": "2024-01-18"
  },
  {
    "id": "5",
    "vendorId": "1",
    "vendorName": "TechCorp Solutions",
    "name": "Michael Thompson",
    "skills": ["Angular", "TypeScript", "RxJS", "NgRx", "Jest"],
    "experience": 7,
    "location": "Austin",
    "availability": "engaged",
    "rate": 85,
    "description": "Senior Angular developer with expertise in complex enterprise applications and state management",
    "createdAt": "2024-01-19"
  },
  {
    "id": "6",
    "vendorId": "3",
    "vendorName": "DevStudio",
    "name": "Jennifer Liu",
    "skills": ["PHP", "Laravel", "MySQL", "Vue.js", "AWS"],
    "experience": 4,
    "location": "Chicago",
    "availability": "available",
    "rate": 68,
    "description": "Full-stack PHP developer with experience in Laravel framework and modern frontend technologies",
    "createdAt": "2024-01-20"
  }
];

const mockRequirements = [
  {
    "id": "1",
    "clientId": "2",
    "clientName": "Innovate Inc",
    "title": "Senior React Developer",
    "skills": ["React", "TypeScript", "Redux", "Testing", "AWS"],
    "experience": 4,
    "location": "Remote",
    "duration": "6 months",
    "budget": 80,
    "description": "Looking for a senior React developer to lead our frontend team and modernize our web application architecture",
    "status": "open",
    "createdAt": "2024-01-18"
  },
  {
    "id": "2",
    "clientId": "4",
    "clientName": "StartupXYZ",
    "title": "Full Stack Developer",
    "skills": ["Node.js", "React", "MongoDB", "AWS", "Docker"],
    "experience": 3,
    "location": "Austin",
    "duration": "12 months",
    "budget": 70,
    "description": "Full stack developer needed for MVP development of our SaaS platform with modern tech stack",
    "status": "open",
    "createdAt": "2024-01-19"
  },
  {
    "id": "3",
    "clientId": "2",
    "clientName": "Innovate Inc",
    "title": "Backend Python Developer",
    "skills": ["Python", "Django", "PostgreSQL", "Redis", "Docker"],
    "experience": 4,
    "location": "New York",
    "duration": "8 months",
    "budget": 75,
    "description": "Experienced Python developer to build scalable backend services for our data analytics platform",
    "status": "open",
    "createdAt": "2024-01-20"
  },
  {
    "id": "4",
    "clientId": "4",
    "clientName": "StartupXYZ",
    "title": "Frontend Vue.js Developer",
    "skills": ["Vue.js", "JavaScript", "CSS", "Vuex", "Nuxt.js"],
    "experience": 3,
    "location": "Remote",
    "duration": "4 months",
    "budget": 65,
    "description": "Vue.js developer to create responsive user interfaces for our customer-facing web application",
    "status": "open",
    "createdAt": "2024-01-21"
  },
  {
    "id": "5",
    "clientId": "2",
    "clientName": "Innovate Inc",
    "title": "Enterprise Java Developer",
    "skills": ["Java", "Spring Boot", "Microservices", "Kubernetes", "Oracle"],
    "experience": 6,
    "location": "San Francisco",
    "duration": "10 months",
    "budget": 85,
    "description": "Senior Java developer for enterprise-grade microservices architecture and legacy system modernization",
    "status": "open",
    "createdAt": "2024-01-22"
  },
  {
    "id": "6",
    "clientId": "4",
    "clientName": "StartupXYZ",
    "title": "PHP Laravel Developer",
    "skills": ["PHP", "Laravel", "MySQL", "Vue.js", "Redis"],
    "experience": 4,
    "location": "Chicago",
    "duration": "6 months",
    "budget": 68,
    "description": "Laravel developer to maintain and enhance our existing e-commerce platform with new features",
    "status": "open",
    "createdAt": "2024-01-23"
  }
];

const mockApplications = [
  {
    "id": "1",
    "resourceId": "1",
    "requirementId": "1",
    "vendorId": "1",
    "clientId": "2",
    "status": "shortlisted",
    "appliedBy": "client",
    "createdAt": "2024-01-20",
    "updatedAt": "2024-01-21",
    "notes": "Great match for React skills and AWS experience"
  },
  {
    "id": "2",
    "resourceId": "2",
    "requirementId": "3",
    "vendorId": "3",
    "clientId": "2",
    "status": "under-interview",
    "appliedBy": "vendor",
    "createdAt": "2024-01-21",
    "updatedAt": "2024-01-22",
    "notes": "Perfect Python and Django background"
  },
  {
    "id": "3",
    "resourceId": "3",
    "requirementId": "5",
    "vendorId": "1",
    "clientId": "2",
    "status": "selected",
    "appliedBy": "client",
    "createdAt": "2024-01-22",
    "updatedAt": "2024-01-23",
    "notes": "Excellent Java and microservices experience"
  },
  {
    "id": "4",
    "resourceId": "4",
    "requirementId": "4",
    "vendorId": "3",
    "clientId": "4",
    "status": "pending",
    "appliedBy": "vendor",
    "createdAt": "2024-01-23",
    "updatedAt": "2024-01-23",
    "notes": "Strong Vue.js skills and design background"
  },
  {
    "id": "5",
    "resourceId": "6",
    "requirementId": "6",
    "vendorId": "3",
    "clientId": "4",
    "status": "shortlisted",
    "appliedBy": "client",
    "createdAt": "2024-01-24",
    "updatedAt": "2024-01-24",
    "notes": "Good Laravel experience and location match"
  }
];

const mockVendorUsers = [
  {
    "id": "1",
    "vendorId": "1",
    "name": "John Smith",
    "email": "john.smith@techcorp.com",
    "role": "admin",
    "department": "Management",
    "phone": "+1 (555) 123-4567",
    "status": "active",
    "createdAt": "2024-01-10",
    "createdBy": "System"
  },
  {
    "id": "2",
    "vendorId": "1",
    "name": "Sarah Wilson",
    "email": "sarah.wilson@techcorp.com",
    "role": "manager",
    "department": "Engineering",
    "phone": "+1 (555) 234-5678",
    "status": "active",
    "createdAt": "2024-01-12",
    "createdBy": "John Smith"
  },
  {
    "id": "3",
    "vendorId": "1",
    "name": "Mike Johnson",
    "email": "mike.johnson@techcorp.com",
    "role": "user",
    "department": "Engineering",
    "phone": "+1 (555) 345-6789",
    "status": "active",
    "createdAt": "2024-01-15",
    "createdBy": "Sarah Wilson"
  },
  {
    "id": "4",
    "vendorId": "3",
    "name": "Mike Chen",
    "email": "mike.chen@devstudio.com",
    "role": "admin",
    "department": "Management",
    "phone": "+1 (555) 456-7890",
    "status": "active",
    "createdAt": "2024-01-08",
    "createdBy": "System"
  },
  {
    "id": "5",
    "vendorId": "1",
    "name": "Lisa Anderson",
    "email": "lisa.anderson@techcorp.com",
    "role": "manager",
    "department": "Sales",
    "phone": "+1 (555) 567-8901",
    "status": "active",
    "createdAt": "2024-01-14",
    "createdBy": "John Smith"
  },
  {
    "id": "6",
    "vendorId": "3",
    "name": "Robert Taylor",
    "email": "robert.taylor@devstudio.com",
    "role": "user",
    "department": "Engineering",
    "phone": "+1 (555) 678-9012",
    "status": "inactive",
    "createdAt": "2024-01-16",
    "createdBy": "Mike Chen"
  }
];

const mockVendorSkills = [
  {
    "id": "1",
    "vendorId": "1",
    "skillName": "React",
    "category": "Frameworks & Libraries",
    "proficiencyLevel": "expert",
    "description": "Extensive experience building complex React applications with hooks, context, and state management",
    "status": "approved",
    "submittedBy": "John Smith",
    "submittedAt": "2024-01-10",
    "reviewedBy": "Admin",
    "reviewedAt": "2024-01-11",
    "reviewNotes": "Approved - Strong portfolio and experience demonstrated"
  },
  {
    "id": "2",
    "vendorId": "1",
    "skillName": "Node.js",
    "category": "Programming Languages",
    "proficiencyLevel": "advanced",
    "description": "Backend development with Express, API design, and microservices architecture",
    "status": "approved",
    "submittedBy": "John Smith",
    "submittedAt": "2024-01-10",
    "reviewedBy": "Admin",
    "reviewedAt": "2024-01-11"
  },
  {
    "id": "3",
    "vendorId": "1",
    "skillName": "Kubernetes",
    "category": "DevOps & Tools",
    "proficiencyLevel": "intermediate",
    "description": "Container orchestration and deployment automation",
    "status": "pending",
    "submittedBy": "Sarah Wilson",
    "submittedAt": "2024-01-20"
  },
  {
    "id": "4",
    "vendorId": "3",
    "skillName": "Python",
    "category": "Programming Languages",
    "proficiencyLevel": "expert",
    "description": "Full-stack Python development with Django, Flask, and data science libraries",
    "status": "approved",
    "submittedBy": "Mike Chen",
    "submittedAt": "2024-01-12",
    "reviewedBy": "Admin",
    "reviewedAt": "2024-01-13"
  },
  {
    "id": "5",
    "vendorId": "1",
    "skillName": "GraphQL",
    "category": "Web Development",
    "proficiencyLevel": "intermediate",
    "description": "API development and client-side integration",
    "status": "rejected",
    "submittedBy": "Mike Johnson",
    "submittedAt": "2024-01-18",
    "reviewedBy": "Admin",
    "reviewedAt": "2024-01-19",
    "reviewNotes": "Insufficient experience demonstrated - please provide more portfolio examples"
  },
  {
    "id": "6",
    "vendorId": "3",
    "skillName": "Machine Learning",
    "category": "Data Science & Analytics",
    "proficiencyLevel": "advanced",
    "description": "Experience with TensorFlow, PyTorch, and scikit-learn for building ML models",
    "status": "pending",
    "submittedBy": "Robert Taylor",
    "submittedAt": "2024-01-22"
  },
  {
    "id": "7",
    "vendorId": "1",
    "skillName": "AWS Lambda",
    "category": "Cloud Platforms",
    "proficiencyLevel": "advanced",
    "description": "Serverless architecture design and implementation using AWS Lambda",
    "status": "pending",
    "submittedBy": "Lisa Anderson",
    "submittedAt": "2024-01-24"
  }
];

// Mock Admin Data
const mockPendingApprovals = [
  {
    "id": "approval-1",
    "type": "vendor",
    "entityId": "1",
    "entityName": "TechCorp Solutions",
    "submittedBy": "John Smith",
    "submittedAt": "2024-01-10",
    "status": "pending",
    "data": {
      "companyName": "TechCorp Solutions",
      "email": "vendor@techcorp.com",
      "contactPerson": "John Smith",
      "gstNumber": "29ABCDE1234F1Z5"
    }
  },
  {
    "id": "approval-2",
    "type": "client",
    "entityId": "2",
    "entityName": "Innovate Inc",
    "submittedBy": "Sarah Johnson",
    "submittedAt": "2024-01-12",
    "status": "pending",
    "data": {
      "companyName": "Innovate Inc",
      "email": "client@innovate.com",
      "contactPerson": "Sarah Johnson",
      "gstNumber": "27FGHIJ5678K2L9"
    }
  },
  {
    "id": "approval-3",
    "type": "skill",
    "entityId": "3",
    "entityName": "Kubernetes",
    "submittedBy": "Sarah Wilson",
    "submittedAt": "2024-01-20",
    "status": "pending",
    "data": {
      "skillName": "Kubernetes",
      "category": "DevOps & Tools",
      "proficiencyLevel": "intermediate",
      "description": "Container orchestration and deployment automation"
    }
  }
];

const mockAdminSkills = [
  {
    "id": "skill-1",
    "name": "React",
    "category": "Frameworks & Libraries",
    "description": "A JavaScript library for building user interfaces",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  },
  {
    "id": "skill-2",
    "name": "Node.js",
    "category": "Programming Languages",
    "description": "JavaScript runtime built on Chrome's V8 JavaScript engine",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  },
  {
    "id": "skill-3",
    "name": "Python",
    "category": "Programming Languages",
    "description": "High-level programming language for general-purpose programming",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  },
  {
    "id": "skill-4",
    "name": "AWS",
    "category": "Cloud Platforms",
    "description": "Amazon Web Services cloud computing platform",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  },
  {
    "id": "skill-5",
    "name": "Docker",
    "category": "DevOps & Tools",
    "description": "Platform for developing, shipping, and running applications in containers",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  },
  {
    "id": "skill-6",
    "name": "TypeScript",
    "category": "Programming Languages",
    "description": "Typed superset of JavaScript that compiles to plain JavaScript",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  },
  {
    "id": "skill-7",
    "name": "Java",
    "category": "Programming Languages",
    "description": "Object-oriented programming language",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  },
  {
    "id": "skill-8",
    "name": "Spring Boot",
    "category": "Frameworks & Libraries",
    "description": "Java-based framework for building microservices",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  },
  {
    "id": "skill-9",
    "name": "Django",
    "category": "Frameworks & Libraries",
    "description": "High-level Python web framework",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  },
  {
    "id": "skill-10",
    "name": "Vue.js",
    "category": "Frameworks & Libraries",
    "description": "Progressive JavaScript framework for building user interfaces",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  },
  {
    "id": "skill-11",
    "name": "Angular",
    "category": "Frameworks & Libraries",
    "description": "Platform for building mobile and desktop web applications",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  },
  {
    "id": "skill-12",
    "name": "MongoDB",
    "category": "Databases",
    "description": "Document-oriented NoSQL database",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  },
  {
    "id": "skill-13",
    "name": "PostgreSQL",
    "category": "Databases",
    "description": "Open source relational database",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  },
  {
    "id": "skill-14",
    "name": "MySQL",
    "category": "Databases",
    "description": "Open source relational database management system",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  },
  {
    "id": "skill-15",
    "name": "Kubernetes",
    "category": "DevOps & Tools",
    "description": "Container orchestration platform",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  },
  {
    "id": "skill-16",
    "name": "Redis",
    "category": "Databases",
    "description": "In-memory data structure store",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  },
  {
    "id": "skill-17",
    "name": "Laravel",
    "category": "Frameworks & Libraries",
    "description": "PHP web application framework",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  },
  {
    "id": "skill-18",
    "name": "PHP",
    "category": "Programming Languages",
    "description": "Server-side scripting language",
    "isActive": true,
    "createdBy": "Admin User",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-01"
  }
];

const mockPlatformStats = {
  "totalUsers": 5,
  "totalVendors": 2,
  "totalClients": 2,
  "totalResources": 6,
  "totalRequirements": 6,
  "totalApplications": 5,
  "pendingApprovals": 3,
  "activeSkills": 18,
  "monthlyGrowth": {
    "users": 25,
    "applications": 40,
    "placements": 15
  }
};

const mockTransactions = [
  {
    "id": "txn-1",
    "type": "application",
    "entityId": "1",
    "userId": "1",
    "userName": "John Smith",
    "userRole": "vendor",
    "action": "Applied resource to requirement",
    "details": { "resourceId": "1", "requirementId": "1" },
    "timestamp": "2024-01-20T10:30:00Z",
    "status": "completed"
  },
  {
    "id": "txn-2",
    "type": "requirement",
    "entityId": "1",
    "userId": "2",
    "userName": "Sarah Johnson",
    "userRole": "client",
    "action": "Posted new requirement",
    "details": { "title": "Senior React Developer" },
    "timestamp": "2024-01-18T14:15:00Z",
    "status": "completed"
  },
  {
    "id": "txn-3",
    "type": "resource",
    "entityId": "1",
    "userId": "1",
    "userName": "John Smith",
    "userRole": "vendor",
    "action": "Added new resource",
    "details": { "name": "Alex Rodriguez" },
    "timestamp": "2024-01-15T09:45:00Z",
    "status": "completed"
  },
  {
    "id": "txn-4",
    "type": "user_registration",
    "entityId": "1",
    "userId": "1",
    "userName": "John Smith",
    "userRole": "vendor",
    "action": "Completed vendor registration",
    "details": { "company": "TechCorp Solutions" },
    "timestamp": "2024-01-10T16:20:00Z",
    "status": "pending"
  },
  {
    "id": "txn-5",
    "type": "application",
    "entityId": "2",
    "userId": "3",
    "userName": "Mike Chen",
    "userRole": "vendor",
    "action": "Applied resource to requirement",
    "details": { "resourceId": "2", "requirementId": "3" },
    "timestamp": "2024-01-21T11:20:00Z",
    "status": "completed"
  },
  {
    "id": "txn-6",
    "type": "requirement",
    "entityId": "2",
    "userId": "4",
    "userName": "Emily Davis",
    "userRole": "client",
    "action": "Posted new requirement",
    "details": { "title": "Full Stack Developer" },
    "timestamp": "2024-01-19T16:30:00Z",
    "status": "completed"
  },
  {
    "id": "txn-7",
    "type": "user_registration",
    "entityId": "2",
    "userId": "2",
    "userName": "Sarah Johnson",
    "userRole": "client",
    "action": "Completed client registration",
    "details": { "company": "Innovate Inc" },
    "timestamp": "2024-01-12T10:15:00Z",
    "status": "pending"
  },
  {
    "id": "txn-8",
    "type": "application",
    "entityId": "3",
    "userId": "2",
    "userName": "Sarah Johnson",
    "userRole": "client",
    "action": "Updated application status to selected",
    "details": { "resourceId": "3", "requirementId": "5", "status": "selected" },
    "timestamp": "2024-01-23T09:45:00Z",
    "status": "completed"
  }
];

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  private useMockData = true; // Always use mock data for WebContainer compatibility

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getAuthToken()}`
    })
  };

  constructor(private http: HttpClient) {}

  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  private simulateApiCall<T>(mockData: T, delay_ms: number = 500): Observable<T> {
    return of(mockData).pipe(delay(delay_ms));
  }

  // Authentication APIs
  login(credentials: { email: string; password: string }): Observable<any> {
    console.log('🔐 API: Login attempt for:', credentials.email);
    
    // Find user by email
    const user = mockUsers.find((u: any) => u.email.toLowerCase() === credentials.email.toLowerCase());
    
    if (user && credentials.password === 'demo123') {
      const response = {
        success: true,
        user: user,
        token: 'mock-jwt-token-' + user.id + '-' + Date.now()
      };
      console.log('✅ API: Login successful for:', user.name, '(' + user.role + ')');
      return this.simulateApiCall(response);
    } else {
      console.log('❌ API: Login failed - invalid credentials for:', credentials.email);
      return this.simulateApiCall({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
  }

  logout(): Observable<any> {
    console.log('🚪 API: Logout successful');
    return this.simulateApiCall({ success: true });
  }

  // User APIs
  getUsers(): Observable<any> {
    console.log('👥 API: Fetching users...');
    return this.simulateApiCall({ success: true, data: mockUsers });
  }

  // Resource APIs
  getResources(): Observable<any> {
    console.log('🧑‍💼 API: Fetching resources...');
    return this.simulateApiCall({ success: true, data: mockResources });
  }

  createResource(resource: any): Observable<any> {
    console.log('➕ API: Creating resource:', resource.name);
    const newResource = {
      ...resource,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    return this.simulateApiCall({ success: true, data: newResource });
  }

  updateResource(id: string, resource: any): Observable<any> {
    console.log('📝 API: Updating resource:', id);
    return this.simulateApiCall({ success: true, data: { ...resource, id } });
  }

  deleteResource(id: string): Observable<any> {
    console.log('🗑️ API: Deleting resource:', id);
    return this.simulateApiCall({ success: true });
  }

  // Requirement APIs
  getRequirements(): Observable<any> {
    console.log('📋 API: Fetching requirements...');
    return this.simulateApiCall({ success: true, data: mockRequirements });
  }

  createRequirement(requirement: any): Observable<any> {
    console.log('➕ API: Creating requirement:', requirement.title);
    const newRequirement = {
      ...requirement,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    return this.simulateApiCall({ success: true, data: newRequirement });
  }

  updateRequirement(id: string, requirement: any): Observable<any> {
    console.log('📝 API: Updating requirement:', id);
    return this.simulateApiCall({ success: true, data: { ...requirement, id } });
  }

  updateRequirementStatus(id: string, status: string): Observable<any> {
    console.log('🔄 API: Updating requirement status:', id, status);
    return this.simulateApiCall({ success: true, data: { id, status } });
  }

  // Application APIs
  getApplications(): Observable<any> {
    console.log('📊 API: Fetching applications...');
    return this.simulateApiCall({ success: true, data: mockApplications });
  }

  createApplication(application: any): Observable<any> {
    console.log('➕ API: Creating application...');
    const newApplication = {
      ...application,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    return this.simulateApiCall({ success: true, data: newApplication });
  }

  updateApplicationStatus(id: string, status: string, notes?: string): Observable<any> {
    console.log('🔄 API: Updating application status:', id, status);
    return this.simulateApiCall({ 
      success: true, 
      data: { 
        id, 
        status, 
        notes,
        updatedAt: new Date().toISOString().split('T')[0]
      } 
    });
  }

  // Vendor User APIs
  getVendorUsers(): Observable<any> {
    console.log('👥 API: Fetching vendor users...');
    return this.simulateApiCall({ success: true, data: mockVendorUsers });
  }

  createVendorUser(user: any): Observable<any> {
    console.log('➕ API: Creating vendor user:', user.name);
    const newUser = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    return this.simulateApiCall({ success: true, data: newUser });
  }

  updateVendorUserStatus(id: string, status: string): Observable<any> {
    console.log('🔄 API: Updating vendor user status:', id, status);
    return this.simulateApiCall({ success: true, data: { id, status } });
  }

  // Vendor Skill APIs
  getVendorSkills(): Observable<any> {
    console.log('🎯 API: Fetching vendor skills...');
    return this.simulateApiCall({ success: true, data: mockVendorSkills });
  }

  createVendorSkill(skill: any): Observable<any> {
    console.log('➕ API: Creating vendor skill:', skill.skillName);
    const newSkill = {
      ...skill,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString().split('T')[0]
    };
    return this.simulateApiCall({ success: true, data: newSkill });
  }

  updateVendorSkillStatus(id: string, status: string, reviewNotes?: string): Observable<any> {
    console.log('🔄 API: Updating vendor skill status:', id, status);
    return this.simulateApiCall({ 
      success: true, 
      data: { 
        id, 
        status, 
        reviewNotes,
        reviewedAt: new Date().toISOString().split('T')[0]
      } 
    });
  }

  // Admin APIs
  getPendingApprovals(): Observable<any> {
    console.log('⏳ API: Fetching pending approvals...');
    return this.simulateApiCall({ success: true, data: mockPendingApprovals });
  }

  approveEntity(approvalId: string, notes?: string): Observable<any> {
    console.log('✅ API: Approving entity:', approvalId);
    return this.simulateApiCall({ 
      success: true, 
      data: { 
        id: approvalId, 
        status: 'approved',
        reviewNotes: notes,
        reviewedAt: new Date().toISOString()
      } 
    });
  }

  rejectEntity(approvalId: string, notes: string): Observable<any> {
    console.log('❌ API: Rejecting entity:', approvalId);
    return this.simulateApiCall({ 
      success: true, 
      data: { 
        id: approvalId, 
        status: 'rejected',
        reviewNotes: notes,
        reviewedAt: new Date().toISOString()
      } 
    });
  }

  getAdminSkills(): Observable<any> {
    console.log('🎯 API: Fetching admin skills...');
    return this.simulateApiCall({ success: true, data: mockAdminSkills });
  }

  createAdminSkill(skill: any): Observable<any> {
    console.log('➕ API: Creating admin skill:', skill.name);
    const newSkill = {
      ...skill,
      id: 'skill-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.simulateApiCall({ success: true, data: newSkill });
  }

  updateAdminSkill(id: string, updates: any): Observable<any> {
    console.log('📝 API: Updating admin skill:', id);
    return this.simulateApiCall({ 
      success: true, 
      data: { 
        ...updates, 
        id,
        updatedAt: new Date().toISOString()
      } 
    });
  }

  deleteAdminSkill(id: string): Observable<any> {
    console.log('🗑️ API: Deleting admin skill:', id);
    return this.simulateApiCall({ success: true });
  }

  getPlatformStats(): Observable<any> {
    console.log('📊 API: Fetching platform stats...');
    return this.simulateApiCall({ success: true, data: mockPlatformStats });
  }

  getAllTransactions(): Observable<any> {
    console.log('📋 API: Fetching all transactions...');
    return this.simulateApiCall({ success: true, data: mockTransactions });
  }
}