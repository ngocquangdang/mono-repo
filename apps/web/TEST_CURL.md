# Test Copy cURL Feature

## How to Test

### 1. Create a User
1. Go to http://localhost:3000
2. Fill out the registration form in Column 1
3. Click "Lưu" to save the user
4. The user will appear in Column 2 (User List)

### 2. Test Copy cURL Button
1. In Column 2, find your saved user
2. Click the "📋 Copy cURL" button
3. Check Column 3 (Status Panel) for confirmation
4. The cURL command will be copied to clipboard

### 3. Example cURL Command
The copied command will look like this:
```bash
curl -X POST "https://api.example.com/register" \
  -H "Content-Type: application/json" \
  -d '{
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
  "captcha": "gpe9t",
  "termsAccepted": true
}'
```

### 4. Test the cURL Command
1. Open terminal
2. Paste the copied cURL command
3. Press Enter to execute
4. Check the response

### 5. Features
- ✅ **Copy to Clipboard**: Uses modern clipboard API with fallback
- ✅ **Tooltip**: Hover to see the full command
- ✅ **Status Update**: Shows confirmation in status panel
- ✅ **Icon**: 📋 clipboard icon for better UX
- ✅ **Error Handling**: Graceful fallback for older browsers

### 6. Troubleshooting
- If copy doesn't work, check browser console for errors
- Make sure you have a user saved before testing
- The command uses the API endpoint from config.ts
