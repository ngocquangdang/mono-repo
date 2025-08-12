# Proxy Solution for CORS Issues

## Overview
To avoid CORS (Cross-Origin Resource Sharing) issues when calling external APIs from the browser, we've implemented a proxy solution using Next.js API routes.

## Problem
When making direct API calls from the browser to external domains (like `https://popmartstt.com`), browsers block these requests due to CORS policy unless the server explicitly allows it.

## Solution: Next.js API Routes as Proxy

### 1. Captcha API Proxy
**File**: `apps/web/app/api/captcha/route.ts`

```typescript
// Server-side API route that calls POP MART API
export async function GET(request: NextRequest) {
  const response = await fetch('https://popmartstt.com/Ajax.aspx?Action=LoadCaptcha', {
    headers: {
      'Cookie': 'ASP.NET_SessionId=mnjj0tg2hw4ziwvrasnfeguf',
      'Referer': 'https://popmartstt.com/popmart',
      // ... other headers
    },
  });
  
  // Parse and return JSON response
  return NextResponse.json({ success: true, imageUrl: '...' });
}
```

### 2. Registration API Proxy
**File**: `apps/web/app/api/register/route.ts`

```typescript
// Server-side API route for registration
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Simulate registration (can be replaced with real API)
  return NextResponse.json({ success: true, message: 'Đăng ký thành công!' });
}
```

## How It Works

### Client-Side (Browser)
```typescript
// Instead of calling external API directly
fetch('https://popmartstt.com/Ajax.aspx?Action=LoadCaptcha') // ❌ CORS Error

// Call local API route
fetch('/api/captcha') // ✅ Works perfectly
```

### Server-Side (Next.js API Route)
```typescript
// API route makes the external call server-side
const response = await fetch('https://popmartstt.com/Ajax.aspx?Action=LoadCaptcha', {
  headers: { /* all required headers */ }
});
```

## Benefits

### 1. No CORS Issues
- ✅ Browser calls same-origin API (`/api/captcha`)
- ✅ Server-side calls external API (no CORS restrictions)
- ✅ Clean separation of concerns

### 2. Better Security
- ✅ API keys and sensitive headers stay on server
- ✅ Client doesn't need to know external API details
- ✅ Can add authentication/authorization

### 3. Better Error Handling
- ✅ Centralized error handling
- ✅ Consistent response format
- ✅ Better logging and monitoring

### 4. Caching & Performance
- ✅ Can implement caching at API route level
- ✅ Reduce external API calls
- ✅ Better performance

## API Routes Structure

```
apps/web/app/api/
├── captcha/
│   └── route.ts          # GET /api/captcha
└── register/
    └── route.ts          # POST /api/register
```

## Configuration

### Updated Config
```typescript
export const API_CONFIG = {
  CAPTCHA_ENDPOINT: '/api/captcha',    // Local API route
  REGISTER_ENDPOINT: '/api/register',  // Local API route
  // ... other config
};
```

### Headers Management
- **Client-side**: Only needs `Content-Type: application/json`
- **Server-side**: Handles all external API headers
- **Session Management**: Server maintains session cookies

## Testing

### Test Captcha API
```bash
# Test local API route
curl http://localhost:3000/api/captcha

# Expected response
{
  "success": true,
  "captcha": "",
  "imageUrl": "https://popmartstt.com/images/captcha/...",
  "sessionId": "mnjj0tg2hw4ziwvrasnfeguf"
}
```

### Test Registration API
```bash
# Test local API route
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@example.com",...}'

# Expected response
{
  "success": true,
  "message": "Đăng ký thành công!"
}
```

## Future Enhancements

### 1. Real Registration API
Replace simulation with actual POP MART registration API:
```typescript
// In /api/register/route.ts
const response = await fetch('https://popmartstt.com/register', {
  method: 'POST',
  headers: { /* POP MART headers */ },
  body: JSON.stringify(body)
});
```

### 2. Session Management
Implement dynamic session handling:
```typescript
// Get fresh session ID
const sessionResponse = await fetch('https://popmartstt.com/session');
const sessionId = extractSessionId(sessionResponse);
```

### 3. Caching
Add caching for captcha images:
```typescript
// Cache captcha responses
const cacheKey = `captcha_${sessionId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

### 4. Rate Limiting
Add rate limiting to prevent abuse:
```typescript
// Rate limit captcha requests
const rateLimit = await checkRateLimit(request.ip);
if (!rateLimit.allowed) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

## Troubleshooting

### Common Issues

1. **API Route Not Found**
   ```
   Error: 404 Not Found
   ```
   **Solution**: Check file path and export names

2. **External API Errors**
   ```
   Error: HTTP error! status: 500
   ```
   **Solution**: Check external API status and headers

3. **Session Expired**
   ```
   Error: Could not extract captcha image
   ```
   **Solution**: Update session cookie in config

### Debug Mode
Enable detailed logging in API routes:
```typescript
console.log('Request headers:', Object.fromEntries(request.headers));
console.log('External API response:', response.status, response.headers);
```
