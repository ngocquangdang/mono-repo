import { NextRequest, NextResponse } from 'next/server';
import { getApiConfig } from '../../config';
import { Session } from '../../utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salesDateId = searchParams.get('salesDateId');
    
    if (!salesDateId) {
      return NextResponse.json({ 
        success: false, 
        error: 'salesDateId parameter is required',
        sessions: [] 
      }, { status: 400 });
    }

    const config = getApiConfig();
    
    // Construct the URL with the sales date ID
    const sessionsUrl = `${config.POP_MART.SESSIONS_URL}&idNgayBanHang=${salesDateId}`;
    
    console.log('Fetching sessions from:', sessionsUrl);
    
    const response = await fetch(sessionsUrl, {
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
    console.log('Sessions HTML Response length:', htmlResponse.length);
    console.log('Sessions HTML Response preview:', htmlResponse.substring(0, 1000));
    
    const sessions: Session[] = [];
    
    // Parse the HTML response to extract session options
    // The response contains <option> elements with session data
    const optionRegex = /<option[^>]*value=['"]([^'"]*)['"][^>]*>([^<]*)<\/option>/gi;
    let optionMatch;
    
    while ((optionMatch = optionRegex.exec(htmlResponse)) !== null) {
      const value = optionMatch[1];
      const displayText = optionMatch[2]?.trim();
      
      console.log('Found session option:', { value, displayText });
      
      // Skip empty values and the "Chọn" option
      if (value && displayText && displayText !== '-- Chọn --' && value !== '') {
        // Extract time slot from display text (e.g., "10:00 - 12:00" from "session 1 (10:00 - 12:00)")
        const timeSlotMatch = displayText.match(/\(([^)]+)\)/);
        const timeSlot = timeSlotMatch ? timeSlotMatch[1] : displayText;
        
        sessions.push({
          value,
          displayText,
          timeSlot: timeSlot || displayText
        });
      }
    }

    // Fallback to hardcoded sessions if parsing fails
    if (sessions.length === 0) {
      console.log('No sessions found in HTML, using fallback data');
      sessions.push(
        { value: '60', displayText: 'Session 1 (09:00 - 11:00)', timeSlot: '09:00 - 11:00' },
        { value: '61', displayText: 'Session 2 (13:30 - 15:30)', timeSlot: '13:30 - 15:30' }
      );
    }

    return NextResponse.json({ 
      success: true, 
      sessions, 
      total: sessions.length,
      salesDateId 
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message, 
      sessions: [] 
    }, { status: 500 });
  }
}
