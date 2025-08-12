# Dynamic Sales Dates Feature

## Overview
The system now fetches sales dates dynamically from the POP MART registration page instead of using hardcoded values. This ensures that the available sales dates are always up-to-date and match the actual POP MART system.

## API Endpoint

### GET `/api/sales-dates`
Fetches the POP MART registration page and parses the HTML to extract available sales dates.

#### Request
```bash
GET /api/sales-dates
```

#### Response
```json
{
  "success": true,
  "salesDates": [
    {
      "value": "35",
      "date": "13/08/2025",
      "displayText": "13/08/2025 (ID: 35)"
    },
    {
      "value": "36", 
      "date": "14/08/2025",
      "displayText": "14/08/2025 (ID: 36)"
    },
    {
      "value": "37",
      "date": "15/08/2025", 
      "displayText": "15/08/2025 (ID: 37)"
    },
    {
      "value": "38",
      "date": "16/08/2025",
      "displayText": "16/08/2025 (ID: 38)"
    }
  ],
  "total": 4
}
```

## Implementation Details

### 1. HTML Parsing
The API fetches the POP MART registration page and uses regex to extract sales dates from the select element:

```html
<select name="slNgayBanHang" id="slNgayBanHang" onchange="LoadPhien()" class="MySelect">
  <option value="35">13/08/2025</option>
  <option value="36">14/08/2025</option>
  <option value="37">15/08/2025</option>
  <option value="38">16/08/2025</option>
  <option selected="selected" value="">-- Chọn --</option>
</select>
```

### 2. Regex Pattern
```typescript
const salesDateRegex = /<option value="(\d+)">([^<]+)<\/option>/g;
```

This regex extracts:
- `value`: The numeric ID (e.g., "35", "36", "37", "38")
- `displayText`: The date string (e.g., "13/08/2025", "14/08/2025")

### 3. Data Structure
```typescript
export interface SalesDate {
  value: string;        // The numeric ID used in API calls
  date: string;         // The formatted date string
  displayText: string;  // User-friendly display text
}
```

## Frontend Integration

### 1. Registration Form (Column 1)
The sales date field is now a dynamic select dropdown:

```tsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Sales date (Ngày bán hàng)
  </label>
  {isLoadingSalesDates ? (
    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
      Loading sales dates...
    </div>
  ) : (
    <select
      value={formData.salesDate}
      onChange={handleSalesDateChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
    >
      <option value="">-- Chọn ngày bán hàng --</option>
      {salesDates.map((date) => (
        <option key={date.value} value={date.value}>
          {date.displayText}
        </option>
      ))}
    </select>
  )}
</div>
```

