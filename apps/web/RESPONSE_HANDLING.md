# Response Handling Implementation

## Overview
The system now properly handles and displays real POP MART API responses in the UI, including both success and error messages.

## API Response Flow

### 1. POP MART API Response Format
```html
<!-- Error Response -->
<div>Captcha không hợp lệ!</div>
<div style='font-style:italic;margin-top: 5px;'>Invalid captcha!</div>

<!-- Success Response (expected) -->
<div>Đăng ký thành công!</div>
```

### 2. API Route Processing (`/api/register/route.ts`)

#### Fetch Request
```typescript
const response = await fetch(url, {
  method: 'GET',
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
    'Cookie': config.POP_MART.SESSION_COOKIE
  },
  cache: 'no-store'
});
```

#### Fallback to cURL
```typescript
// If fetch fails, use curl as fallback
const curlCommand = `curl -s '${url}' -H 'Cookie: ${config.POP_MART.SESSION_COOKIE}'`;
const { stdout, stderr } = await execAsync(curlCommand);
htmlResponse = stdout;
```

#### HTML Response Parsing
```typescript
// Parse HTML response to extract the message
const divMatch = htmlResponse.match(/<div[^>]*>(.*?)<\/div>/i);
if (divMatch && divMatch[1]) {
  message = divMatch[1].trim();
  
  // Determine success based on message content
  if (message.includes('thành công') || 
      message.includes('successful') || 
      message.includes('success') ||
      message.includes('đăng ký thành công') ||
      message.includes('registration successful')) {
    success = true;
  } else if (message.includes('không hợp lệ') || 
             message.includes('invalid') ||
             message.includes('thất bại') ||
             message.includes('failed') ||
             message.includes('lỗi') ||
             message.includes('error')) {
    success = false;
  } else {
    success = responseStatus === 200;
  }
}
```

### 3. Client-Side Processing (`UserList.tsx`)

#### Registration Handler
```typescript
const handleCaptchaSubmit = async (user: UserRegistration) => {
  // Register user
  const registrationResponse = await apiUtils.registerUser(updatedUser);
  
  console.log('Registration response:', registrationResponse);
  
  // Update user with registration result
  const resultMessage = registrationResponse.success 
    ? `✅ ${registrationResponse.message}`
    : `❌ ${registrationResponse.message}`;
  
  storageUtils.updateUser(user.id, {
    registrationResult: resultMessage,
    isRegistered: registrationResponse.success
  });
  
  // Update status with detailed message
  onStatusUpdate(`Registration result for ${user.fullName}: ${registrationResponse.message}`);
  
  // If registration failed due to invalid captcha, suggest refreshing
  if (!registrationResponse.success && 
      (registrationResponse.message.includes('captcha') || 
       registrationResponse.message.includes('Captcha'))) {
    onStatusUpdate('Captcha không hợp lệ. Vui lòng thử lại với captcha mới.');
  }
};
```

### 4. UI Display

#### Registration Result Display
```tsx
{user.registrationResult && (
  <div className={`text-sm p-2 rounded mt-2 ${
    user.registrationResult.includes('✅') || user.registrationResult.includes('thành công')
      ? 'bg-green-100 text-green-800 border border-green-200' 
      : 'bg-red-100 text-red-800 border border-red-200'
  }`}>
    <div className="font-medium">Registration Result:</div>
    <div className="mt-1">{user.registrationResult}</div>
    {user.isRegistered && (
      <div className="text-xs text-green-600 mt-1">
        ✅ User has been successfully registered
      </div>
    )}
  </div>
)}
```

## Response Examples

### Error Response (Invalid Captcha)
```json
{
  "success": false,
  "message": "Captcha không hợp lệ!",
  "data": {
    "rawHtml": "<div>Captcha không hợp lệ!</div><div style='font-style:italic;margin-top: 5px;'>Invalid captcha!</div>",
    "httpStatus": 200,
    "method": "fetch"
  }
}
```

### Success Response (Expected)
```json
{
  "success": true,
  "message": "Đăng ký thành công!",
  "data": {
    "rawHtml": "<div>Đăng ký thành công!</div>",
    "httpStatus": 200,
    "method": "fetch"
  }
}
```

