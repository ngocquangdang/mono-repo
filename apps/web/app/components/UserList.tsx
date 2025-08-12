"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { UserRegistration } from '../types';
import { storageUtils, apiUtils, generateId, SalesDate, Session } from '../utils';
import { getApiConfig } from '../config';

interface UserListProps {
  users: UserRegistration[];
  onUserUpdated: () => void;
  onStatusUpdate: (message: string) => void;
}

export const UserList = ({ users, onUserUpdated, onStatusUpdate }: UserListProps) => {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserRegistration | null>(null);
  const [captchaData, setCaptchaData] = useState<{ [key: string]: { imageUrl: string; sessionId: string; captchaInput: string } }>({});
  const [salesDates, setSalesDates] = useState<SalesDate[]>([]);
  const [isLoadingSalesDates, setIsLoadingSalesDates] = useState(true);
  const [sessionsMap, setSessionsMap] = useState<{ [salesDateId: string]: Session[] }>({});
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingCaptchaForAll, setIsLoadingCaptchaForAll] = useState(false);
  const [autoRunning, setAutoRunning] = useState<{ [key: string]: boolean }>({});
  const hasFetchedCaptchaOnMount = useRef(false);

  const isCapacityFull = (message: string | undefined): boolean => {
    if (!message) return false;
    const m = message.toLowerCase();
    return m.includes('hết số lượng') || 
           m.includes('this session is full') || 
           m.includes('session is full') ||
           m.includes('đầy chỗ') ||
           m.includes('full') ||
           m.includes('link đăng ký đang tạm đóng') ||
           m.includes('đăng ký đang tạm đóng');
  };

  const handleAutoRegister = async (user: UserRegistration) => {
    const captcha = captchaData[user.id]?.captchaInput || '';
    if (!captcha) {
      onStatusUpdate('Vui lòng nhập captcha trước khi chạy Auto đăng ký');
      return;
    }

    console.log('Starting auto-register for user:', user.id, 'with captcha:', captcha);
    setAutoRunning(prev => ({ ...prev, [user.id]: true }));

    try {
      // Determine start date index
      const startIndex = Math.max(0, salesDates.findIndex(d => d.value === user.salesDate));
      const orderedDates = salesDates.slice(startIndex);
      
      console.log('Will try dates starting from index:', startIndex, 'dates:', orderedDates.map(d => d.displayText));

      for (const date of orderedDates) {
        const sessions = sessionsMap[date.value] || [];
        console.log(`Trying date: ${date.displayText}, sessions available:`, sessions.length);
        
        if (sessions.length === 0) {
          onStatusUpdate(`Không có phiên cho ngày ${date.displayText}, thử ngày tiếp theo...`);
          continue;
        }

        for (const session of sessions) {
          onStatusUpdate(`Thử đăng ký: ${date.displayText} - ${session.displayText}...`);
          console.log(`Attempting registration for session: ${session.displayText} (${session.value})`);

          const attemptUser: UserRegistration = {
            ...user,
            salesDate: date.value,
            session: session.value,
            captcha
          };

          const res = await apiUtils.registerUser(attemptUser);
          console.log('Registration response:', res);

          const prefix = res.success ? '✅' : '❌';
          const combinedMessage = `${prefix} ${res.message}`;

          // Persist the latest attempt result
          storageUtils.updateUser(user.id, {
            registrationResult: combinedMessage,
            registrationStatus: res.success ? 'success' : 'failed',
            registrationDate: res.success ? new Date().toISOString() : undefined,
            isRegistered: !!res.success,
            salesDate: date.value,
            session: session.value
          });
          onUserUpdated();

          if (res.success) {
            onStatusUpdate(`Đăng ký thành công: ${date.displayText} - ${session.displayText}`);
            console.log('Registration successful, stopping auto-register');
            return;
          }

          // Check if capacity is full
          const isFull = isCapacityFull(res.message);
          console.log('Capacity full check:', isFull, 'for message:', res.message);

          // Continue only if capacity is full; otherwise stop (e.g., captcha sai)
          if (!isFull) {
            onStatusUpdate(`Đăng ký thất bại (không phải do đầy chỗ): ${res.message}`);
            console.log('Stopping auto-register due to non-capacity error');
            return;
          }
          // else: continue to next session
          console.log('Session is full, trying next session...');
        }
        // All sessions for this date are full -> proceed to next date
        console.log('All sessions for this date are full, trying next date...');
      }

      onStatusUpdate('Tất cả phiên trong các ngày đã chọn đều đầy chỗ. Không thể đăng ký.');
      console.log('All dates and sessions tried, registration failed');
    } catch (error) {
      console.error('Auto-register error:', error);
      onStatusUpdate(`Lỗi Auto đăng ký: ${(error as Error).message}`);
    } finally {
      setAutoRunning(prev => ({ ...prev, [user.id]: false }));
    }
  };

  useEffect(() => {
    // Fetch sales dates and sessions on component mount
    const fetchSalesDatesAndSessions = async () => {
      try {
        setIsLoadingSalesDates(true);
        const result = await apiUtils.getSalesDates();
        if (result.success && result.salesDates.length > 0) {
          setSalesDates(result.salesDates);
          
          // Automatically fetch sessions for all sales dates
          setIsLoadingSessions(true);
          const sessionsData: { [salesDateId: string]: Session[] } = {};
          
          for (const salesDate of result.salesDates) {
            try {
              const sessionsResult = await apiUtils.getSessions(salesDate.value);
              if (sessionsResult.success && sessionsResult.sessions.length > 0) {
                sessionsData[salesDate.value] = sessionsResult.sessions;
              } else {
                sessionsData[salesDate.value] = [];
              }
            } catch (error) {
              console.error(`Error fetching sessions for sales date ${salesDate.value}:`, error);
              sessionsData[salesDate.value] = [];
            }
          }
          
          setSessionsMap(sessionsData);
        }
      } catch (error) {
        console.error('Error fetching sales dates:', error);
      } finally {
        setIsLoadingSalesDates(false);
        setIsLoadingSessions(false);
      }
    };

    fetchSalesDatesAndSessions();
  }, []);

  // Auto-fetch captcha for all users on first render
  useEffect(() => {
    // Only run once when users are first available
    if (hasFetchedCaptchaOnMount.current) return;
    if (!users || users.length === 0) return;
    hasFetchedCaptchaOnMount.current = true;

    const fetchCaptchaForAllUsers = async () => {
      setIsLoadingCaptchaForAll(true);
      onStatusUpdate('Đang tải captcha cho tất cả người dùng...');
      
      const captchaPromises = users.map(async (user) => {
        try {
          const captchaResponse = await apiUtils.getCaptcha();
          if (captchaResponse.success) {
            return {
              userId: user.id,
              captchaData: {
                imageUrl: captchaResponse.imageUrl || '',
                sessionId: captchaResponse.sessionId || '',
                captchaInput: ''
              }
            };
          }
        } catch (error) {
          console.error(`Error fetching captcha for user ${user.id}:`, error);
        }
        return null;
      });

      try {
        const results = await Promise.all(captchaPromises);
        const newCaptchaData: { [key: string]: { imageUrl: string; sessionId: string; captchaInput: string } } = {};
        
        results.forEach((result) => {
          if (result) {
            newCaptchaData[result.userId] = result.captchaData;
          }
        });

        setCaptchaData(newCaptchaData);
        onStatusUpdate(`Đã tải captcha cho ${Object.keys(newCaptchaData).length} người dùng`);
      } catch (error) {
        console.error('Error fetching captcha for all users:', error);
        onStatusUpdate('Lỗi khi tải captcha cho tất cả người dùng');
      } finally {
        setIsLoadingCaptchaForAll(false);
      }
    };

    fetchCaptchaForAllUsers();
  }, [users]); // Run when users array changes

  const handleRegister = async (user: UserRegistration, e: React.MouseEvent) => {
    e.preventDefault();
    onStatusUpdate('Đang lấy captcha...');

    try {
      const captchaResponse = await apiUtils.getCaptcha();
      if (captchaResponse.success) {
        setCaptchaData(prev => ({
          ...prev,
          [user.id]: {
            imageUrl: captchaResponse.imageUrl || '',
            sessionId: captchaResponse.sessionId || '',
            captchaInput: ''
          }
        }));
        onStatusUpdate('Đã lấy captcha thành công. Vui lòng nhập mã captcha và nhấn "Đăng ký"');
      } else {
        onStatusUpdate('Lỗi khi lấy captcha');
      }
    } catch (error) {
      onStatusUpdate('Lỗi khi lấy captcha: ' + (error as Error).message);
    }
  };

  const handleCaptchaInputChange = (userId: string, value: string) => {
    setCaptchaData(prev => ({
      ...prev,
      [userId]: {
        imageUrl: prev[userId]?.imageUrl || '',
        sessionId: prev[userId]?.sessionId || '',
        captchaInput: value
      }
    }));
  };

  const handleCaptchaSubmit = async (user: UserRegistration) => {
    if (!captchaData[user.id]?.captchaInput) {
      onStatusUpdate('Vui lòng nhập mã captcha');
      return;
    }

    onStatusUpdate('Đang đăng ký...');

    try {
      const userWithCaptcha = {
        ...user,
        captcha: captchaData[user.id]?.captchaInput || ''
      };

      const registrationResponse = await apiUtils.registerUser(userWithCaptcha);
      
      // Update user with registration result
      const resultMessage = registrationResponse.success 
        ? `✅ ${registrationResponse.message}`
        : `❌ ${registrationResponse.message}`;
      
      const updateData: Partial<UserRegistration> = {
        registrationResult: resultMessage,
        isRegistered: registrationResponse.success,
        registrationDate: registrationResponse.success ? new Date().toISOString() : undefined,
        registrationStatus: registrationResponse.success ? 'success' : 'failed',
        errorMessage: registrationResponse.success ? undefined : registrationResponse.message,
        maThamDu: registrationResponse.data?.maThamDu
      };


      // If registration successful, try to generate QR
      if (registrationResponse.data?.maThamDu) {
        onStatusUpdate('Đăng ký thành công! Đang tạo QR code...');
        
        try {
          // Get session ID from the user's session value
          const config = getApiConfig();
          const idPhien = config.POP_MART.PARAMS.SESSION_MAPPING[user.session as keyof typeof config.POP_MART.PARAMS.SESSION_MAPPING] || '61';
          
          const qrResponse = await apiUtils.generateQR(idPhien, registrationResponse.data.maThamDu);
          
          if (qrResponse.success && qrResponse.qrImageUrl) {
            updateData.maThamDu = registrationResponse.data.maThamDu;
            updateData.qrImageUrl = qrResponse.qrImageUrl;
            updateData.idPhien = idPhien;
            onStatusUpdate('Đăng ký thành công! QR code đã được tạo.');
            
            // Automatically send email after successful QR generation
            try {
              onStatusUpdate('Đăng ký thành công! QR code đã được tạo. Đang gửi email...');
              const emailResponse = await apiUtils.sendEmail(idPhien, registrationResponse.data.maThamDu);
              
              if (emailResponse.success) {
                updateData.emailSent = true;
                updateData.emailSentDate = new Date().toISOString();
                onStatusUpdate('Đăng ký thành công! QR code và email đã được gửi.');
              } else {
                onStatusUpdate('Đăng ký thành công! QR code đã được tạo. Không thể gửi email.');
              }
            } catch (emailError) {
              console.error('Email sending error:', emailError);
              onStatusUpdate('Đăng ký thành công! QR code đã được tạo. Lỗi khi gửi email.');
            }
          } else {
            onStatusUpdate('Đăng ký thành công! Không thể tạo QR code.');
          }
        } catch (qrError) {
          console.error('QR generation error:', qrError);
          onStatusUpdate('Đăng ký thành công! Lỗi khi tạo QR code.');
        }
      }

      storageUtils.updateUser(user.id, updateData);

      // Clear captcha data
      // setCaptchaData(prev => {
      //   const newData = { ...prev };
      //   delete newData[user.id];
      //   return newData;
      // });

      onStatusUpdate(resultMessage);
      onUserUpdated();
    } catch (error) {
      onStatusUpdate('Lỗi khi đăng ký: ' + (error as Error).message);
    }
  };

  const handleDetails = (user: UserRegistration, e: React.MouseEvent) => {
    e.preventDefault();
    if (expandedUser === user.id) {
      setExpandedUser(null);
      setEditingUser(null);
    } else {
      setExpandedUser(user.id);
      setEditingUser({ ...user });
    }
  };

  const handleEditChange = (field: string, value: string) => {
    if (editingUser) {
      setEditingUser({
        ...editingUser,
        [field]: value,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleEditSave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (editingUser) {
      storageUtils.updateUser(editingUser.id, editingUser);
      setExpandedUser(null);
      setEditingUser(null);
      onUserUpdated();
      onStatusUpdate('Đã cập nhật thông tin người dùng');
    }
  };

  const handleDelete = (userId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      storageUtils.deleteUser(userId);
      setCaptchaData(prev => {
        const newData = { ...prev };
        delete newData[userId];
        return newData;
      });
      onUserUpdated();
      onStatusUpdate('Đã xóa người dùng');
    }
  };

  const handleCopyCurl = (user: UserRegistration, e: React.MouseEvent) => {
    e.preventDefault();
    const curlCommand = getCurlCommand(user);
    navigator.clipboard.writeText(curlCommand).then(() => {
      onStatusUpdate('Đã copy cURL command vào clipboard');
    }).catch(() => {
      onStatusUpdate('Lỗi khi copy cURL command');
    });
  };

  const handleRefreshAllCaptcha = async () => {
    setIsLoadingCaptchaForAll(true);
    onStatusUpdate('Đang tải lại captcha cho tất cả người dùng...');
    
    const captchaPromises = users.map(async (user) => {
      try {
        const captchaResponse = await apiUtils.getCaptcha();
        if (captchaResponse.success) {
          return {
            userId: user.id,
            captchaData: {
              imageUrl: captchaResponse.imageUrl || '',
              sessionId: captchaResponse.sessionId || '',
              captchaInput: ''
            }
          };
        }
      } catch (error) {
        console.error(`Error fetching captcha for user ${user.id}:`, error);
      }
      return null;
    });

    try {
      const results = await Promise.all(captchaPromises);
      const newCaptchaData: { [key: string]: { imageUrl: string; sessionId: string; captchaInput: string } } = {};
      
      results.forEach((result) => {
        if (result) {
          newCaptchaData[result.userId] = result.captchaData;
        }
      });

      setCaptchaData(newCaptchaData);
      onStatusUpdate(`Đã tải lại captcha cho ${Object.keys(newCaptchaData).length} người dùng`);
    } catch (error) {
      console.error('Error refreshing captcha for all users:', error);
      onStatusUpdate('Lỗi khi tải lại captcha cho tất cả người dùng');
    } finally {
      setIsLoadingCaptchaForAll(false);
    }
  };

  const getCurlCommand = (user: UserRegistration) => {
    const config = getApiConfig();
    
    // Map session to idPhien
    const idPhien = config.POP_MART.PARAMS.SESSION_MAPPING[user.session as keyof typeof config.POP_MART.PARAMS.SESSION_MAPPING] || '61';
    
    const params = new URLSearchParams({
      Action: 'DangKyThamDu',
      idNgayBanHang: user.salesDate, // Use the user's selected sales date
      idPhien: idPhien,
      HoTen: user.fullName,
      NgaySinh_Ngay: user.dateOfBirth.day,
      NgaySinh_Thang: user.dateOfBirth.month,
      NgaySinh_Nam: user.dateOfBirth.year,
      SoDienThoai: user.phoneNumber,
      Email: user.email,
      CCCD: user.idCard,
      Captcha: user.captcha || 'CAPTCHA_HERE' // Placeholder if no captcha
    });

    return `curl --location 'https://popmartstt.com/Ajax.aspx?${params.toString()}' \\
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
  --header 'user-agent: Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36' \\
  --header 'Cookie: ${config.POP_MART.SESSION_COOKIE}'`;
  };

  return (
    <div className="form-container p-6">
      <h2 className="text-xl font-bold mb-4">Danh sách người dùng</h2>
      
      {isLoadingCaptchaForAll && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-700 text-sm">Đang tải captcha cho tất cả người dùng...</span>
          </div>
        </div>
      )}
      
      {users && users.length > 0 && (
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Tổng cộng: {users.length} người dùng
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleRefreshAllCaptcha}
            disabled={isLoadingCaptchaForAll}
            className="flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Tải lại tất cả Captcha</span>
          </Button>
        </div>
      )}
      
      {!users || users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có người dùng nào được lưu</p>
          <p className="text-sm mt-2">Hãy thêm người dùng mới từ form bên trái</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-semibold">{user.fullName}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">{user.phoneNumber}</p>
                  <p className="text-sm text-gray-600">CCCD: {user.idCard}</p>
                  <p className="text-sm text-gray-600">Session: {user.session}</p>
                  {user.registrationDate && (
                    <p className="text-xs text-gray-500">
                      Đăng ký: {new Date(user.registrationDate).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {/* Captcha Section */}
                  {captchaData[user.id]?.imageUrl && (
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <img 
                          src={captchaData[user.id]?.imageUrl} 
                          alt="Captcha" 
                          className="w-20 h-12 border rounded"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={async () => {
                            try {
                              onStatusUpdate('Đang tải lại captcha...');
                              const result = await apiUtils.getCaptcha();
                              if (result.success && result.imageUrl) {
                                setCaptchaData(prev => ({
                                  ...prev,
                                  [user.id]: {
                                    imageUrl: result.imageUrl!,
                                    sessionId: result.sessionId!,
                                    captchaInput: ''
                                  }
                                }));
                                onStatusUpdate('Đã tải lại captcha');
                              } else {
                                onStatusUpdate('Lỗi khi tải lại captcha: ' + (result.error || 'Unknown error'));
                              }
                            } catch (error) {
                              onStatusUpdate('Lỗi khi tải lại captcha: ' + (error as Error).message);
                            }
                          }}
                          className="absolute -top-1 -right-1 w-6 h-6 p-0 text-xs"
                        >
                          ↻
                        </Button>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Input
                          type="text"
                          placeholder="Nhập captcha"
                          value={captchaData[user.id]?.captchaInput || ''}
                          onChange={(e) => handleCaptchaInputChange(user.id, e.target.value)}
                          className="w-24 h-8 text-xs"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={async () => {
                            try {
                              onStatusUpdate('Đang giải captcha bằng AI...');
                              const result = await apiUtils.solveCaptcha(captchaData[user.id]?.imageUrl || '');
                              if (result.success && result.captchaText) {
                                setCaptchaData(prev => ({
                                  ...prev,
                                  [user.id]: {
                                    ...prev[user.id]!,
                                    captchaInput: result.captchaText!
                                  }
                                }));
                                onStatusUpdate('AI đã giải captcha: ' + result.captchaText);
                              } else {
                                onStatusUpdate('Không thể giải captcha: ' + (result.error || 'Unknown error'));
                              }
                            } catch (error) {
                              onStatusUpdate('Lỗi khi giải captcha: ' + (error as Error).message);
                            }
                          }}
                          className="w-24 h-6 text-xs"
                          disabled={!captchaData[user.id]?.imageUrl}
                        >
                          🤖 AI Giải
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      if (captchaData[user.id]?.imageUrl && captchaData[user.id]?.captchaInput) {
                        handleCaptchaSubmit(user);
                      } else {
                        handleRegister(user, e);
                      }
                    }}
                  >
                    Đăng ký
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(e) => handleDetails(user, e)}
                  >
                    Chi tiết
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={(e) => handleDelete(user.id, e)}
                  >
                    Xóa
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(e) => handleCopyCurl(user, e)}
                    className="flex items-center space-x-1 relative group"
                    title={getCurlCommand(user)}
                  >
                    <span>📋</span>
                    <span>Copy cURL</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAutoRegister(user)}
                    disabled={!!autoRunning[user.id]}
                    className="ml-1"
                  >
                    {autoRunning[user.id] ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Đang auto...
                      </>
                    ) : (
                      'Auto đăng ký'
                    )}
                  </Button>
                </div>
              </div>

              {user.registrationResult && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                  <div className="font-semibold">Kết quả đăng ký:</div>
                  <div className="whitespace-pre-wrap">{user.registrationResult}</div>
                  
                  {/* Display QR code if available */}
                  {user.qrImageUrl && (
                    <div className="mt-2">
                      <div className="font-semibold text-green-600">QR Code:</div>
                      <div className="flex items-center space-x-2">
                        <img 
                          src={user.qrImageUrl} 
                          alt="QR Code" 
                          className="w-24 h-24 border rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden text-red-500 text-xs">QR image failed to load</div>
                        <div className="text-xs">
                          <div><strong>Mã tham dự:</strong> {user.maThamDu}</div>
                          <div><strong>Phiên:</strong> {user.idPhien}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Manual QR generation button for successful registrations without QR */}
                  {user.isRegistered && !user.qrImageUrl && user.maThamDu && (
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={async () => {
                          try {
                            onStatusUpdate('Đang tạo QR code...');
                            const config = getApiConfig();
                            const idPhien = config.POP_MART.PARAMS.SESSION_MAPPING[user.session as keyof typeof config.POP_MART.PARAMS.SESSION_MAPPING] || '61';
                            
                            const qrResponse = await apiUtils.generateQR(idPhien, user.maThamDu!);
                            
                            if (qrResponse.success && qrResponse.qrImageUrl) {
                              storageUtils.updateUser(user.id, {
                                qrImageUrl: qrResponse.qrImageUrl,
                                idPhien: idPhien
                              });
                              onStatusUpdate('QR code đã được tạo thành công!');
                              onUserUpdated();
                            } else {
                              onStatusUpdate('Không thể tạo QR code: ' + (qrResponse.error || 'Unknown error'));
                            }
                          } catch (error) {
                            onStatusUpdate('Lỗi khi tạo QR code: ' + (error as Error).message);
                          }
                        }}
                        className="text-xs"
                      >
                        Tạo QR Code
                      </Button>
                    </div>
                  )}
                  
                  {/* Email sending button for successful registrations */}
                  { user.maThamDu && (
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={async () => {
                          try {
                            onStatusUpdate('Đang gửi email...');
                            const config = getApiConfig();
                            const idPhien = config.POP_MART.PARAMS.SESSION_MAPPING[user.session as keyof typeof config.POP_MART.PARAMS.SESSION_MAPPING] || '61';
                            
                            const emailResponse = await apiUtils.sendEmail(idPhien, user.maThamDu!);
                            
                            if (emailResponse.success) {
                              storageUtils.updateUser(user.id, {
                                emailSent: true,
                                emailSentDate: new Date().toISOString()
                              });
                              onStatusUpdate('Email đã được gửi thành công!');
                              onUserUpdated();
                            } else {
                              onStatusUpdate('Không thể gửi email: ' + (emailResponse.error || 'Unknown error'));
                            }
                          } catch (error) {
                            onStatusUpdate('Lỗi khi gửi email: ' + (error as Error).message);
                          }
                        }}
                        className="text-xs ml-2"
                      >
                        Gửi Email
                      </Button>
                    </div>
                  )}
                  
                  {/* Email status display */}
                  {user.emailSent && (
                    <div className="mt-2 text-xs text-green-600">
                      ✅ Email đã được gửi {user.emailSentDate && `(${new Date(user.emailSentDate).toLocaleString('vi-VN')})`}
                    </div>
                  )}
                </div>
              )}

              {expandedUser === user.id && editingUser && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Chỉnh sửa thông tin</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sales date
                      </label>
                      {isLoadingSalesDates ? (
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                          Loading...
                        </div>
                      ) : (
                        <select
                          value={editingUser.salesDate}
                          onChange={(e) => handleEditChange('salesDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="">-- Chọn ngày bán hàng --</option>
                          {salesDates.map((date) => (
                            <option key={date.value} value={date.value}>
                              {date.displayText}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Session
                      </label>
                      {isLoadingSessions ? (
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                          Loading sessions...
                        </div>
                      ) : (
                        <select
                          value={editingUser.session}
                          onChange={(e) => handleEditChange('session', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="">-- Chọn phiên --</option>
                          {sessionsMap[editingUser.salesDate]?.map((session) => (
                            <option key={session.value} value={session.value}>
                              {session.displayText}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    <Input
                      label="Full name"
                      value={editingUser.fullName}
                      onChange={(e) => handleEditChange('fullName', e.target.value)}
                    />
                    
                    <Input
                      label="Phone"
                      value={editingUser.phoneNumber}
                      onChange={(e) => handleEditChange('phoneNumber', e.target.value)}
                    />
                    
                    <Input
                      label="Email"
                      value={editingUser.email}
                      onChange={(e) => handleEditChange('email', e.target.value)}
                    />
                    
                    <Input
                      label="CCCD"
                      value={editingUser.idCard}
                      onChange={(e) => handleEditChange('idCard', e.target.value)}
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of birth
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        label="Day"
                        value={editingUser.dateOfBirth.day}
                        onChange={(e) => {
                          if (editingUser) {
                            setEditingUser({
                              ...editingUser,
                              dateOfBirth: {
                                ...editingUser.dateOfBirth,
                                day: e.target.value
                              },
                              updatedAt: new Date().toISOString()
                            });
                          }
                        }}
                      />
                      <Input
                        label="Month"
                        value={editingUser.dateOfBirth.month}
                        onChange={(e) => {
                          if (editingUser) {
                            setEditingUser({
                              ...editingUser,
                              dateOfBirth: {
                                ...editingUser.dateOfBirth,
                                month: e.target.value
                              },
                              updatedAt: new Date().toISOString()
                            });
                          }
                        }}
                      />
                      <Input
                        label="Year"
                        value={editingUser.dateOfBirth.year}
                        onChange={(e) => {
                          if (editingUser) {
                            setEditingUser({
                              ...editingUser,
                              dateOfBirth: {
                                ...editingUser.dateOfBirth,
                                year: e.target.value
                              },
                              updatedAt: new Date().toISOString()
                            });
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <Button 
                      type="button"
                      onClick={(e) => handleEditSave(e)} 
                      variant="success"
                    >
                      Lưu thay đổi
                    </Button>
                    <Button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingUser(null);
                        setExpandedUser(null);
                      }}
                      variant="secondary"
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
