import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ClientRegistration } from '../models/client-registration.model';

@Injectable({
  providedIn: 'root'
})
export class ClientRegistrationService {
  private registrationSubject = new BehaviorSubject<ClientRegistration | null>(null);
  public registration$ = this.registrationSubject.asObservable();

  private readonly STORAGE_KEY = 'client_registration_data';

  constructor() {
    this.loadRegistrationFromStorage();
  }

  private loadRegistrationFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const registration = JSON.parse(stored);
        this.registrationSubject.next(registration);
      } catch (error) {
        console.error('Error loading client registration data:', error);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  private saveRegistrationToStorage(registration: ClientRegistration): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(registration));
    } catch (error) {
      console.error('Error saving client registration data:', error);
    }
  }

  initializeRegistration(email: string): ClientRegistration {
    const registration: ClientRegistration = {
      currentStep: 1,
      userType: 'client',
      companyName: '',
      firstName: '',
      lastName: '',
      contactPerson: '',
      email: email,
      numberOfRequirements: 1,
      mobileNumber: '',
      gstNumber: '',
      serviceRequired: '',
      password: '',
      confirmPassword: '',
      otpVerified: false,
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: 'India',
      pinCode: '',
      panNumber: '',
      registeredUnderESI: false,
      registeredUnderPF: false,
      registeredUnderMSMED: false,
      compliesWithStatutoryRequirements: false,
      hasCloseRelativesInCompany: false,
      hasAdequateSafetyStandards: false,
      hasOngoingLitigation: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCompleted: false
    };

    this.registrationSubject.next(registration);
    this.saveRegistrationToStorage(registration);
    return registration;
  }

  updateRegistration(updates: Partial<ClientRegistration>): void {
    const current = this.registrationSubject.value;
    if (current) {
      const updated = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.registrationSubject.next(updated);
      this.saveRegistrationToStorage(updated);
    }
  }

  updateStep(step: number): void {
    this.updateRegistration({ currentStep: step });
  }

  getCurrentRegistration(): ClientRegistration | null {
    return this.registrationSubject.value;
  }

  clearRegistration(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.registrationSubject.next(null);
  }

  async sendOTP(email: string): Promise<boolean> {
    // Simulate OTP sending
    console.log('Sending OTP to client:', email);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  }

  async verifyOTP(otp: string): Promise<boolean> {
    // Simulate OTP verification (for demo, accept "123456")
    console.log('Verifying client OTP:', otp);
    return new Promise((resolve) => {
      setTimeout(() => {
        const isValid = otp === '123456';
        if (isValid) {
          this.updateRegistration({ otpVerified: true });
        }
        resolve(isValid);
      }, 1000);
    });
  }

  async completeRegistration(): Promise<boolean> {
    const registration = this.getCurrentRegistration();
    if (!registration) return false;

    // Simulate API call to complete registration
    console.log('Completing client registration:', registration);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        this.updateRegistration({ isCompleted: true });
        // Clear the registration data after successful completion
        this.clearRegistration();
        resolve(true);
      }, 2000);
    });
  }

  getServiceRequiredOptions() {
    return [
      { value: 'software-development', label: 'Software Development' },
      { value: 'web-development', label: 'Web Development' },
      { value: 'mobile-development', label: 'Mobile App Development' },
      { value: 'data-science', label: 'Data Science & Analytics' },
      { value: 'devops', label: 'DevOps & Cloud Services' },
      { value: 'cybersecurity', label: 'Cybersecurity' },
      { value: 'ui-ux-design', label: 'UI/UX Design' },
      { value: 'qa-testing', label: 'QA & Testing' },
      { value: 'project-management', label: 'Project Management' },
      { value: 'it-consulting', label: 'IT Consulting' },
      { value: 'multiple-services', label: 'Multiple Services' },
      { value: 'other', label: 'Other' }
    ];
  }
}