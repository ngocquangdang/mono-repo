# API Setup Guide

## Overview
The POP MART Registration System now uses real fetch API calls instead of simulated responses. This guide explains how to configure and use the API endpoints.

## Configuration

### 1. API Endpoints
Edit `apps/web/app/config.ts` to set your actual API endpoints:

```typescript
export const API_CONFIG = {
  CAPTCHA_ENDPOINT: 'https://your-api.com/captcha',
  REGISTER_ENDPOINT: 'https://your-api.com/register',
  // ... other config
};
```

### 2. Environment Variables (Optional)
For development, you can use environment variables:

```bash
# .env.local
NEXT_PUBLIC_CAPTCHA_ENDPOINT=https://dev-api.com/captcha
NEXT_PUBLIC_REGISTER_ENDPOINT=https://dev-api.com/register
```

## API Specifications

### 1. Captcha API
**Endpoint:** `GET /captcha`

**Response:**
```json
{
  "captcha": "abc123",
  "success": true
}
```

**Error Response:**
```json
{
  "error": "Failed to generate captcha",
  "success": false
}
```

### 2. Registration API
**Endpoint:** `POST /register`

**Request Body:**
```json
{
  "salesDate": "10/08/2025",
  "session": "session 2 (13:30 - 15:30)",
  "fullName": "Đặng Văn Thay",
  "dateOfBirth": {
    "day": "13",
    "month": "09",
    "year": "1995"
  },
  "phoneNumber": "0902653215",
  "email": "Dangvanthay.1995@gmail.com",
  "idCard": "048095009075",
  "captcha": "abc123",
  "termsAccepted": true
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công!",
  "data": {
    "registrationId": "reg_123456"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Đăng ký thất bại: Invalid captcha"
}
```

## Features

### 1. Timeout Handling
- Default timeout: 10 seconds
- Configurable via `API_CONFIG.TIMEOUT`
- Automatic fallback for captcha generation

### 2. Error Handling
- Network errors
- HTTP status errors
- Timeout errors
- JSON parsing errors

### 3. Fallback Mechanisms
- If captcha API fails, generates random captcha
- Graceful degradation for network issues

## Testing

### 1. Mock API for Testing
You can use services like:
- [JSON Server](https://github.com/typicode/json-server)
- [MockAPI](https://mockapi.io/)
- [Postman Mock Server](https://learning.postman.com/docs/designing-and-developing-your-api/mocking-data/)

### 2. Example Mock Setup
```bash
# Install JSON Server
npm install -g json-server

# Create db.json
{
  "captcha": {
    "captcha": "test123"
  },
  "register": {
    "success": true,
    "message": "Đăng ký thành công!"
  }
}

# Start mock server
json-server --watch db.json --port 3001
```

Then update config:
```typescript
CAPTCHA_ENDPOINT: 'http://localhost:3001/captcha',
REGISTER_ENDPOINT: 'http://localhost:3001/register',
```

## Security Considerations

1. **CORS**: Ensure your API allows requests from your frontend domain
2. **Authentication**: Add auth headers if required
3. **Rate Limiting**: Implement rate limiting on your API
4. **Validation**: Validate all input data on the server side

## Troubleshooting

### Common Issues

1. **CORS Error**
   ```
   Access to fetch at 'https://api.example.com' from origin 'http://localhost:3000' has been blocked by CORS policy
   ```
   **Solution:** Configure CORS on your API server

2. **Timeout Error**
   ```
   Đăng ký thất bại: Request timeout
   ```
   **Solution:** Increase timeout in config or optimize API response time

3. **Network Error**
   ```
   Đăng ký thất bại: Failed to fetch
   ```
   **Solution:** Check API endpoint URL and network connectivity

### Debug Mode
Enable detailed logging by checking browser console for:
- Request/response data
- Error details
- Network timing
