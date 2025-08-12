# QR Generation Feature

## Overview
The QR generation feature automatically creates QR codes for successfully registered users. This feature integrates with the POP MART registration system to generate QR codes that can be used for event entry.

## API Endpoints

### QR Generation API
- **Endpoint**: `/api/qr-generation`
- **Method**: `POST`
- **Purpose**: Generate QR code image for a registered user

#### Request Body
```json
{
  "idPhien": "60", // Session ID (60 for session 1, 61 for session 2)
  "maThamDu": "ABC12345" // Registration code from successful registration
}
```

#### Response
```json
{
  "success": true,
  "qrImageUrl": "https://popmartstt.com/path/to/qr/image.png",
  "idPhien": "60",
  "maThamDu": "ABC12345"
}
```

## Integration Flow

### 1. Automatic QR Generation
When a user registration is successful:
1. The system extracts the `maThamDu` (registration code) from the response
2. Automatically calls the QR generation API
3. Stores the QR image URL in the user data
4. Displays the QR code in the UI

### 2. Manual QR Generation
For users who were registered successfully but don't have a QR code:
- A "Tạo QR Code" button appears in their registration result section
- Clicking the button manually triggers QR generation
- The QR code is then displayed and stored

## UI Components

### QR Code Display
- Shows QR image (24x24 pixels)
- Displays registration code (`maThamDu`)
- Shows session ID (`idPhien`)
- Handles image loading errors gracefully

### Manual QR Generation Button
- Only appears for successfully registered users without QR codes
- Triggers QR generation API call
- Shows loading status and error messages

## Data Storage

### UserRegistration Interface Updates
```typescript
interface UserRegistration {
  // ... existing fields
  maThamDu?: string; // QR code value
  qrImageUrl?: string; // QR image URL
  idPhien?: string; // Session ID for QR generation
}
```

## Error Handling

### QR Generation Failures
- Network errors are caught and displayed to user
- Invalid parameters return 400 error
- Server errors return 500 error
- Image loading errors show fallback message

### Fallback Mechanisms
- If QR generation fails, user can manually retry
- QR image loading errors show error message
- Missing QR codes can be generated manually

## Configuration

### API Configuration
```typescript
QR_GENERATION_ENDPOINT: '/api/qr-generation',
POP_MART: {
  QR_GENERATION_URL: 'https://popmartstt.com/DangKy.aspx/GenQRImage',
  // ... other config
}
```

## Usage Examples

### Automatic QR Generation
1. User fills registration form
2. Clicks "Đăng ký" button
3. Registration succeeds
4. QR code is automatically generated and displayed

### Manual QR Generation
1. User has successful registration but no QR code
2. Clicks "Tạo QR Code" button
3. QR code is generated and displayed
4. User can download or view the QR code

## Technical Notes

- QR generation requires valid session cookies
- Uses the same session mapping as registration
- QR images are served from POP MART servers
- All QR generation calls are logged for debugging
