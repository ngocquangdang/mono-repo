// API Configuration
export const API_CONFIG = {
  CAPTCHA_ENDPOINT: '/api/captcha',
  REGISTER_ENDPOINT: '/api/register',
  SALES_DATES_ENDPOINT: '/api/sales-dates',
  SESSIONS_ENDPOINT: '/api/sessions', // NEW
  QR_GENERATION_ENDPOINT: '/api/qr-generation', // NEW
  EMAIL_ENDPOINT: '/api/send-email', // NEW
  
  // POP MART API Configuration
  POP_MART: {
    BASE_URL: 'https://popmartstt.com',
    CAPTCHA_URL: 'https://popmartstt.com/Ajax.aspx?Action=LoadCaptcha',
    REGISTER_URL: 'https://popmartstt.com/Ajax.aspx?Action=DangKyThamDu',
    REGISTRATION_PAGE_URL: 'https://popmartstt.com/popmart',
    SESSIONS_URL: 'https://popmartstt.com/Ajax.aspx?Action=LoadPhien', // NEW
    QR_GENERATION_URL: 'https://popmartstt.com/DangKy.aspx/GenQRImage', // NEW
    EMAIL_URL: 'https://popmartstt.com/Ajax.aspx?Action=SendEmail', // NEW
    
    // Session cookie - use the first session ID from the cookie string
    SESSION_COOKIE: 'ASP.NET_SessionId=mnjj0tg2hw4ziwvrasnfeguf',
    
    // Parameter mappings
    PARAMS: {
      // idNgayBanHang will be dynamic from sales date selection
      SESSION_MAPPING: {
        'session 1 (09:00 - 11:00)': '60',
        'session 2 (13:30 - 15:30)': '61'
      }
    }
  },
  
  // API Headers for direct calls (when needed)
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'accept': '*/*',
    'accept-language': 'vi-VN,vi;q=0.9',
    'priority': 'u=1, i',
    'referer': 'https://popmartstt.com/popmart',
    'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
    'Cookie': 'ASP.NET_SessionId=mnjj0tg2hw4ziwvrasnfeguf'
  },
  
  // Timeout settings (in milliseconds)
  TIMEOUT: 10000,
};

// Environment-based configuration
export const getApiConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    ...API_CONFIG,
    // Override with development endpoints if needed
    CAPTCHA_ENDPOINT: isDevelopment 
      ? process.env.NEXT_PUBLIC_CAPTCHA_ENDPOINT || API_CONFIG.CAPTCHA_ENDPOINT
      : API_CONFIG.CAPTCHA_ENDPOINT,
    REGISTER_ENDPOINT: isDevelopment 
      ? process.env.NEXT_PUBLIC_REGISTER_ENDPOINT || API_CONFIG.REGISTER_ENDPOINT
      : API_CONFIG.REGISTER_ENDPOINT,
  };
};
