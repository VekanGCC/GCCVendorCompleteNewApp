import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AppService } from '../../../services/app.service';
import { Resource } from '../../../models/resource.model';
import { Requirement } from '../../../models/requirement.model';

@Component({
  selector: 'app-apply-resource-modal',
  templateUrl: './apply-resource-modal.component.html',
  styleUrls: ['./apply-resource-modal.component.css']
})
export class ApplyResourceModalComponent implements OnInit {
  @Input() requirementId: string = '';
  @Input() resourceId: string = '';
  @Output() close = new EventEmitter<void>();

  requirement: Requirement | null = null;
  resource: Resource | null = null;
  availableResources: Resource[] = [];
  availableRequirements: Requirement[] = [];
  selectedItems: string[] = [];
  isVendor = false;

  constructor(
    private authService: AuthService,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (!user) return;

    this.isVendor = user.role === 'vendor';

    if (this.requirementId) {
      // Vendor applying resources to a requirement
      this.requirement = this.appService.requirements.find(r => r.id === this.requirementId) || null;
      this.availableResources = this.appService.resources.filter(r => 
        r.vendorId === user.id && r.availability === 'available'
      );
    } else if (this.resourceId) {
      // Client applying a resource to requirements
      this.resource = this.appService.resources.find(r => r.id === this.resourceId) || null;
      this.availableRequirements = this.appService.requirements.filter(r => 
        r.clientId === user.id && r.status === 'open'
      );
    }
  }

  getFirstThreeSkills(skills: string[]): string[] {
    return skills.slice(0, 3);
  }

  toggleSelection(id: string): void {
    const index = this.selectedItems.indexOf(id);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(id);
    }
  }

  isSelected(id: string): boolean {
    return this.selectedItems.includes(id);
  }

  onSubmit(): void {
    const user = this.authService.currentUser;
    if (!user || this.selectedItems.length === 0) return;

    if (this.isVendor && this.requirement) {
      // Vendor applying resources to requirement
      this.selectedItems.forEach(resourceId => {
        this.appService.addApplication({
          resourceId,
          requirementId: this.requirement!.id,
          vendorId: user.id,
          clientId: this.requirement!.clientId,
          status: 'pending',
          appliedBy: 'vendor'
        });
      });
    } else if (!this.isVendor && this.resource) {
      // Client applying resource to requirements
      this.selectedItems.forEach(requirementId => {
        this.appService.addApplication({
          resourceId: this.resource!.id,
          requirementId,
          vendorId: this.resource!.vendorId,
          clientId: user.id,
          status: 'pending',
          appliedBy: 'client'
        });
      });
    }

    this.close.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}