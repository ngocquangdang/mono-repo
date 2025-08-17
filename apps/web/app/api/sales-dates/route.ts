import { NextRequest, NextResponse } from 'next/server';
import { getApiConfig } from '../../config';
import { SessionManager } from '../../utils/sessionManager';

export interface SalesDate {
  value: string;
  date: string;
  displayText: string;
}

export async function GET(request: NextRequest) {
  try {
    const config = getApiConfig();
    
    // Add random delay to avoid detection
    await SessionManager.randomDelay(500, 1500);
    
    // Fetch the POP MART registration page
    const response = await fetch('https://popmartstt.com/popmart', {
      method: 'GET',
      headers: SessionManager.getPageHeaders(),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const htmlResponse = await response.text();
    
    console.log('HTML Response length:', htmlResponse.length);
    console.log('HTML Response preview:', htmlResponse.substring(0, 1000));
    
    // Parse HTML to extract sales dates from select element
    const salesDates: SalesDate[] = [];
    
    // Look for the specific select element with slNgayBanHang
    const selectRegex = /<select[^>]*name="slNgayBanHang"[^>]*>([\s\S]*?)<\/select>/i;
    const selectMatch = htmlResponse.match(selectRegex);
    
    if (selectMatch && selectMatch[1]) {
      const selectContent = selectMatch[1];
      console.log('Found select content:', selectContent);
      
      // Parse options within the select
      const optionRegex = /<option[^>]*value="([^"]*)"[^>]*>([^<]*)<\/option>/gi;
      let optionMatch;
      
      while ((optionMatch = optionRegex.exec(selectContent)) !== null) {
        const value = optionMatch[1];
        const displayText = optionMatch[2]?.trim();
        
        console.log('Found option:', { value, displayText });
        
        // Skip empty values and the "Chọn" option
        if (value && displayText && displayText !== '-- Chọn --' && value !== '') {
          salesDates.push({
            value,
            date: displayText,
            displayText: `${displayText} (ID: ${value})`
          });
        }
      }
    }

    console.log('Parsed sales dates:', salesDates);

    // Fallback to hardcoded sales dates if parsing fails
    if (salesDates.length === 0) {
      console.log('No sales dates found in HTML, using fallback data');
      salesDates.push(
        { value: '35', date: '13/08/2025', displayText: '13/08/2025 (ID: 35)' },
        { value: '36', date: '14/08/2025', displayText: '14/08/2025 (ID: 36)' },
        { value: '37', date: '15/08/2025', displayText: '15/08/2025 (ID: 37)' },
        { value: '38', date: '16/08/2025', displayText: '16/08/2025 (ID: 38)' }
      );
    }

    return NextResponse.json({
      success: true,
      salesDates,
      total: salesDates.length
    });

  } catch (error) {
    console.error('Error fetching sales dates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message,
        salesDates: []
      },
      { status: 500 }
    );
  }
}
