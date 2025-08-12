import { NextRequest, NextResponse } from 'next/server';
import { getApiConfig } from '../../config';

export async function GET(request: NextRequest) {
  try {
    const config = getApiConfig();
    
    const response = await fetch(config.POP_MART.CAPTCHA_URL, {
      method: 'GET',
      headers: {
        ...config.DEFAULT_HEADERS,
        'Cookie': config.POP_MART.SESSION_COOKIE
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const htmlResponse = await response.text();
    
    // Parse HTML to extract image src
    const imgMatch = htmlResponse.match(/<img src='([^']+)'/);
    if (imgMatch && imgMatch[1]) {
      const imageSrc = imgMatch[1];
      const fullImageUrl = imageSrc.startsWith('http') ? imageSrc : `${config.POP_MART.BASE_URL}${imageSrc}`;
      
      return NextResponse.json({
        success: true,
        captcha: '',
        imageUrl: fullImageUrl,
        sessionId: config.POP_MART.SESSION_COOKIE.split('=')[1]
      });
    } else {
      throw new Error('Could not extract captcha image from response');
    }
  } catch (error) {
    console.error('Error fetching captcha:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
