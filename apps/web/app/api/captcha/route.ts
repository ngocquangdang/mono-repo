import { NextRequest, NextResponse } from 'next/server';
import { getApiConfig } from '../../config';

export async function GET(request: NextRequest) {
  try {
    const config = getApiConfig();
    
    const response = await fetch(config.POP_MART.CAPTCHA_URL, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'accept-language': 'vi-VN,vi;q=0.9',
        'priority': 'u=1, i',
        'referer': 'https://popmartstt.com/popmart',
        'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const htmlResponse = await response.text();
    
    // Parse HTML to extract image src
    const imgMatch = htmlResponse.match(/<img src='([^']+)'/);
    if (imgMatch && imgMatch[1]) {
      const imageSrc = imgMatch[1];
      // Construct the full image URL
      const imageUrl = `${config.POP_MART.BASE_URL}/${imageSrc}`;
      
      return NextResponse.json({
        success: true,
        captcha: '',
        imageUrl: imageUrl,
        sessionId: 'default-session-id'
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
