import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VendorRegistrationService } from '../../services/vendor-registration.service';
import { ClientRegistrationService } from '../../services/client-registration.service';
import { VendorRegistration } from '../../models/vendor-registration.model';
import { ClientRegistration } from '../../models/client-registration.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  currentStep = 1;
  totalSteps = 5;
  isLoading = false;
  error = '';
  success = '';
  
  // User type selection
  userType: 'vendor' | 'client' | null = null;
  
  // Forms for each step - initialized with default values
  step1Form!: FormGroup;
  step2Form!: FormGroup;
  step3Form!: FormGroup;
  step4Form!: FormGroup;
  step5Form!: FormGroup;

  // Options
  serviceOptions: any[] = [];

  // OTP related
  otpSent = false;
  otpTimer = 0;
  otpInterval: any;

  vendorRegistration: VendorRegistration | null = null;
  clientRegistration: ClientRegistration | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private vendorRegistrationService: VendorRegistrationService,
    private clientRegistrationService: ClientRegistrationService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    // Check for user type in query params
    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'vendor' || params['type'] === 'client') {
        this.userType = params['type'];
        this.loadRegistrationData();
      }
    });

    // If no user type specified, start with selection
    if (!this.userType) {
      this.currentStep = 0; // User type selection step
    }
  }

  ngOnDestroy(): void {
    if (this.otpInterval) {
      clearInterval(this.otpInterval);
    }
  }

  private loadRegistrationData(): void {
    if (this.userType === 'vendor') {
      this.serviceOptions = this.vendorRegistrationService.getServiceOptions();
      this.vendorRegistrationService.registration$.subscribe(registration => {
        this.vendorRegistration = registration;
        if (registration) {
          this.currentStep = registration.currentStep;
          this.populateFormsFromVendorRegistration(registration);
        }
      });
    } else if (this.userType === 'client') {
      this.serviceOptions = this.clientRegistrationService.getServiceRequiredOptions();
      this.clientRegistrationService.registration$.subscribe(registration => {
        this.clientRegistration = registration;
        if (registration) {
          this.currentStep = registration.currentStep;
          this.populateFormsFromClientRegistration(registration);
        }
      });
    }
  }

  selectUserType(type: 'vendor' | 'client'): void {
    this.userType = type;
    this.currentStep = 1;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { type: type },
      queryParamsHandling: 'merge'
    });
    this.loadRegistrationData();
  }

  private initializeForms(): void {
    // Step 1: Company Information
    this.step1Form = this.fb.group({
      companyName: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      contactPerson: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      numberOfResources: [1, [Validators.required, Validators.min(1)]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      gstNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]],
      serviceProvided: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Step 2: OTP Verification
    this.step2Form = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });

    // Step 3: Address & Bank Details (conditional)
    this.step3Form = this.fb.group({
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['India', Validators.required],
      pinCode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      // Bank details (only for vendors)
      bankAccountNumber: [''],
      accountType: [''],
      ifscCode: [''],
      bankName: [''],
      branchName: [''],
      bankCity: [''],
      paymentTerms: ['']
    });

    // Step 4: Legal & Compliance
    this.step4Form = this.fb.group({
      panNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],
      registeredUnderESI: [false],
      esiRegistrationNumber: [''],
      registeredUnderPF: [false],
      pfRegistrationNumber: [''],
      registeredUnderMSMED: [false]
    });

    // Step 5: Declarations
    this.step5Form = this.fb.group({
      compliesWithStatutoryRequirements: [false, Validators.requiredTrue],
      hasCloseRelativesInCompany: [false],
      hasAdequateSafetyStandards: [false, Validators.requiredTrue],
      hasOngoingLitigation: [false]
    });

    // Set up conditional validators
    this.setupConditionalValidators();
  }

  private updateFormValidatorsForUserType(): void {
    if (this.userType === 'vendor') {
      // Add bank details validators for vendors
      this.step3Form.get('bankAccountNumber')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{9,18}$/)]);
      this.step3Form.get('accountType')?.setValidators([Validators.required]);
      this.step3Form.get('ifscCode')?.setValidators([Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]);
      this.step3Form.get('bankName')?.setValidators([Validators.required]);
      this.step3Form.get('branchName')?.setValidators([Validators.required]);
      this.step3Form.get('bankCity')?.setValidators([Validators.required]);
      this.step3Form.get('paymentTerms')?.setValidators([Validators.required]);
    } else {
      // Remove bank details validators for clients
      this.step3Form.get('bankAccountNumber')?.clearValidators();
      this.step3Form.get('accountType')?.clearValidators();
      this.step3Form.get('ifscCode')?.clearValidators();
      this.step3Form.get('bankName')?.clearValidators();
      this.step3Form.get('branchName')?.clearValidators();
      this.step3Form.get('bankCity')?.clearValidators();
      this.step3Form.get('paymentTerms')?.clearValidators();
    }

    // Update validity
    Object.keys(this.step3Form.controls).forEach(key => {
      this.step3Form.get(key)?.updateValueAndValidity();
    });
  }

  private setupConditionalValidators(): void {
    // ESI Registration Number validator
    this.step4Form.get('registeredUnderESI')?.valueChanges.subscribe(value => {
      const esiNumberControl = this.step4Form.get('esiRegistrationNumber');
      if (value) {
        esiNumberControl?.setValidators([Validators.required, Validators.pattern(/^[0-9]{10}$/)]);
      } else {
        esiNumberControl?.clearValidators();
      }
      esiNumberControl?.updateValueAndValidity();
    });

    // PF Registration Number validator
    this.step4Form.get('registeredUnderPF')?.valueChanges.subscribe(value => {
      const pfNumberControl = this.step4Form.get('pfRegistrationNumber');
      if (value) {
        pfNumberControl?.setValidators([Validators.required, Validators.pattern(/^[A-Z]{2}\/[A-Z]{3}\/[0-9]{7}\/[0-9]{3}\/[0-9]{7}$/)]);
      } else {
        pfNumberControl?.clearValidators();
      }
      pfNumberControl?.updateValueAndValidity();
    });
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value 
      ? null : { passwordMismatch: true };
  }

  private populateFormsFromVendorRegistration(registration: VendorRegistration): void {
    // Populate Step 1
    this.step1Form.patchValue({
      companyName: registration.companyName,
      firstName: registration.firstName,
      lastName: registration.lastName,
      contactPerson: registration.contactPerson,
      email: registration.email,
      numberOfResources: registration.numberOfResources,
      mobileNumber: registration.mobileNumber,
      gstNumber: registration.gstNumber,
      serviceProvided: registration.serviceProvided,
      password: registration.password,
      confirmPassword: registration.confirmPassword
    });

    // Populate Step 3
    this.step3Form.patchValue({
      addressLine1: registration.addressLine1,
      addressLine2: registration.addressLine2,
      city: registration.city,
      state: registration.state,
      country: registration.country,
      pinCode: registration.pinCode,
      bankAccountNumber: registration.bankAccountNumber,
      accountType: registration.accountType,
      ifscCode: registration.ifscCode,
      bankName: registration.bankName,
      branchName: registration.branchName,
      bankCity: registration.bankCity,
      paymentTerms: registration.paymentTerms
    });

    // Populate Step 4
    this.step4Form.patchValue({
      panNumber: registration.panNumber,
      registeredUnderESI: registration.registeredUnderESI,
      esiRegistrationNumber: registration.esiRegistrationNumber,
      registeredUnderPF: registration.registeredUnderPF,
      pfRegistrationNumber: registration.pfRegistrationNumber,
      registeredUnderMSMED: registration.registeredUnderMSMED
    });

    // Populate Step 5
    this.step5Form.patchValue({
      compliesWithStatutoryRequirements: registration.compliesWithStatutoryRequirements,
      hasCloseRelativesInCompany: registration.hasCloseRelativesInCompany,
      hasAdequateSafetyStandards: registration.hasAdequateSafetyStandards,
      hasOngoingLitigation: registration.hasOngoingLitigation
    });

    this.updateFormValidatorsForUserType();
  }

  private populateFormsFromClientRegistration(registration: ClientRegistration): void {
    // Populate Step 1 (adjust field names for client)
    this.step1Form.patchValue({
      companyName: registration.companyName,
      firstName: registration.firstName,
      lastName: registration.lastName,
      contactPerson: registration.contactPerson,
      email: registration.email,
      numberOfResources: registration.numberOfRequirements, // Map to numberOfRequirements
      mobileNumber: registration.mobileNumber,
      gstNumber: registration.gstNumber,
      serviceProvided: registration.serviceRequired, // Map to serviceRequired
      password: registration.password,
      confirmPassword: registration.confirmPassword
    });

    // Populate Step 3 (no bank details for clients)
    this.step3Form.patchValue({
      addressLine1: registration.addressLine1,
      addressLine2: registration.addressLine2,
      city: registration.city,
      state: registration.state,
      country: registration.country,
      pinCode: registration.pinCode
    });

    // Populate Step 4
    this.step4Form.patchValue({
      panNumber: registration.panNumber,
      registeredUnderESI: registration.registeredUnderESI,
      esiRegistrationNumber: registration.esiRegistrationNumber,
      registeredUnderPF: registration.registeredUnderPF,
      pfRegistrationNumber: registration.pfRegistrationNumber,
      registeredUnderMSMED: registration.registeredUnderMSMED
    });

    // Populate Step 5
    this.step5Form.patchValue({
      compliesWithStatutoryRequirements: registration.compliesWithStatutoryRequirements,
      hasCloseRelativesInCompany: registration.hasCloseRelativesInCompany,
      hasAdequateSafetyStandards: registration.hasAdequateSafetyStandards,
      hasOngoingLitigation: registration.hasOngoingLitigation
    });

    this.updateFormValidatorsForUserType();
  }

  async nextStep(): Promise<void> {
    this.error = '';
    this.success = '';

    if (this.currentStep === 1) {
      if (!this.step1Form.valid) {
        this.markFormGroupTouched(this.step1Form);
        return;
      }

      // Initialize or update registration based on user type
      const formData = this.step1Form.value;
      
      if (this.userType === 'vendor') {
        if (!this.vendorRegistration) {
          this.vendorRegistration = this.vendorRegistrationService.initializeRegistration(formData.email);
        }
        
        this.vendorRegistrationService.updateRegistration({
          ...formData,
          currentStep: 2
        });
      } else if (this.userType === 'client') {
        if (!this.clientRegistration) {
          this.clientRegistration = this.clientRegistrationService.initializeRegistration(formData.email);
        }
        
        // Map vendor fields to client fields
        this.clientRegistrationService.updateRegistration({
          companyName: formData.companyName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          contactPerson: formData.contactPerson,
          email: formData.email,
          numberOfRequirements: formData.numberOfResources,
          mobileNumber: formData.mobileNumber,
          gstNumber: formData.gstNumber,
          serviceRequired: formData.serviceProvided,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          currentStep: 2
        });
      }

      this.currentStep = 2;
    } 
    else if (this.currentStep === 2) {
      if (!this.step2Form.valid) {
        this.markFormGroupTouched(this.step2Form);
        return;
      }

      this.isLoading = true;
      const otp = this.step2Form.get('otp')?.value;
      
      try {
        let isValid = false;
        
        if (this.userType === 'vendor') {
          isValid = await this.vendorRegistrationService.verifyOTP(otp);
          if (isValid) {
            this.vendorRegistrationService.updateRegistration({ currentStep: 3 });
          }
        } else if (this.userType === 'client') {
          isValid = await this.clientRegistrationService.verifyOTP(otp);
          if (isValid) {
            this.clientRegistrationService.updateRegistration({ currentStep: 3 });
          }
        }
        
        if (isValid) {
          this.currentStep = 3;
          this.success = 'OTP verified successfully!';
          this.updateFormValidatorsForUserType(); // Update validators for step 3
        } else {
          this.error = 'Invalid OTP. Please try again.';
        }
      } catch (error) {
        this.error = 'Error verifying OTP. Please try again.';
      } finally {
        this.isLoading = false;
      }
    }
    else if (this.currentStep === 3) {
      if (!this.step3Form.valid) {
        this.markFormGroupTouched(this.step3Form);
        return;
      }

      const formData = this.step3Form.value;
      
      if (this.userType === 'vendor') {
        this.vendorRegistrationService.updateRegistration({
          ...formData,
          currentStep: 4
        });
      } else if (this.userType === 'client') {
        // Only address fields for clients
        this.clientRegistrationService.updateRegistration({
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          pinCode: formData.pinCode,
          currentStep: 4
        });
      }
      
      this.currentStep = 4;
    }
    else if (this.currentStep === 4) {
      if (!this.step4Form.valid) {
        this.markFormGroupTouched(this.step4Form);
        return;
      }

      const formData = this.step4Form.value;
      
      if (this.userType === 'vendor') {
        this.vendorRegistrationService.updateRegistration({
          ...formData,
          currentStep: 5
        });
      } else if (this.userType === 'client') {
        this.clientRegistrationService.updateRegistration({
          ...formData,
          currentStep: 5
        });
      }
      
      this.currentStep = 5;
    }
    else if (this.currentStep === 5) {
      if (!this.step5Form.valid) {
        this.markFormGroupTouched(this.step5Form);
        return;
      }

      await this.completeRegistration();
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      
      if (this.userType === 'vendor') {
        this.vendorRegistrationService.updateStep(this.currentStep);
      } else if (this.userType === 'client') {
        this.clientRegistrationService.updateStep(this.currentStep);
      }
    }
  }

  async sendOTP(): Promise<void> {
    if (!this.step1Form.get('email')?.valid) {
      this.error = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const email = this.step1Form.get('email')?.value;
      let success = false;
      
      if (this.userType === 'vendor') {
        success = await this.vendorRegistrationService.sendOTP(email);
      } else if (this.userType === 'client') {
        success = await this.clientRegistrationService.sendOTP(email);
      }
      
      if (success) {
        this.otpSent = true;
        this.success = 'OTP sent to your email address';
        this.startOtpTimer();
      } else {
        this.error = 'Failed to send OTP. Please try again.';
      }
    } catch (error) {
      this.error = 'Error sending OTP. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  private startOtpTimer(): void {
    this.otpTimer = 300; // 5 minutes
    this.otpInterval = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer <= 0) {
        clearInterval(this.otpInterval);
        this.otpSent = false;
      }
    }, 1000);
  }

  async completeRegistration(): Promise<void> {
    this.isLoading = true;
    this.error = '';

    try {
      const formData = this.step5Form.value;
      let success = false;
      
      if (this.userType === 'vendor') {
        this.vendorRegistrationService.updateRegistration(formData);
        success = await this.vendorRegistrationService.completeRegistration();
      } else if (this.userType === 'client') {
        this.clientRegistrationService.updateRegistration(formData);
        success = await this.clientRegistrationService.completeRegistration();
      }
      
      if (success) {
        this.success = 'Registration completed successfully!';
        setTimeout(() => {
          this.router.navigate(['/login'], { 
            queryParams: { 
              message: 'Registration completed! Please sign in with your credentials.',
              type: this.userType 
            }
          });
        }, 2000);
      } else {
        this.error = 'Failed to complete registration. Please try again.';
      }
    } catch (error) {
      this.error = 'Error completing registration. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['pattern']) return this.getPatternError(fieldName);
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      companyName: 'Company Name',
      firstName: 'First Name',
      lastName: 'Last Name',
      contactPerson: 'Contact Person',
      email: 'Email',
      numberOfResources: this.userType === 'client' ? 'Number of Requirements' : 'Number of Resources',
      mobileNumber: 'Mobile Number',
      gstNumber: 'GST Number',
      serviceProvided: this.userType === 'client' ? 'Service Required' : 'Service Provided',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      otp: 'OTP',
      addressLine1: 'Address Line 1',
      city: 'City',
      state: 'State',
      country: 'Country',
      pinCode: 'Pin Code',
      bankAccountNumber: 'Bank Account Number',
      accountType: 'Account Type',
      ifscCode: 'IFSC Code',
      bankName: 'Bank Name',
      branchName: 'Branch Name',
      bankCity: 'Bank City',
      paymentTerms: 'Payment Terms',
      panNumber: 'PAN Number',
      esiRegistrationNumber: 'ESI Registration Number',
      pfRegistrationNumber: 'PF Registration Number'
    };
    return labels[fieldName] || fieldName;
  }

  private getPatternError(fieldName: string): string {
    const errors: { [key: string]: string } = {
      mobileNumber: 'Mobile number must be 10 digits',
      gstNumber: 'Please enter a valid GST number',
      pinCode: 'Pin code must be 6 digits',
      bankAccountNumber: 'Bank account number must be 9-18 digits',
      ifscCode: 'Please enter a valid IFSC code',
      panNumber: 'Please enter a valid PAN number',
      otp: 'OTP must be 6 digits',
      esiRegistrationNumber: 'ESI number must be 10 digits',
      pfRegistrationNumber: 'Please enter a valid PF registration number'
    };
    return errors[fieldName] || 'Please enter a valid value';
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  // Helper methods for template
  get isVendor(): boolean {
    return this.userType === 'vendor';
  }

  get isClient(): boolean {
    return this.userType === 'client';
  }

  get userTypeTitle(): string {
    return this.userType === 'vendor' ? 'Vendor' : 'Client';
  }

  get resourceFieldLabel(): string {
    return this.userType === 'client' ? 'Number of Requirements' : 'Number of Resources';
  }

  get serviceFieldLabel(): string {
    return this.userType === 'client' ? 'Service Required' : 'Service Provided';
  }

  get resourceFieldPlaceholder(): string {
    return this.userType === 'client' ? 'Enter expected number of requirements' : 'Enter number of resources';
  }

  get serviceFieldPlaceholder(): string {
    return this.userType === 'client' ? 'Select required service' : 'Select provided service';
  }

  getAccountTypeOptions() {
    return [
      { value: 'savings', label: 'Savings Account' },
      { value: 'current', label: 'Current Account' },
      { value: 'business', label: 'Business Account' }
    ];
  }
}