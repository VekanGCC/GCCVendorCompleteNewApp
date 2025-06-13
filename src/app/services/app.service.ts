import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Resource } from '../models/resource.model';
import { Requirement } from '../models/requirement.model';
import { Application } from '../models/application.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private resourcesSubject = new BehaviorSubject<Resource[]>([]);
  private requirementsSubject = new BehaviorSubject<Requirement[]>([]);
  private applicationsSubject = new BehaviorSubject<Application[]>([]);

  public resources$ = this.resourcesSubject.asObservable();
  public requirements$ = this.requirementsSubject.asObservable();
  public applications$ = this.applicationsSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    try {
      await Promise.all([
        this.loadResources(),
        this.loadRequirements(),
        this.loadApplications()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }

  private async loadResources(): Promise<void> {
    try {
      const response = await this.apiService.getResources().toPromise();
      if (response.success) {
        this.resourcesSubject.next(response.data);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  }

  private async loadRequirements(): Promise<void> {
    try {
      const response = await this.apiService.getRequirements().toPromise();
      if (response.success) {
        this.requirementsSubject.next(response.data);
      }
    } catch (error) {
      console.error('Error loading requirements:', error);
    }
  }

  private async loadApplications(): Promise<void> {
    try {
      const response = await this.apiService.getApplications().toPromise();
      if (response.success) {
        this.applicationsSubject.next(response.data);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  }

  async addResource(resourceData: Omit<Resource, 'id' | 'createdAt'>): Promise<void> {
    try {
      const response = await this.apiService.createResource(resourceData).toPromise();
      if (response.success) {
        const currentResources = this.resourcesSubject.value;
        this.resourcesSubject.next([...currentResources, response.data]);
      }
    } catch (error) {
      console.error('Error adding resource:', error);
      throw error;
    }
  }

  async addRequirement(requirementData: Omit<Requirement, 'id' | 'createdAt'>): Promise<void> {
    try {
      const response = await this.apiService.createRequirement(requirementData).toPromise();
      if (response.success) {
        const currentRequirements = this.requirementsSubject.value;
        this.requirementsSubject.next([...currentRequirements, response.data]);
      }
    } catch (error) {
      console.error('Error adding requirement:', error);
      throw error;
    }
  }

  async addApplication(applicationData: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const response = await this.apiService.createApplication(applicationData).toPromise();
      if (response.success) {
        const currentApplications = this.applicationsSubject.value;
        this.applicationsSubject.next([...currentApplications, response.data]);
      }
    } catch (error) {
      console.error('Error adding application:', error);
      throw error;
    }
  }

  async updateApplicationStatus(applicationId: string, status: Application['status'], notes?: string): Promise<void> {
    try {
      const response = await this.apiService.updateApplicationStatus(applicationId, status, notes).toPromise();
      if (response.success) {
        const currentApplications = this.applicationsSubject.value;
        const updatedApplications = currentApplications.map(app => 
          app.id === applicationId 
            ? { ...app, status, updatedAt: response.data.updatedAt, notes: notes || app.notes }
            : app
        );
        this.applicationsSubject.next(updatedApplications);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  async updateRequirementStatus(requirementId: string, status: Requirement['status']): Promise<void> {
    try {
      const response = await this.apiService.updateRequirementStatus(requirementId, status).toPromise();
      if (response.success) {
        const currentRequirements = this.requirementsSubject.value;
        const updatedRequirements = currentRequirements.map(req => 
          req.id === requirementId 
            ? { ...req, status }
            : req
        );
        this.requirementsSubject.next(updatedRequirements);
      }
    } catch (error) {
      console.error('Error updating requirement status:', error);
      throw error;
    }
  }

  get resources(): Resource[] {
    return this.resourcesSubject.value;
  }

  get requirements(): Requirement[] {
    return this.requirementsSubject.value;
  }

  get applications(): Application[] {
    return this.applicationsSubject.value;
  }
}