# Captcha Feature Implementation

## Overview
The system now integrates with the real POP MART captcha API to display actual captcha images and allow users to input the captcha code before registration.

## API Integration

### Real Captcha API
- **Endpoint**: `https://popmartstt.com/Ajax.aspx?Action=LoadCaptcha`
- **Method**: `GET`
- **Response**: HTML containing `<img>` tag with captcha image
- **Headers**: Includes session cookie and referer for authentication

### API Response Format
```html
<img src='/images/captcha/20B784A0A15146C3173DC21EB6B85E7C.jpg' style='margin-top: -50px;height: 45px; border-radius: 10px;margin-left: 3px;' />
```

## User Interface

### Section 2 - User List
Each user now has an enhanced registration flow:

1. **Register Button**: Click to fetch captcha
2. **Captcha Display**: Shows real captcha image from POP MART API
3. **Input Field**: Text input for captcha code
4. **Submit Button**: Submit captcha and proceed with registration

### Captcha Section Layout
```
┌─────────────────────────────────────────────────────────┐
│ [Đăng ký] [Chi tiết] [Xóa] [📋 Copy cURL]              │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Captcha Image] [Input Field] [Submit]             │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. Captcha Data Management
```typescript
const [captchaData, setCaptchaData] = useState<{ 
  [userId: string]: { 
    imageUrl: string; 
    sessionId: string; 
    captchaInput: string 
  } 
}>({});
```

### 2. API Call Flow
1. **Fetch Captcha**: Call POP MART API with proper headers
2. **Parse Response**: Extract image URL from HTML response
3. **Display Image**: Show captcha image to user
4. **User Input**: User enters captcha code
5. **Submit**: Send registration with captcha code

### 3. Error Handling
- **Network Errors**: Fallback to generated captcha
- **Parse Errors**: Show error message in status panel
- **Timeout**: 10-second timeout with AbortController

## Configuration

### Headers Required
```typescript
headers: {
  'accept': '*/*',
  'accept-language': 'vi-VN,vi;q=0.9',
  'Cookie': 'ASP.NET_SessionId=mnjj0tg2hw4ziwvrasnfeguf',
  'Referer': 'https://popmartstt.com/popmart',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
}
```

### Session Management
- Session ID is included in API calls
- Session cookie is maintained for captcha requests
- Session data is stored per user

## User Experience

### Step-by-Step Flow
1. **Create User**: Fill form in Column 1 and save
2. **View User**: User appears in Column 2 (User List)
3. **Get Captcha**: Click "Đăng ký" button
4. **See Image**: Real captcha image loads from POP MART
5. **Enter Code**: Type captcha code in input field
6. **Submit**: Click "Submit" to register with captcha
7. **Result**: Registration result shown in status panel

### Visual Features
- **Captcha Image**: Styled with original POP MART CSS
- **Input Field**: Limited to 6 characters
- **Submit Button**: Disabled until input is provided
- **Status Updates**: Real-time feedback in Column 3

## Security Considerations

### CORS Handling
- Real API calls may face CORS restrictions
- Fallback mechanism for development/testing
- Proper error handling for network issues

### Session Security
- Session cookies are included in requests
- Session ID management for each user
- Proper cleanup after registration

## Testing

### Manual Testing
1. Create a user in Column 1
2. Click "Đăng ký" in Column 2
3. Verify captcha image loads
4. Enter captcha code
5. Click "Submit"
6. Check registration result

### API Testing
```bash
curl 'https://popmartstt.com/Ajax.aspx?Action=LoadCaptcha' \
  -H 'accept: */*' \
  -H 'accept-language: vi-VN,vi;q=0.9' \
  -b 'ASP.NET_SessionId=mnjj0tg2hw4ziwvrasnfeguf' \
  -H 'referer: https://popmartstt.com/popmart' \
  -H 'user-agent: Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
```

## Future Enhancements

- **Auto-refresh**: Refresh captcha if expired
- **Multiple Attempts**: Allow retry on wrong captcha
- **Session Management**: Dynamic session handling
- **Error Recovery**: Better error handling and recovery
