# Real POP MART API Integration

## Overview
The system now integrates with the real POP MART APIs for both captcha and registration, using the exact same parameters and headers as the provided cURL commands.

## API Endpoints

### 1. Captcha API
- **URL**: `https://popmartstt.com/Ajax.aspx?Action=LoadCaptcha`
- **Method**: `GET`
- **Response**: HTML with `<img>` tag containing captcha image

### 2. Registration API
- **URL**: `https://popmartstt.com/Ajax.aspx?Action=DangKyThamDu`
- **Method**: `GET`
- **Parameters**: URL query parameters for all form data

## Parameter Mapping

### Form Data to API Parameters
```typescript
// Our form data → POP MART API parameters
{
  session: 'session 1 (09:00 - 11:00)' → idPhien: '60'
  session: 'session 2 (13:30 - 15:30)' → idPhien: '61'
  fullName → HoTen
  dateOfBirth.day → NgaySinh_Ngay
  dateOfBirth.month → NgaySinh_Thang
  dateOfBirth.year → NgaySinh_Nam
  phoneNumber → SoDienThoai
  email → Email
  idCard → CCCD
  captcha → Captcha
}
```

### Fixed Parameters
```typescript
Action: 'DangKyThamDu'
idNgayBanHang: '37' // Fixed sales date ID
```

## Configuration

### POP MART Config
```typescript
POP_MART: {
  BASE_URL: 'https://popmartstt.com',
  CAPTCHA_URL: 'https://popmartstt.com/Ajax.aspx?Action=LoadCaptcha',
  REGISTER_URL: 'https://popmartstt.com/Ajax.aspx?Action=DangKyThamDu',
  
  SESSION_COOKIE: 'ASP.NET_SessionId=mnjj0tg2hw4ziwvrasnfeguf; ASP.NET_SessionId=o1avbq3vdietu53kjcbcnlwm',
  
  PARAMS: {
    idNgayBanHang: '37',
    SESSION_MAPPING: {
      'session 1 (09:00 - 11:00)': '60',
      'session 2 (13:30 - 15:30)': '61'
    }
  }
}
```

## Headers Required

### All API Calls
```typescript
headers: {
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
  'Cookie': 'ASP.NET_SessionId=mnjj0tg2hw4ziwvrasnfeguf; ASP.NET_SessionId=o1avbq3vdietu53kjcbcnlwm'
}
```

## Implementation Details

### 1. Captcha API Route
```typescript
// /api/captcha/route.ts
const response = await fetch(config.POP_MART.CAPTCHA_URL, {
  method: 'GET',
  headers: {
    ...config.DEFAULT_HEADERS,
    'Cookie': config.POP_MART.SESSION_COOKIE
  },
});

// Parse HTML response
const imgMatch = htmlResponse.match(/<img src='([^']+)'/);
const fullImageUrl = `${config.POP_MART.BASE_URL}${imageSrc}`;
```

### 2. Registration API Route
```typescript
// /api/register/route.ts
const params = new URLSearchParams({
  Action: 'DangKyThamDu',
  idNgayBanHang: config.POP_MART.PARAMS.idNgayBanHang,
  idPhien: config.POP_MART.PARAMS.SESSION_MAPPING[body.session],
  HoTen: body.fullName,
  NgaySinh_Ngay: body.dateOfBirth.day,
  NgaySinh_Thang: body.dateOfBirth.month,
  NgaySinh_Nam: body.dateOfBirth.year,
  SoDienThoai: body.phoneNumber,
  Email: body.email,
  CCCD: body.idCard,
  Captcha: body.captcha
});

const url = `${config.POP_MART.REGISTER_URL}&${params.toString()}`;
```

### 3. cURL Command Generation
```typescript
// Generate real cURL command for testing
const getCurlCommand = (user: UserRegistration) => {
  const idPhien = config.POP_MART.PARAMS.SESSION_MAPPING[user.session];
  const params = new URLSearchParams({ /* mapped parameters */ });
  
  return `curl --location '${config.POP_MART.REGISTER_URL}&${params.toString()}' \\
  --header 'accept: */*' \\
  --header 'Cookie: ${config.POP_MART.SESSION_COOKIE}' \\
  // ... all headers
