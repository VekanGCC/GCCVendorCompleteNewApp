import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { AppService } from '../../services/app.service';
import { Resource } from '../../models/resource.model';
import { Requirement } from '../../models/requirement.model';
import { Application } from '../../models/application.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-applications-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './applications-view.component.html',
  styleUrls: ['./applications-view.component.css']
})
export class ApplicationsViewComponent implements OnInit {
  @Input() userRole: 'vendor' | 'client' = 'vendor';

  user: User | null = null;
  resources: Resource[] = [];
  requirements: Requirement[] = [];
  applications: Application[] = [];
  userApplications: Application[] = [];
  selectedApplication: string | null = null;
  notes = '';

  constructor(
    private authService: AuthService,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.updateApplications();
    });

    this.appService.resources$.subscribe(resources => {
      this.resources = resources;
    });

    this.appService.requirements$.subscribe(requirements => {
      this.requirements = requirements;
    });

    this.appService.applications$.subscribe(applications => {
      this.applications = applications;
      this.updateApplications();
    });
  }

  private updateApplications(): void {
    if (this.user) {
      this.userApplications = this.applications.filter(app => 
        this.userRole === 'vendor' ? app.vendorId === this.user!.id : app.clientId === this.user!.id
      );
    }
  }

  getResourceName(resourceId: string): string {
    const resource = this.resources.find(r => r.id === resourceId);
    return resource ? resource.name : 'Unknown Resource';
  }

  getResourceVendorName(resourceId: string): string {
    const resource = this.resources.find(r => r.id === resourceId);
    return resource ? resource.vendorName : 'Unknown Vendor';
  }

  getRequirementTitle(requirementId: string): string {
    const requirement = this.requirements.find(r => r.id === requirementId);
    return requirement ? requirement.title : 'Unknown Requirement';
  }

  getRequirementClientName(requirementId: string): string {
    const requirement = this.requirements.find(r => r.id === requirementId);
    return requirement ? requirement.clientName : 'Unknown Client';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: 'text-yellow-800 bg-yellow-100',
      shortlisted: 'text-blue-800 bg-blue-100',
      rejected: 'text-red-800 bg-red-100',
      'under-interview': 'text-purple-800 bg-purple-100',
      selected: 'text-green-800 bg-green-100',
      onboarded: 'text-teal-800 bg-teal-100'
    };
    return colors[status] || colors.pending;
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      pending: 'clock',
      shortlisted: 'eye',
      rejected: 'x-circle',
      'under-interview': 'user',
      selected: 'check-circle',
      onboarded: 'check-circle'
    };
    return icons[status] || 'clock';
  }

  handleStatusUpdate(applicationId: string, newStatus: string): void {
    this.appService.updateApplicationStatus(applicationId, newStatus as any, this.notes);
    this.selectedApplication = null;
    this.notes = '';
  }

  getAvailableStatuses(currentStatus: string, role: 'vendor' | 'client'): string[] {
    if (role === 'client') {
      switch (currentStatus) {
        case 'pending':
          return ['shortlisted', 'rejected'];
        case 'shortlisted':
          return ['under-interview', 'rejected'];
        case 'under-interview':
          return ['selected', 'rejected'];
        case 'selected':
          return ['onboarded', 'rejected'];
        default:
          return [];
      }
    } else {
      // Vendor actions are more limited
      switch (currentStatus) {
        case 'selected':
          return ['onboarded']; // Accept offer
        default:
          return [];
      }
    }
  }

  formatStatus(status: string): string {
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}