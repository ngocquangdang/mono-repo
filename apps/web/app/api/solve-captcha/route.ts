import { NextRequest, NextResponse } from 'next/server';
import { solveCaptcha } from '../../utils/captchaSolver';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, mimeType = 'image/png' } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'imageUrl is required' 
      }, { status: 400 });
    }

    // Fetch the image from the URL and convert to base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    console.log('Solving captcha for image:', imageUrl);
    
    // Solve the captcha using Gemini AI
    const captchaText = await solveCaptcha(base64Image, mimeType);
    
    console.log('Captcha solved:', captchaText);

    return NextResponse.json({ 
      success: true, 
      captchaText: captchaText,
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error solving captcha:', error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