`;
};
```

## Testing

### Test Captcha API
```bash
curl http://localhost:3000/api/captcha

# Expected response
{
  "success": true,
  "captcha": "",
  "imageUrl": "https://popmartstt.com/images/captcha/FD0566A6F2CF84589156D2C2428D2B98.jpg",
  "sessionId": "mnjj0tg2hw4ziwvrasnfeguf"
}
```

### Test Registration API
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phoneNumber": "0921730001",
    "idCard": "123123123123",
    "captcha": "test123",
    "session": "session 1 (09:00 - 11:00)",
    "dateOfBirth": {"day": "12", "month": "12", "year": "1990"}
  }'

# Expected response
{
  "success": false,
  "message": "Đăng ký thất bại, vui lòng thử lại."
}
```

### Test Real cURL Command
```bash
# Generated cURL command from the system
curl --location 'https://popmartstt.com/Ajax.aspx?Action=DangKyThamDu&idNgayBanHang=37&idPhien=60&HoTen=Test%20User&NgaySinh_Ngay=12&NgaySinh_Thang=12&NgaySinh_Nam=1990&SoDienThoai=0921730001&Email=test%40example.com&CCCD=123123123123&Captcha=test123' \
  --header 'accept: */*' \
  --header 'Cookie: ASP.NET_SessionId=mnjj0tg2hw4ziwvrasnfeguf; ASP.NET_SessionId=o1avbq3vdietu53kjcbcnlwm' \
  // ... all headers
```

## User Flow

### Complete Registration Process
1. **Create User**: Fill form in Column 1 and save
2. **Get Captcha**: Click "Đăng ký" → Call `/api/captcha` → Get real captcha image
3. **Enter Captcha**: User enters captcha code in input field
4. **Submit Registration**: Click "Submit" → Call `/api/register` → Real POP MART API
5. **View Result**: Registration result shown in status panel

### Real API Calls
```
Browser → /api/captcha → POP MART Captcha API
Browser → /api/register → POP MART Registration API
```

## Error Handling

### Common Issues
1. **Invalid Captcha**: Wrong captcha code
2. **Session Expired**: Need to refresh session cookie
3. **Network Errors**: External API unavailable
4. **Parameter Errors**: Missing or invalid parameters

### Response Parsing
```typescript
// Parse POP MART response
if (responseText.includes('thành công') || responseText.includes('success')) {
  return { success: true, message: 'Đăng ký thành công!' };
} else {
  return { success: false, message: responseText };
}
```

## Future Enhancements

### 1. Dynamic Session Management
```typescript
// Get fresh session ID
const sessionResponse = await fetch('https://popmartstt.com/session');
const newSessionId = extractSessionId(sessionResponse);
```

### 2. Real-time Captcha Refresh
```typescript
// Auto-refresh captcha if expired
if (captchaExpired) {
  await refreshCaptcha();
}
```

### 3. Response Validation
```typescript
// Better response parsing
const parseResponse = (responseText: string) => {
  if (responseText.includes('Mã captcha không đúng')) {
    return { success: false, message: 'Mã captcha không đúng' };
  }
  // ... other validations
};
```

### 4. Rate Limiting
```typescript
// Prevent API abuse
const rateLimit = await checkRateLimit(request.ip);
if (!rateLimit.allowed) {
  return { error: 'Rate limit exceeded' };
}
```

## Security Considerations

### 1. Session Management
- Session cookies are included in all requests
- Session IDs may expire and need refresh
- Multiple session IDs in cookie string

### 2. Parameter Validation
- All user inputs are validated before sending
- URL encoding for special characters
- Proper parameter mapping

### 3. Error Handling
- Graceful fallback for API failures
- User-friendly error messages
- Detailed logging for debugging
