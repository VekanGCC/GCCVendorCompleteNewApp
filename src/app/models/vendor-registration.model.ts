export interface VendorRegistration {
  id?: string;
  currentStep: number;
  
  // Step 1 - Company Information
  companyName: string;
  firstName: string;
  lastName: string;
  contactPerson: string;
  email: string;
  numberOfResources: number;
  mobileNumber: string;
  gstNumber: string;
  serviceProvided: string;
  password: string;
  confirmPassword: string;
  
  // Step 2 - OTP Verification
  otpVerified: boolean;
  otp?: string;
  
  // Step 3 - Address & Bank Details
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  bankAccountNumber: string;
  accountType: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  bankCity: string;
  paymentTerms: string;
  
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

export interface ServiceOption {
  value: string;
  label: string;
}

export interface AccountTypeOption {
  value: string;
  label: string;
}