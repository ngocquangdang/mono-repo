export interface UserRegistration {
  id: string;
  salesDate: string;
  session: string;
  fullName: string;
  dateOfBirth: {
    day: string;
    month: string;
    year: string;
  };
  phoneNumber: string;
  email: string;
  idCard: string;
  captcha: string;
  isRegistered: boolean;
  registrationResult?: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields for better data tracking
  registrationDate?: string;
  registrationStatus?: 'pending' | 'success' | 'failed';
  errorMessage?: string;
}

export interface CaptchaResponse {
  success: boolean;
  imageUrl?: string;
  sessionId?: string;
  error?: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    rawHtml: string;
    httpStatus: number;
    method: string;
  };
}

export interface SalesDate {
  value: string;
  date: string;
  displayText: string;
}

export interface Session {
  value: string;
  displayText: string;
  timeSlot: string;
}
