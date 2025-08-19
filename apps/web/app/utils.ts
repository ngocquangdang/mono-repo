import { UserRegistration, CaptchaResponse, RegistrationResponse } from './types';
import { getApiConfig } from './config';

// Default users constant
export const DEFAULT_USERS: Omit<UserRegistration, 'id' | 'createdAt' | 'updatedAt' | 'captcha' | 'isRegistered' | 'salesDate' | 'session'>[] = [
  {
    fullName: 'Đặng Văn Thay',
    phoneNumber: '0902653215',
    email: 'Dangvanthay.1995@gmail.com',
    dateOfBirth: {
      day: '13',
      month: '09',
      year: '1995'
    },
    idCard: '048095009075'
  },
  {
    fullName: 'Đặng thị ngọc diễm',
    dateOfBirth: {
      day: '19',
      month: '05',
      year: '1996'
    },
    email: 'dangngocdiem960@gmail.com',
    idCard: '066196016601',
    phoneNumber: '0946045548'
  },
  {
    fullName: 'Thái xuân linh',
    email: 'linhlovedn2005@gmail.com',
    phoneNumber: '0932474881',
    idCard: '048090008495',
    dateOfBirth: {
      day: '22',
      month: '05',
      year: '1990'
    }
  },
  {
    fullName: 'Đặng Quốc Fai',
    idCard: '048200007333',
    email: 'quocfaidang@gmail.com',
    dateOfBirth: {
      day: '16',
      month: '09',
      year: '2000'
    },
    phoneNumber: '0702749479'
  },
  {
    fullName: 'Mai đăng bảo',
    phoneNumber: '0935122143',
    dateOfBirth: {
      day: '30',
      month: '07',
      year: '1995'
    },
    email: 'bisudu098@gmail.com',
    idCard: '048095006892'
  }
];

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
    
    // Get users from localStorage
    const storedUsers = localStorage.getItem('popmart_registrations');
    const localUsers: UserRegistration[] = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Convert default users to full UserRegistration objects
    const defaultUsersWithIds: UserRegistration[] = DEFAULT_USERS.map((defaultUser, index) => ({
      ...defaultUser,
      id: `default-${index + 1}`,
      salesDate: '',
      session: '',
      captcha: '',
      isRegistered: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    // Merge default users with local storage users
    // If a default user already exists in local storage (by email), use the local version
    const mergedUsers = [...defaultUsersWithIds];
    
    localUsers.forEach(localUser => {
      const existingDefaultIndex = mergedUsers.findIndex(
        defaultUser => defaultUser.email === localUser.email
      );
      
      if (existingDefaultIndex !== -1) {
        // Replace default user with local storage version
        mergedUsers[existingDefaultIndex] = localUser;
      } else {
        // Add new local user
        mergedUsers.push(localUser);
      }
    });
    
    return mergedUsers;
  },
  
  saveUser: (user: UserRegistration): void => {
    if (typeof window === 'undefined') return;
    
    // Get only local storage users (not merged with defaults)
    const storedUsers = localStorage.getItem('popmart_registrations');
    const localUsers: UserRegistration[] = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Check if this user is updating a default user
    const isDefaultUser = user.id.startsWith('default-');
    
    if (isDefaultUser) {
      // For default users, we need to save them to localStorage with a new ID
      const newUser = {
        ...user,
        id: generateId(), // Generate new ID for localStorage
        updatedAt: new Date().toISOString()
      };
      localUsers.push(newUser);
    } else {
      // For new users, just add them
      localUsers.push(user);
    }
    
    localStorage.setItem('popmart_registrations', JSON.stringify(localUsers));
  },
  
  updateUser: (id: string, updates: Partial<UserRegistration>): void => {
    if (typeof window === 'undefined') return;
    
    // Get only local storage users (not merged with defaults)
    const storedUsers = localStorage.getItem('popmart_registrations');
    const localUsers: UserRegistration[] = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Check if this is a default user being updated
    const isDefaultUser = id.startsWith('default-');
    
    if (isDefaultUser) {
      // For default users, we need to find them by email in localStorage
      const defaultUser = DEFAULT_USERS.find((_, index) => `default-${index + 1}` === id);
      if (defaultUser) {
        const existingIndex = localUsers.findIndex(user => user.email === defaultUser.email);
        
        if (existingIndex !== -1) {
          // Update existing local storage user
          const updatedUser = { 
            ...localUsers[existingIndex], 
            ...updates,
            updatedAt: new Date().toISOString()
          } as UserRegistration;
          localUsers[existingIndex] = updatedUser;
        } else {
          // Create new local storage user from default
          const newUser = {
            ...defaultUser,
            ...updates,
            id: generateId(),
            salesDate: '',
            session: '',
            captcha: '',
            isRegistered: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as UserRegistration;
          localUsers.push(newUser);
        }
      }
    } else {
      // For regular users, update normally
      const index = localUsers.findIndex(user => user.id === id);
      if (index !== -1) {
        const updatedUser = { 
          ...localUsers[index], 
          ...updates,
          updatedAt: new Date().toISOString()
        } as UserRegistration;
        localUsers[index] = updatedUser;
      }
    }
    
    localStorage.setItem('popmart_registrations', JSON.stringify(localUsers));
  },
  
  deleteUser: (id: string): void => {
    if (typeof window === 'undefined') return;
    
    // Get only local storage users (not merged with defaults)
    const storedUsers = localStorage.getItem('popmart_registrations');
    const localUsers: UserRegistration[] = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Check if this is a default user being deleted
    const isDefaultUser = id.startsWith('default-');
    
    if (isDefaultUser) {
      // For default users, we need to find them by email in localStorage
      const defaultUser = DEFAULT_USERS.find((_, index) => `default-${index + 1}` === id);
      if (defaultUser) {
        const filteredUsers = localUsers.filter(user => user.email !== defaultUser.email);
        localStorage.setItem('popmart_registrations', JSON.stringify(filteredUsers));
      }
    } else {
      // For regular users, delete normally
      const filteredUsers = localUsers.filter(user => user.id !== id);
      localStorage.setItem('popmart_registrations', JSON.stringify(filteredUsers));
    }
  },
  
  clearAllUsers: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('popmart_registrations');
  },
  
  resetToDefaultUsers: (): void => {
    if (typeof window === 'undefined') return;
    // Clear all local storage users to reset to defaults
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
