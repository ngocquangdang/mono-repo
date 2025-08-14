import { NextRequest, NextResponse } from 'next/server';
import { getApiConfig } from '../../config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = getApiConfig();
    
    // Map our form data to POP MART API parameters
    const params = new URLSearchParams({
      Action: 'DangKyThamDu',
      idNgayBanHang: body.salesDate, // Use the selected sales date value
      idPhien: config.POP_MART.PARAMS.SESSION_MAPPING[body.session as keyof typeof config.POP_MART.PARAMS.SESSION_MAPPING] || '61',
      HoTen: body.fullName,
      NgaySinh_Ngay: body.dateOfBirth.day,
      NgaySinh_Thang: body.dateOfBirth.month,
      NgaySinh_Nam: body.dateOfBirth.year,
      SoDienThoai: body.phoneNumber,
      Email: body.email,
      CCCD: body.idCard,
      Captcha: body.captcha
    });

    // Use URLSearchParams.toString() to get properly encoded URL
    const url = `https://popmartstt.com/Ajax.aspx?${params.toString()}`;
    
    console.log('Registration URL:', url);
    console.log('Registration data:', body);

    // Try fetch first
    let htmlResponse = '';
    let responseStatus = 200;
    
    try {
      const response = await fetch(url, {
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

      responseStatus = response.status;
      htmlResponse = await response.text();
      console.log('Fetch response status:', responseStatus);
      console.log('Fetch response length:', htmlResponse.length);
    } catch (fetchError) {
      console.log('Fetch failed, trying curl:', fetchError);
      
      // Fallback to curl command
      try {
        const curlCommand = `curl -s '${url}'`;
        
        const { stdout, stderr } = await execAsync(curlCommand);
        htmlResponse = stdout;
        console.log('Curl response length:', htmlResponse.length);
        console.log('Curl stderr:', stderr);
        console.log('Curl command used:', curlCommand);
      } catch (curlError) {
        console.error('Curl also failed:', curlError);
        throw new Error('Both fetch and curl failed');
      }
    }

    console.log('Final HTML response:', htmlResponse);

    let success = false;
    let message = 'Unknown response from POP MART API.';

    // Parse HTML response to extract the message
    const divMatch = htmlResponse.match(/<div[^>]*>(.*?)<\/div>/i);
    let maThamDu = '';

    if (divMatch && divMatch[1]) {
      message = divMatch[1].trim();
      const result = htmlResponse.trim();
      if (result.includes("!!!True|~~|")) {
          //alert("Đăng ký tham dự thành công!");
            const arrResult = result.split("|~~|");
            maThamDu = arrResult[3]?.trim() || '';
          console.log('MaThamDu:', maThamDu);
      } 
      // Determine success based on message content
      if (maThamDu) {
        
        success = true;
      } else if (message.includes('không hợp lệ') || 
                 message.includes('invalid') ||
                 message.includes('thất bại') ||
                 message.includes('failed') ||
                 message.includes('lỗi') ||
                 message.includes('error') || 
                 message.includes('hết số lượng') ||
                 message.includes('đầy chỗ') ||
                 message.includes('full') ||
                 message.includes('đăng ký đang tạm đóng') ||
                 message.includes('link đăng ký đang tạm đóng')) {
        success = false;
      } else {
        success = responseStatus === 200;
      }
    } else {
      success = responseStatus === 200;
      message = responseStatus === 200 ? 'Đăng ký thành công!' : `HTTP Error ${responseStatus}: ${htmlResponse.substring(0, 200)}`;
    }

    if (responseStatus !== 200) {
      success = false;
      message = `HTTP Error ${responseStatus}: ${message}`;
    }

    console.log('Parsed response:', { success, message });

    return NextResponse.json({
      success: success,
      message: message,
      data: {
        rawHtml: htmlResponse,
        httpStatus: responseStatus,
        method: htmlResponse.length > 0 ? 'fetch' : 'curl',
        maThamDu: maThamDu || ''
      }
    });

  } catch (error) {
    console.error('Error in registration:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Đăng ký thất bại: ${(error as Error).message}` 
      },
      { status: 500 }
    );
  }
}
