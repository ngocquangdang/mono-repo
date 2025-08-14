import { NextRequest, NextResponse } from 'next/server';
import { getApiConfig } from '../../config';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idPhien = searchParams.get('idPhien');
    const maThamDu = searchParams.get('MaThamDu');
    
    if (!idPhien || !maThamDu) {
      return NextResponse.json({ 
        success: false, 
        error: 'idPhien and MaThamDu are required' 
      }, { status: 400 });
    }

    const config = getApiConfig();
    
    // Construct the email URL with query parameters
    const emailUrl = `${config.POP_MART.EMAIL_URL}&idPhien=${idPhien}&MaThamDu=${maThamDu}`;
    
    console.log('Sending email for:', { idPhien, maThamDu });
    console.log('Email URL:', emailUrl);
    
    const response = await fetch(emailUrl, {
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

    const responseText = await response.text();
    console.log('Email response:', responseText);

    // The response should be "True" if email was sent successfully
    const isSuccess = responseText.trim() === "True";
    
    return NextResponse.json({ 
      success: isSuccess, 
      message: isSuccess ? 'Email sent successfully' : 'Email sending failed',
      response: responseText,
      idPhien,
      maThamDu
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