### 2. User List Edit Form (Column 2)
The edit form also uses dynamic sales dates:

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Sales date
  </label>
  {isLoadingSalesDates ? (
    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
      Loading...
    </div>
  ) : (
    <select
      value={editingUser.salesDate}
      onChange={(e) => handleEditChange('salesDate', e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
    >
      <option value="">-- Chọn ngày bán hàng --</option>
      {salesDates.map((date) => (
        <option key={date.value} value={date.value}>
          {date.displayText}
        </option>
      ))}
    </select>
  )}
</div>
```

## API Integration

### 1. Registration API
The registration API now uses the dynamic `idNgayBanHang` from the selected sales date:

```typescript
const params = new URLSearchParams({
  Action: 'DangKyThamDu',
  idNgayBanHang: body.salesDate, // Dynamic from user selection
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
```

### 2. cURL Command Generation
The cURL command generation also uses the dynamic sales date:

```typescript
const getCurlCommand = (user: UserRegistration) => {
  const params = new URLSearchParams({
    Action: 'DangKyThamDu',
    idNgayBanHang: user.salesDate, // Dynamic from user data
    idPhien: sessionMapping[user.session],
    // ... other parameters
  });
  
  return `curl --location 'https://popmartstt.com/Ajax.aspx?${params.toString()}' \\
  --header 'accept: */*' \\
  --header 'Cookie: ${sessionCookie}' \\
  // ... other headers
`;
};
```

## Configuration Updates

### 1. API Config
```typescript
export const API_CONFIG = {
  CAPTCHA_ENDPOINT: '/api/captcha',
  REGISTER_ENDPOINT: '/api/register',
  SALES_DATES_ENDPOINT: '/api/sales-dates', // New endpoint
  
  POP_MART: {
    BASE_URL: 'https://popmartstt.com',
    CAPTCHA_URL: 'https://popmartstt.com/Ajax.aspx?Action=LoadCaptcha',
    REGISTER_URL: 'https://popmartstt.com/Ajax.aspx?Action=DangKyThamDu',
    REGISTRATION_PAGE_URL: 'https://popmartstt.com/popmart', // New URL
    
    PARAMS: {
      // idNgayBanHang removed - now dynamic
      SESSION_MAPPING: {
        'session 1 (09:00 - 11:00)': '60',
        'session 2 (13:30 - 15:30)': '61'
      }
    }
  }
};
```

### 2. Utils
Added new function to fetch sales dates:

```typescript
export const apiUtils = {
  // ... existing functions ...
  
  getSalesDates: async (): Promise<{ success: boolean; salesDates: SalesDate[]; error?: string }> => {
    try {
      const config = getApiConfig();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.TIMEOUT);

      const response = await fetch(config.SALES_DATES_ENDPOINT, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        salesDates: data.salesDates || [],
        error: data.error
      };
    } catch (error) {
      console.error('Error fetching sales dates:', error);
      return {
        success: false,
        salesDates: [],
        error: (error as Error).message
      };
    }
  }
};
```

## User Experience

### 1. Loading States
- Shows "Loading sales dates..." while fetching
- Disables the select dropdown during loading
- Provides visual feedback to users

### 2. Default Selection
- Automatically selects the first available sales date
- Users can change to any available date
- Maintains selection when editing existing users

### 3. Error Handling
- Gracefully handles API failures
- Shows appropriate error messages
- Falls back to empty state if needed

## Benefits

### 1. Always Up-to-Date
- ✅ **Real-time Data**: Sales dates are always current
- ✅ **No Manual Updates**: No need to update hardcoded values
- ✅ **Automatic Sync**: Changes in POP MART are reflected immediately

### 2. Better User Experience
- ✅ **Accurate Options**: Users see only valid sales dates
- ✅ **Clear Display**: Shows both date and ID for clarity
- ✅ **Loading States**: Proper feedback during data fetching

### 3. Improved Reliability
- ✅ **Dynamic Values**: No risk of using outdated IDs
- ✅ **Error Handling**: Robust error handling for API failures
- ✅ **Fallback Support**: Graceful degradation if API fails

### 4. Enhanced Debugging
- ✅ **cURL Commands**: Generated commands use correct IDs
- ✅ **API Calls**: All API calls use the right parameters
- ✅ **Logging**: Comprehensive logging for troubleshooting

## Testing

### Manual Testing
1. **Load Page**: Check that sales dates are fetched on page load
2. **Select Date**: Verify that different dates can be selected
3. **Save User**: Ensure the selected date is saved correctly
4. **Edit User**: Confirm that editing preserves the selected date
5. **Registration**: Test that registration uses the correct date ID

### API Testing
```bash
# Test sales dates endpoint
curl -X GET http://localhost:3000/api/sales-dates

# Test registration with dynamic date
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "salesDate": "37",
    "session": "session 1 (09:00 - 11:00)",
    "fullName": "Test User",
    "email": "test@example.com",
    "phoneNumber": "0901234567",
    "idCard": "123456789012",
    "captcha": "ABC123",
    "dateOfBirth": {"day": "15", "month": "06", "year": "1990"}
  }'
```

## Conclusion

The dynamic sales dates feature provides:

- ✅ **Real-time Data**: Always up-to-date sales dates
- ✅ **Better UX**: Clear, user-friendly interface
- ✅ **Reliable API**: Robust error handling and fallbacks
- ✅ **Accurate Registration**: Correct IDs used in all API calls
- ✅ **Easy Maintenance**: No manual updates required

The system now automatically adapts to changes in the POP MART system, ensuring users always have access to the correct and current sales dates.
