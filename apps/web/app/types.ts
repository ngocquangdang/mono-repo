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
  maThamDu?: string; // QR code value
  qrImageUrl?: string; // QR image URL
  idPhien?: string; // Session ID for QR generation
  emailSent?: boolean; // Email sending status
  emailSentDate?: string; // Email sent timestamp
  sessionId?: string; // Session ID for API calls
  userAgent?: string; // Per-user user-agent string
}

export interface CaptchaResponse { success: boolean; imageUrl?: string; sessionId?: string; setCookie?: string; cookie?: string; error?: string; }

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    rawHtml: string;
    httpStatus: number;
    method: string;
    maThamDu?: string; // QR code value from successful registration
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
