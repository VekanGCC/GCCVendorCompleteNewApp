export interface ClientRegistration {
  id?: string;
  currentStep: number;
  userType: 'client'; // To distinguish from vendor
  
  // Step 1 - Company Information
  companyName: string;
  firstName: string;
  lastName: string;
  contactPerson: string;
  email: string;
  numberOfRequirements: number; // Instead of numberOfResources
  mobileNumber: string;
  gstNumber: string;
  serviceRequired: string; // Instead of serviceProvided
  password: string;
  confirmPassword: string;
  
  // Step 2 - OTP Verification
  otpVerified: boolean;
  otp?: string;
  
  // Step 3 - Address Details (No Bank Details)
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  
  // Step 4 - Legal & Compliance
  panNumber: string;
  registeredUnderESI: boolean;
  esiRegistrationNumber?: string;
  registeredUnderPF: boolean;
  pfRegistrationNumber?: string;
  registeredUnderMSMED: boolean;
  
  // Step 5 - Declarations
  compliesWithStatutoryRequirements: boolean;
  hasCloseRelativesInCompany: boolean;
  hasAdequateSafetyStandards: boolean;
  hasOngoingLitigation: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
}

export interface ServiceRequiredOption {
  value: string;
  label: string;
}