## Error Handling

### 1. Network Errors
```typescript
try {
  const response = await apiUtils.registerUser(updatedUser);
  // Process response
} catch (error) {
  console.error('Registration error:', error);
  onStatusUpdate(`Lỗi đăng ký: ${(error as Error).message}`);
  
  // Update user with error message
  storageUtils.updateUser(user.id, {
    registrationResult: `❌ Lỗi: ${(error as Error).message}`,
    isRegistered: false
  });
}
```

### 2. Invalid Captcha Handling
```typescript
// If registration failed due to invalid captcha, suggest refreshing
if (!registrationResponse.success && 
    (registrationResponse.message.includes('captcha') || 
     registrationResponse.message.includes('Captcha'))) {
  onStatusUpdate('Captcha không hợp lệ. Vui lòng thử lại với captcha mới.');
}
```

### 3. HTTP Status Errors
```typescript
if (responseStatus !== 200) {
  success = false;
  message = `HTTP Error ${responseStatus}: ${message}`;
}
```

## Testing

### Manual Testing
1. **Create User**: Fill form in Column 1 and save
2. **Get Captcha**: Click "Đăng ký" → Captcha appears inline
3. **Enter Wrong Captcha**: Type incorrect captcha code
4. **Submit**: Click "Đăng ký" again
5. **Verify Error**: Should see "❌ Captcha không hợp lệ!" in result
6. **Refresh Captcha**: Click refresh button (🔄) to get new captcha
7. **Enter Correct Captcha**: Type correct captcha code
8. **Submit Again**: Click "Đăng ký" again
9. **Verify Success**: Should see "✅ Đăng ký thành công!" in result

### API Testing
```bash
# Test with invalid captcha
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phoneNumber": "0921730001",
    "idCard": "123123123123",
    "captcha": "wrong123",
    "session": "session 1 (09:00 - 11:00)",
    "dateOfBirth": {"day": "12", "month": "12", "year": "1990"}
  }'

# Expected response
{
  "success": false,
  "message": "Captcha không hợp lệ!",
  "data": {
    "rawHtml": "<div>Captcha không hợp lệ!</div>...",
    "httpStatus": 200,
    "method": "fetch"
  }
}
```

## Debugging

### Console Logs
The API route includes extensive logging:
```typescript
console.log('Registration URL:', url);
console.log('Registration data:', body);
console.log('Using session cookie:', config.POP_MART.SESSION_COOKIE);
console.log('Fetch response status:', responseStatus);
console.log('Fetch response length:', htmlResponse.length);
console.log('Final HTML response:', htmlResponse);
console.log('Parsed response:', { success, message });
```

### Response Data
The API response includes debugging information:
```typescript
{
  success: boolean,
  message: string,
  data: {
    rawHtml: string,        // Raw HTML response for debugging
    httpStatus: number,     // HTTP status code
    method: string         // 'fetch' or 'curl'
  }
}
```

## Future Enhancements

### 1. Better Error Messages
```typescript
// Map specific error messages to user-friendly versions
const errorMessages = {
  'Captcha không hợp lệ!': 'Mã captcha không đúng, vui lòng thử lại',
  'Email đã tồn tại': 'Email này đã được đăng ký',
  'Số điện thoại không hợp lệ': 'Số điện thoại không đúng định dạng'
};
```

### 2. Auto-refresh on Captcha Error
```typescript
// Automatically refresh captcha if invalid
if (message.includes('Captcha không hợp lệ')) {
  await handleRegister(user); // Get new captcha
}
```

### 3. Response Validation
```typescript
// Validate response format
if (!htmlResponse || htmlResponse.length === 0) {
  throw new Error('Empty response from POP MART API');
}
```

## Conclusion

The response handling system now properly:
- ✅ **Parses HTML responses** from POP MART API
- ✅ **Extracts meaningful messages** from div content
- ✅ **Determines success/failure** based on message content
- ✅ **Displays results** in the UI with appropriate styling
- ✅ **Handles errors gracefully** with fallback mechanisms
- ✅ **Provides debugging information** for troubleshooting

The system is now ready for real-world usage with proper error handling and user feedback.
