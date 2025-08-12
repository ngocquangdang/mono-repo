# Email Sending Feature

## Overview
The email sending feature automatically sends confirmation emails to users after successful registration. This feature integrates with the POP MART registration system to send emails containing registration details and QR codes.

## API Endpoints

### Email Sending API
- **Endpoint**: `/api/send-email`
- **Method**: `GET`
- **Purpose**: Send confirmation email to registered user

#### Query Parameters
```
?idPhien=60&MaThamDu=ABC12345
```

- `idPhien`: Session ID (60 for session 1, 61 for session 2)
- `MaThamDu`: Registration code from successful registration

#### Response
```json
{
  "success": true,
  "message": "Email sent successfully",
  "response": "True",
  "idPhien": "60",
  "maThamDu": "ABC12345"
}
```

## Integration Flow

### 1. Automatic Email Sending
When a user registration is successful and QR code is generated:
1. The system automatically calls the email sending API
2. Email is sent to the user's registered email address
3. Email status is stored in the user data
4. Success/error messages are displayed to the user

### 2. Manual Email Sending
For users who were registered successfully but haven't received an email:
- A "Gửi Email" button appears in their registration result section
- Clicking the button manually triggers email sending
- Email status is updated and displayed

## UI Components

### Email Status Display
- Shows email sent status with timestamp
- Displays green checkmark for successful email sending
- Shows Vietnamese formatted date/time

### Manual Email Button
- Only appears for successfully registered users without sent emails
- Triggers email sending API call
- Shows loading status and error messages

## Data Storage

### UserRegistration Interface Updates
```typescript
interface UserRegistration {
  // ... existing fields
  emailSent?: boolean; // Email sending status
  emailSentDate?: string; // Email sent timestamp
}
```

## Error Handling

### Email Sending Failures
- Network errors are caught and displayed to user
- Invalid parameters return 400 error
- Server errors return 500 error
- POP MART API errors are handled gracefully

### Fallback Mechanisms
- If email sending fails, user can manually retry
- Email status is tracked and displayed
- Failed emails can be resent manually

## Configuration

### API Configuration
```typescript
EMAIL_ENDPOINT: '/api/send-email',
POP_MART: {
  EMAIL_URL: 'https://popmartstt.com/Ajax.aspx?Action=SendEmail',
  // ... other config
}
```

## Usage Examples

### Automatic Email Sending
1. User fills registration form
2. Clicks "Đăng ký" button
3. Registration succeeds
4. QR code is generated
5. Email is automatically sent
6. Success message is displayed

### Manual Email Sending
1. User has successful registration but no email sent
2. Clicks "Gửi Email" button
3. Email is sent to registered email address
4. Email status is updated and displayed

## Technical Notes

- Email sending requires valid session cookies
- Uses the same session mapping as registration
- Email content is managed by POP MART servers
- All email sending calls are logged for debugging
- Email addresses are taken from user registration data

## Email Content
The email content is managed by the POP MART system and typically includes:
- Registration confirmation
- Event details (date, time, location)
- QR code for event entry
- User's registration information
- Terms and conditions

## Security Considerations
- Email sending requires valid registration codes
- Session cookies are validated for each request
- Email addresses are verified during registration
- Failed attempts are logged for monitoring
