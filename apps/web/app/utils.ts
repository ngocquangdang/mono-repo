import { UserRegistration, CaptchaResponse, RegistrationResponse } from './types';
import { getApiConfig } from './config';

// Sales date interface (moved here for shared use)
export interface SalesDate {
  value: string;
  date: string;
  displayText: string;
}

// Session interface for dynamic sessions
export interface Session {
  value: string;
  displayText: string;
  timeSlot: string;
}

export const storageUtils = {
  getUsers: (): UserRegistration[] => {
    if (typeof window === 'undefined') return [];
    const users = localStorage.getItem('popmart_registrations');
    return users ? JSON.parse(users) : [];
  },
  
  saveUser: (user: UserRegistration): void => {
    if (typeof window === 'undefined') return;
    const users = storageUtils.getUsers();
    users.push(user);
    localStorage.setItem('popmart_registrations', JSON.stringify(users));
  },
  
  updateUser: (id: string, updates: Partial<UserRegistration>): void => {
    if (typeof window === 'undefined') return;
    const users = storageUtils.getUsers();
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      const updatedUser = { 
        ...users[index], 
        ...updates,
        updatedAt: new Date().toISOString()
      } as UserRegistration;
      users[index] = updatedUser;
      localStorage.setItem('popmart_registrations', JSON.stringify(users));
    }
  },
  
  deleteUser: (id: string): void => {
    if (typeof window === 'undefined') return;
    const users = storageUtils.getUsers();
    const filteredUsers = users.filter(user => user.id !== id);
    localStorage.setItem('popmart_registrations', JSON.stringify(filteredUsers));
  },
  
  clearAllUsers: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('popmart_registrations');
  }
};

export const apiUtils = {
  getCaptcha: async (): Promise<CaptchaResponse> => {
    try {
      const config = getApiConfig();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.TIMEOUT);

      const response = await fetch(config.CAPTCHA_ENDPOINT, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      });
      clearTimeout(timeoutId);
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();

      // Persist cookie returned by API if present
      if (data.setCookie) {
        try {
          localStorage.setItem('popmart_cookie', data.setCookie);
        } catch {}
      }

      return { success: data.success, imageUrl: data.imageUrl, sessionId: data.sessionId, error: data.error, ...('setCookie' in data ? { setCookie: data.setCookie } : {}) };
    } catch (error) {
      console.error('Error getting captcha:', error);
      return { success: false, error: (error as Error).message } as CaptchaResponse;
    }
  },

  // Function to register a user
  registerUser: async (userData: UserRegistration): Promise<RegistrationResponse> => {
    try {
      const config = getApiConfig();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.TIMEOUT);

      const cookie = typeof window !== 'undefined' ? localStorage.getItem('popmart_cookie') || '' : '';
      const userAgent = userData.userAgent || navigator.userAgent;

      const response = await fetch(config.REGISTER_ENDPOINT, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData,
          cookie,
          userAgent
        })
      });
      clearTimeout(timeoutId);
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      return { success: data.success, message: data.message, data: data.data };
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, message: (error as Error).message };
    }
  },

  // New function to get sales dates
  getSalesDates: async (): Promise<{ success: boolean; salesDates: SalesDate[]; error?: string }> => {
    try {
      const config = getApiConfig();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.TIMEOUT);

      const response = await fetch(config.SALES_DATES_ENDPOINT, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      });
      clearTimeout(timeoutId);
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      return { success: data.success, salesDates: data.salesDates || [], error: data.error };
    } catch (error) {
      console.error('Error fetching sales dates:', error);
      return { success: false, salesDates: [], error: (error as Error).message };
    }
  },

  // New function to get sessions based on sales date
  getSessions: async (salesDateId: string): Promise<{ success: boolean; sessions: Session[]; error?: string }> => {
    try {
      const config = getApiConfig();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.TIMEOUT);

      const response = await fetch(`${config.SESSIONS_ENDPOINT}?salesDateId=${salesDateId}`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      });
      clearTimeout(timeoutId);
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      return { success: data.success, sessions: data.sessions || [], error: data.error };
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return { success: false, sessions: [], error: (error as Error).message };
    }
  },

  // New function to generate QR code
  generateQR: async (idPhien: string, maThamDu: string): Promise<{ success: boolean; qrImageUrl?: string; error?: string }> => {
    try {
      const config = getApiConfig();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.TIMEOUT);

      const response = await fetch(config.QR_GENERATION_ENDPOINT, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPhien, maThamDu })
      });
      clearTimeout(timeoutId);
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      return { success: data.success, qrImageUrl: `${config.POP_MART.BASE_URL}/${data.qrImageUrl}`, error: data.error };
    } catch (error) {
      console.error('Error generating QR:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // New function to send email
  sendEmail: async (idPhien: string, maThamDu: string): Promise<{ success: boolean; message: string; error?: string }> => {
    try {
      const config = getApiConfig();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.TIMEOUT);

      const response = await fetch(`${config.EMAIL_ENDPOINT}?idPhien=${idPhien}&MaThamDu=${maThamDu}`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });
      clearTimeout(timeoutId);
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      return { success: data.success, message: data.message, error: data.error };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, message: 'Email sending failed', error: (error as Error).message };
    }
  },

  // New function to solve captcha using AI
  solveCaptcha: async (imageUrl: string, mimeType: string = 'image/png'): Promise<{ success: boolean; captchaText?: string; error?: string }> => {
    try {
      const config = getApiConfig();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.TIMEOUT);

      const response = await fetch(config.SOLVE_CAPTCHA_ENDPOINT, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, mimeType })
      });
      clearTimeout(timeoutId);
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      return { success: data.success, captchaText: data.captchaText, error: data.error };
    } catch (error) {
      console.error('Error solving captcha:', error);
      return { success: false, error: (error as Error).message };
    }
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
