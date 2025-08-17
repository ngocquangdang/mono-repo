import { NextRequest, NextResponse } from 'next/server';
import { getApiConfig } from '../../config';
import { SessionManager } from '../../utils/sessionManager';

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
    
    // Add random delay to avoid detection
    await SessionManager.randomDelay(500, 1500);
    
    // Construct the email URL with query parameters
    const emailUrl = `${config.POP_MART.EMAIL_URL}&idPhien=${idPhien}&MaThamDu=${maThamDu}`;
    
    console.log('Sending email for:', { idPhien, maThamDu });
    console.log('Email URL:', emailUrl);
    
    const response = await fetch(emailUrl, {
      method: 'GET',
      headers: SessionManager.getSessionHeaders(),
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
