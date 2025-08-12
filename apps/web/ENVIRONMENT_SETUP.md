# Environment Setup Guide

## Required Environment Variables

### Google Gemini AI API Key
To use the AI captcha solving feature, you need to set up a Google Gemini AI API key.

#### Getting Your API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

#### Setting Up Environment Variables
Create a `.env.local` file in the `apps/web` directory with the following content:

```bash
# Google Gemini AI API Key for captcha solving
GOOGLE_GENAI_API_KEY=your_actual_api_key_here
```

#### Important Notes
- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore`
- Restart your development server after adding environment variables
- The API key is used server-side only for security

## Optional Environment Variables

### Development Settings
```bash
# Enable debug logging
DEBUG=true

# Set custom timeout for API calls (in milliseconds)
API_TIMEOUT=10000
```

## Verification

To verify your environment setup:

1. Start the development server: `yarn dev`
2. Navigate to the web app
3. Try using the AI captcha solving feature
4. Check the console for any environment-related errors

## Troubleshooting

### Common Issues

#### "GOOGLE_GENAI_API_KEY environment variable not set"
- Make sure you've created the `.env.local` file
- Verify the variable name is exactly `GOOGLE_GENAI_API_KEY`
- Restart your development server

#### "API key is invalid"
- Check that you've copied the full API key
- Verify the key is active in Google AI Studio
- Ensure you have sufficient quota for the Gemini API

#### "Rate limit exceeded"
- The Google Gemini AI API has rate limits
- Consider implementing caching for repeated captchas
- Monitor your API usage in Google AI Studio
