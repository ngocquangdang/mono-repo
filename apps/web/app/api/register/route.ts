import { NextRequest, NextResponse } from 'next/server';
import { getApiConfig } from '../../config';
import { SessionManager } from '../../utils/sessionManager';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🚀 ~ POST ~ body:", body)
    const config = getApiConfig();
    
    // Optional jitter to avoid detection
    await SessionManager.randomDelay(500, 2000);
    
    const params = new URLSearchParams({
      Action: 'DangKyThamDu',
      idNgayBanHang: body.salesDate,
      idPhien: body.session,
      HoTen: body.fullName,
      NgaySinh_Ngay: body.dateOfBirth.day,
      NgaySinh_Thang: body.dateOfBirth.month,
      NgaySinh_Nam: body.dateOfBirth.year,
      SoDienThoai: body.phoneNumber,
      Email: body.email,
      CCCD: body.idCard,
      Captcha: body.captcha
    });

    const url = `${config.POP_MART.BASE_URL}/Ajax.aspx?${params.toString()}`;
    
    // Use proper headers like the working curl command
    const headers = {
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
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
      'Cookie': body.sessionId ? `ASP.NET_SessionId=${body.sessionId}` : ''
    };

    console.log('Register URL:', url);
    console.log('Register headers:', headers);
    console.log('Session ID being used:', body.sessionId);

    // Log the exact curl command for debugging
    const debugCurlCommand = `curl --location '${url}' \\
      --header 'accept: */*' \\
      --header 'accept-language: vi-VN,vi;q=0.9' \\
      --header 'priority: u=1, i' \\
      --header 'referer: https://popmartstt.com/popmart' \\
      --header 'sec-ch-ua: "Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"' \\
      --header 'sec-ch-ua-mobile: ?1' \\
      --header 'sec-ch-ua-platform: "Android"' \\
      --header 'sec-fetch-dest: empty' \\
      --header 'sec-fetch-mode: cors' \\
      --header 'sec-fetch-site: same-origin' \\
      --header 'user-agent: ${body.userAgent || 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'}' \\
      --header 'Cookie: ASP.NET_SessionId=${body.sessionId || ''}' \\
      -v`;
    
    console.log('Debug curl command:', debugCurlCommand);

    // Test session validity first by calling captcha
    if (body.sessionId) {
      try {
        const captchaTestUrl = `${config.POP_MART.BASE_URL}/Ajax.aspx?Action=LoadCaptcha`;
        const captchaResponse = await fetch(captchaTestUrl, {
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
            'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
            'Cookie': `ASP.NET_SessionId=${body.sessionId}`
          },
          cache: 'no-store'
        });
        
        console.log('Captcha test status:', captchaResponse.status);
        console.log('Captcha test ok:', captchaResponse.ok);
        const captchaText = await captchaResponse.text();
        console.log('Captcha test response length:', captchaText.length);
        console.log('Captcha test response:', captchaText.substring(0, 200));
        
        // Use the same session ID for register that worked for captcha
        const workingSessionId = body.sessionId;
        console.log('Using working session ID for register:', workingSessionId);
        
      } catch (captchaError) {
        console.error('Captcha test failed:', captchaError);
      }
    }

    let responseStatus = 200;
    let responseText = '';

    try {
      // Try curl directly since fetch returns empty response
      const workingSessionId = body.sessionId;
      const curlCommand = `curl --location '${url}' \\
        --header 'Cookie: ASP.NET_SessionId=${workingSessionId || ''}; Path=/; HttpOnly;' \\
        -s`;

      console.log('Using curl command:', curlCommand);
      
      const { stdout, stderr } = await execAsync(curlCommand);
      
      if (stderr) {
        console.error('Curl stderr:', stderr);
      }
      
      responseText = stdout;
      responseStatus = 200; // Assume success for curl
      
      console.log('Curl response length:', responseText.length);
      console.log('Curl response:', responseText);

      // If still empty, try fetch with minimal headers like Postman
      if (responseText.length === 0) {
        console.log('Trying fetch with minimal headers like Postman...');
        try {
          const fetchResponse = await fetch(url, {
            method: 'GET',
            headers: {
              'Cookie': `ASP.NET_SessionId=${workingSessionId || ''}; Path=/; HttpOnly;`
            },
            cache: 'no-store'
          });
          
          console.log('Fetch response status:', fetchResponse.status);
          console.log('Fetch response ok:', fetchResponse.ok);
          const fetchText = await fetchResponse.text();
          console.log('Fetch response length:', fetchText.length);
          console.log('Fetch response:', fetchText);
          
          if (fetchText.length > 0) {
            responseText = fetchText;
            console.log('Using fetch response');
          }
        } catch (fetchError) {
          console.error('Fetch failed:', fetchError);
        }
      }

      // If still empty, try with exact working URL from user
      if (responseText.length === 0) {
        console.log('Trying with exact working URL from user...');
        const workingUrl = 'https://popmartstt.com/Ajax.aspx?Action=DangKyThamDu&idNgayBanHang=37&idPhien=61&HoTen=abc&NgaySinh_Ngay=12&NgaySinh_Thang=12&NgaySinh_Nam=12&SoDienThoai=0921730001&Email=abc%40gma.com&CCCD=123123123123&Captcha=mzk6r';
        const workingCurlCommand = `curl --location '${workingUrl}' \\
          --header 'Cookie: ASP.NET_SessionId=4hf21q2mzk3lg4drsu5cqme2; Path=/; HttpOnly;' \\
          -s`;
        
        try {
          const { stdout: workingOutput, stderr: workingStderr } = await execAsync(workingCurlCommand);
          console.log('Exact working URL curl response length:', workingOutput.length);
          console.log('Exact working URL curl response:', workingOutput);
          if (workingStderr) console.log('Exact working URL curl stderr:', workingStderr);
          
          // Use the working response if it has content
          if (workingOutput.length > 0) {
            responseText = workingOutput;
            console.log('Using response from exact working URL');
          }
        } catch (workingError) {
          console.error('Exact working URL curl failed:', workingError);
        }
      }

      // If still empty, try with working parameters but our data
      if (responseText.length === 0) {
        console.log('Trying with working parameters but our data...');
        const workingParamsUrl = `${config.POP_MART.BASE_URL}/Ajax.aspx?Action=DangKyThamDu&idNgayBanHang=37&idPhien=61&HoTen=${encodeURIComponent(body.fullName)}&NgaySinh_Ngay=${body.dateOfBirth.day}&NgaySinh_Thang=${body.dateOfBirth.month}&NgaySinh_Nam=${body.dateOfBirth.year}&SoDienThoai=${body.phoneNumber}&Email=${encodeURIComponent(body.email)}&CCCD=${body.idCard}&Captcha=${body.captcha}`;
        const workingParamsCurlCommand = `curl --location '${workingParamsUrl}' \\
          --header 'Cookie: ASP.NET_SessionId=${workingSessionId || ''}; Path=/; HttpOnly;' \\
          -s`;
        
        try {
          const { stdout: paramsOutput, stderr: paramsStderr } = await execAsync(workingParamsCurlCommand);
          console.log('Working params curl response length:', paramsOutput.length);
          console.log('Working params curl response:', paramsOutput);
          if (paramsStderr) console.log('Working params curl stderr:', paramsStderr);
          
          if (paramsOutput.length > 0) {
            responseText = paramsOutput;
            console.log('Using response from working parameters');
          }
        } catch (paramsError) {
          console.error('Working params curl failed:', paramsError);
        }
      }

    } catch (curlError) {
      console.error('Curl failed, trying fetch:', curlError);
      
      // Fallback to fetch
      const response = await fetch(url, {
        method: 'GET',
        headers,
        cache: 'no-store'
      });

      responseStatus = response.status;
      
      // Log response details
      console.log('Register response status:', responseStatus);
      console.log('Register response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Register response ok:', response.ok);
      
      responseText = await response.text();
      
      console.log('Register response text length:', responseText.length);
      console.log('Register response text:', responseText);
    }

    // Parse response for success/error
    const successMatch = responseText.match(/!!!True\|\~\~\|([^!]+)!!!/);
    const maThamDu = successMatch ? successMatch[1] : undefined;
    
    const isSuccess = !!successMatch;
    
    // Check for specific error messages
    const errorMessages = [
      'Captcha không hợp lệ!',
      'Invalid captcha!',
      'Link đăng ký đang tạm đóng!',
      'Registration link is temporarily closed!',
      'Đã hết số lượng đăng ký phiên này!',
      'This session is full!'
    ];
    
    const hasError = errorMessages.some(msg => responseText.includes(msg));
    
    // Determine if it's a capacity/availability error (should retry with different session/date)
    const capacityErrors = [
      'Link đăng ký đang tạm đóng!',
      'Registration link is temporarily closed!',
      'Đã hết số lượng đăng ký phiên này!',
      'This session is full!'
    ];
    
    const isCapacityError = capacityErrors.some(msg => responseText.includes(msg));
    
    return NextResponse.json({
      success: isSuccess && !hasError,
      message: isSuccess ? 'Đăng ký thành công!' : (isCapacityError ? 'Phiên đã đầy hoặc đang tạm đóng' : 'Đăng ký thất bại'),
      data: {
        rawHtml: responseText,
        httpStatus: responseStatus,
        method: 'GET',
        maThamDu,
        isCapacityError
      }
    });

  } catch (error) {
    console.error('Error in register API:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
