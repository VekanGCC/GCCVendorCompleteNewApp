import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { LayoutComponent } from '../layout/layout.component';
import { ApplicationsViewComponent } from '../applications-view/applications-view.component';
import { RequirementModalComponent } from '../modals/requirement-modal/requirement-modal.component';
import { ApplyResourceModalComponent } from '../modals/apply-resource-modal/apply-resource-modal.component';
import { AuthService } from '../../services/auth.service';
import { AppService } from '../../services/app.service';
import { Resource } from '../../models/resource.model';
import { Requirement } from '../../models/requirement.model';
import { Application } from '../../models/application.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    LucideAngularModule, 
    LayoutComponent,
    ApplicationsViewComponent,
    RequirementModalComponent,
    ApplyResourceModalComponent
  ],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {
  user: User | null = null;
  resources: Resource[] = [];
  requirements: Requirement[] = [];
  applications: Application[] = [];
  
  showRequirementModal = false;
  showApplyModal = false;
  selectedResourceId = '';
  activeTab: 'overview' | 'requirements' | 'resources' | 'applications' = 'overview';

  clientRequirements: Requirement[] = [];
  clientApplications: Application[] = [];

  // Search functionality
  searchQuery = '';
  filteredResources: Resource[] = [];
  selectedSkillFilter = '';
  selectedLocationFilter = '';
  selectedAvailabilityFilter = '';
  minExperienceFilter = 0;
  maxRateFilter = 500;

  // Filter options
  availableSkills: string[] = [];
  availableLocations: string[] = [];
  availabilityOptions = ['available', 'engaged', 'unavailable'];

  // Close requirement functionality
  showCloseRequirementModal = false;
  requirementToClose: Requirement | null = null;
  showActionsForRequirement: string | null = null;

  stats = [
    {
      title: 'My Requirements',
      value: 0,
      icon: 'briefcase',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Available Resources',
      value: 0,
      icon: 'users',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Active Applications',
      value: 0,
      icon: 'trending-up',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Hired Resources',
      value: 0,
      icon: 'check-circle',
      color: 'text-teal-600',
      bg: 'bg-teal-50'
    }
  ];

  constructor(
    private authService: AuthService,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.updateData();
    });

    this.appService.resources$.subscribe(resources => {
      this.resources = resources;
      this.updateData();
      this.updateFilterOptions();
      this.applyFilters();
    });

    this.appService.requirements$.subscribe(requirements => {
      this.requirements = requirements;
      this.updateData();
    });

    this.appService.applications$.subscribe(applications => {
      this.applications = applications;
      this.updateData();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.showActionsForRequirement = null;
      }
    });
  }

  private updateData(): void {
    if (this.user) {
      this.clientRequirements = this.requirements.filter(r => r.clientId === this.user!.id);
      this.clientApplications = this.applications.filter(a => a.clientId === this.user!.id);
      
      this.stats[0].value = this.clientRequirements.length;
      this.stats[1].value = this.resources.length;
      this.stats[2].value = this.clientApplications.filter(a => !['rejected', 'onboarded'].includes(a.status)).length;
      this.stats[3].value = this.clientApplications.filter(a => a.status === 'onboarded').length;
    }
  }

  private updateFilterOptions(): void {
    // Extract unique skills using reduce instead of flatMap for compatibility
    const allSkills: string[] = this.resources.reduce((acc: string[], resource: Resource) => {
      return acc.concat(resource.skills);
    }, []);
    this.availableSkills = [...new Set(allSkills)].sort();

    // Extract unique locations
    this.availableLocations = [...new Set(this.resources.map((r: Resource) => r.location))].sort();
  }

  applyFilters(): void {
    this.filteredResources = this.resources.filter((resource: Resource) => {
      // Text search
      const matchesSearch = !this.searchQuery || 
        resource.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        resource.vendorName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        resource.skills.some((skill: string) => skill.toLowerCase().includes(this.searchQuery.toLowerCase()));

      // Skill filter
      const matchesSkill = !this.selectedSkillFilter || 
        resource.skills.includes(this.selectedSkillFilter);

      // Location filter
      const matchesLocation = !this.selectedLocationFilter || 
        resource.location === this.selectedLocationFilter;

      // Availability filter
      const matchesAvailability = !this.selectedAvailabilityFilter || 
        resource.availability === this.selectedAvailabilityFilter;

      // Experience filter
      const matchesExperience = resource.experience >= this.minExperienceFilter;

      // Rate filter
      const matchesRate = resource.rate <= this.maxRateFilter;

      return matchesSearch && matchesSkill && matchesLocation && 
             matchesAvailability && matchesExperience && matchesRate;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedSkillFilter = '';
    this.selectedLocationFilter = '';
    this.selectedAvailabilityFilter = '';
    this.minExperienceFilter = 0;
    this.maxRateFilter = 500;
    this.applyFilters();
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId as 'overview' | 'requirements' | 'resources' | 'applications';
  }

  getResourceName(resourceId: string): string {
    const resource = this.resources.find((r: Resource) => r.id === resourceId);
    return resource ? resource.name : 'Unknown Resource';
  }

  getRequirementTitle(requirementId: string): string {
    const requirement = this.requirements.find((r: Requirement) => r.id === requirementId);
    return requirement ? requirement.title : 'Unknown Requirement';
  }

  getFirstFourSkills(skills: string[]): string[] {
    return skills.slice(0, 4);
  }

  getAvailabilityClass(availability: string): string {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'engaged':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }

  getRequirementStatusClass(status: string): string {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusBadge(status: string): { color: string; icon: string } {
    const statusConfig: { [key: string]: { color: string; icon: string } } = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: 'clock' },
      shortlisted: { color: 'bg-blue-100 text-blue-800', icon: 'eye' },
      rejected: { color: 'bg-red-100 text-red-800', icon: 'x-circle' },
      'under-interview': { color: 'bg-purple-100 text-purple-800', icon: 'user' },
      selected: { color: 'bg-green-100 text-green-800', icon: 'check-circle' },
      onboarded: { color: 'bg-teal-100 text-teal-800', icon: 'check-circle' }
    };
    
    return statusConfig[status] || statusConfig.pending;
  }

  handleApplyResource(resourceId: string): void {
    this.selectedResourceId = resourceId;
    this.showApplyModal = true;
  }

  closeApplyModal(): void {
    this.showApplyModal = false;
    this.selectedResourceId = '';
  }

  formatStatus(status: string): string {
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Close requirement functionality
  toggleRequirementActions(requirementId: string): void {
    this.showActionsForRequirement = this.showActionsForRequirement === requirementId ? null : requirementId;
  }

  openCloseRequirementModal(requirement: Requirement): void {
    this.requirementToClose = requirement;
    this.showCloseRequirementModal = true;
    this.showActionsForRequirement = null;
  }

  closeCloseRequirementModal(): void {
    this.showCloseRequirementModal = false;
    this.requirementToClose = null;
  }

  confirmCloseRequirement(): void {
    if (this.requirementToClose) {
      this.appService.updateRequirementStatus(this.requirementToClose.id, 'closed');
      this.closeCloseRequirementModal();
    }
  }
}