import { NextRequest, NextResponse } from 'next/server';
import { getApiConfig } from '../../config';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { idPhien, maThamDu } = await request.json();
    
    if (!idPhien || !maThamDu) {
      return NextResponse.json({ 
        success: false, 
        error: 'idPhien and maThamDu are required' 
      }, { status: 400 });
    }

    const config = getApiConfig();
    
    // Prepare the request data in the format expected by POP MART
    const requestData = {
      GiaTri: maThamDu,
      NoiDungHienBenDuoi: maThamDu
    };

    console.log('Generating QR for:', { idPhien, maThamDu });
    
    const response = await fetch(config.POP_MART.QR_GENERATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        'Referer': 'https://popmartstt.com/popmart',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
      },
      body: JSON.stringify(requestData),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('QR generation response:', data);

    // The response should contain the QR image URL in data.d
    if (data.d && data.d !== "") {
      return NextResponse.json({ 
        success: true, 
        qrImageUrl: data.d,
        idPhien,
        maThamDu
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'QR generation failed - no image URL returned',
        response: data
      });
    }
  } catch (error) {
    console.error('Error generating QR:', error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
