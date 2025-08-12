# AI Captcha Solving Feature

## Overview
The AI captcha solving feature uses Google Gemini AI to automatically solve captcha images. This feature integrates with the POP MART registration system to automatically fill captcha input fields, improving the user experience and registration success rate.

## Technology Stack

### Google Gemini AI
- **Model**: `gemini-2.5-flash`
- **API**: Google Generative AI
- **Purpose**: Image analysis and text extraction from captcha images

## API Endpoints

### AI Captcha Solving API
- **Endpoint**: `/api/solve-captcha`
- **Method**: `POST`
- **Purpose**: Solve captcha using AI

#### Request Body
```json
{
  "imageUrl": "https://popmartstt.com/path/to/captcha/image.png",
  "mimeType": "image/png"
}
```

#### Response
```json
{
  "success": true,
  "captchaText": "ABC123",
  "imageUrl": "https://popmartstt.com/path/to/captcha/image.png"
}
```

## Integration Flow

### 1. Automatic Captcha Solving
When a user clicks the "🤖 AI Giải" button:
1. The system fetches the captcha image from the URL
2. Converts the image to base64 format
3. Sends the image to Google Gemini AI for analysis
4. Extracts the captcha text from the AI response
5. Automatically fills the captcha input field
6. Shows success/error messages to the user

### 2. Manual Captcha Solving
Users can manually trigger AI captcha solving:
- Click the "🤖 AI Giải" button next to any captcha image
- AI analyzes the image and fills the input field
- User can verify and edit the result if needed

## UI Components

### AI Captcha Solving Button
- Appears next to each captcha image
- Shows robot emoji (🤖) to indicate AI functionality
- Disabled when no captcha image is available
- Shows loading status during AI processing

### Captcha Input Field
- Automatically filled with AI-solved text
- User can manually edit if AI result is incorrect
- Integrated with existing registration flow

## Data Flow

### Image Processing
1. **Fetch Image**: Download captcha image from POP MART server
2. **Convert to Base64**: Transform image to base64 string
3. **AI Analysis**: Send to Gemini AI with specific prompt
4. **Text Extraction**: Extract captcha text from AI response
5. **Auto-fill**: Populate input field with extracted text

### Error Handling
- Network errors during image fetching
- AI API errors (invalid key, rate limits, etc.)
- Invalid image format or corrupted images
- AI unable to recognize captcha text

## Configuration

### Environment Variables
```bash
GOOGLE_GENAI_API_KEY=your_google_genai_api_key_here
```

### API Configuration
```typescript
SOLVE_CAPTCHA_ENDPOINT: '/api/solve-captcha',
```

## Usage Examples

### Automatic Captcha Solving
1. User sees captcha image
2. Clicks "🤖 AI Giải" button
3. AI analyzes image and fills input field
4. User can proceed with registration

### Manual Verification
1. AI solves captcha automatically
2. User reviews the result
3. User can edit if AI made a mistake
4. User proceeds with registration

## Technical Implementation

### Captcha Solver Utility
```typescript
export const solveCaptcha = async (base64Image: string, mimeType: string): Promise<string> => {
    // Initialize Google Gemini AI
    // Send image with specific prompt
    // Extract and return captcha text
};
```

### API Route
```typescript
// POST /api/solve-captcha
// Fetches image from URL
// Converts to base64
// Calls AI solver
// Returns captcha text
```

### UI Integration
```typescript
// AI solving button
// Automatic input filling
// Error handling and user feedback
```

## Error Handling

### Common Errors
- **API Key Missing**: Environment variable not set
- **Network Errors**: Failed to fetch captcha image
- **AI Processing Errors**: Gemini AI unable to process image
- **Invalid Response**: AI returns unexpected format

### Fallback Mechanisms
- Manual captcha input as backup
- Clear error messages for users
- Retry functionality for failed attempts
- Graceful degradation when AI is unavailable

## Security Considerations

### API Key Security
- Store API key in environment variables
- Never expose API key in client-side code
- Use server-side API routes for AI calls
- Implement rate limiting if needed

### Image Processing
- Validate image URLs before processing
- Handle malicious or corrupted images
- Implement timeout for AI processing
- Log AI usage for monitoring

## Performance Optimization

### Caching
- Cache AI results for similar captchas
- Implement request deduplication
- Use appropriate timeouts

### Rate Limiting
- Respect Google Gemini AI rate limits
- Implement client-side rate limiting
- Queue requests if needed

## Monitoring and Logging

### Usage Tracking
- Log successful captcha solves
- Track AI accuracy rates
- Monitor API usage and costs
- Alert on high error rates

### Debugging
- Log AI responses for analysis
- Track image processing times
- Monitor network performance
- Debug failed captcha solves

## Future Enhancements

### Potential Improvements
- Multiple AI model support
- Captcha difficulty analysis
- Learning from user corrections
- Batch processing for multiple captchas
- Offline captcha solving capabilities
