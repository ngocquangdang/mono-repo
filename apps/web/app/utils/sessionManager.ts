// Session Manager for POP MART API
export class SessionManager {
  private static sessionCounter = 0;
  
  // Generate a unique session ID
  static generateSessionId(): string {
    this.sessionCounter++;
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}_${random}_${this.sessionCounter}`;
  }
  
  // Generate a new ASP.NET session ID format
  static generateAspNetSessionId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  // Get headers with new session ID
  static getSessionHeaders(): Record<string, string> {
    const sessionId = this.generateAspNetSessionId();
    return {
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
      'Cookie': `ASP.NET_SessionId=${sessionId}`
    };
  }
  
  // Get headers for page requests (sales-dates)
  static getPageHeaders(): Record<string, string> {
    const sessionId = this.generateAspNetSessionId();
    return {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'vi-VN,vi;q=0.9',
      'priority': 'u=0, i',
      'referer': 'https://popmartstt.com/?zarsrc=1303&utm_source=zalo&utm_medium=zalo&utm_campaign=zalo',
      'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
      'Cookie': `ASP.NET_SessionId=${sessionId}`
    };
  }
  
  // Get headers for JSON requests (QR generation)
  static getJsonHeaders(): Record<string, string> {
    const sessionId = this.generateAspNetSessionId();
    return {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Referer': 'https://popmartstt.com/popmart',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
      'Cookie': `ASP.NET_SessionId=${sessionId}`
    };
  }
  
  // Add random delay to avoid detection
  static async randomDelay(min: number = 100, max: number = 500): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
