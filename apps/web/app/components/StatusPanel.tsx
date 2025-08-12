"use client";

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';

interface StatusPanelProps {
  statusMessage: string;
}

export const StatusPanel = ({ statusMessage }: StatusPanelProps) => {
  const [statusHistory, setStatusHistory] = useState<string[]>([]);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  useEffect(() => {
    if (statusMessage) {
      const timestamp = new Date().toLocaleTimeString();
      const newStatus = `[${timestamp}] ${statusMessage}`;
      setStatusHistory(prev => [...prev, newStatus]);
    }
  }, [statusMessage]);

  useEffect(() => {
    if (isAutoScroll) {
      const statusContainer = document.getElementById('status-container');
      if (statusContainer) {
        statusContainer.scrollTop = statusContainer.scrollHeight;
      }
    }
  }, [statusHistory, isAutoScroll]);

  const handleClearHistory = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setStatusHistory([]);
  };

  const handleExportLog = (e?: React.MouseEvent) => {
    e?.preventDefault();
    const logContent = statusHistory.join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `popmart-log-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="form-container p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Trạng thái & Log</h2>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              setIsAutoScroll(!isAutoScroll);
            }}
          >
            {isAutoScroll ? 'Tắt' : 'Bật'} Auto-scroll
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={(e) => handleClearHistory(e)}
          >
            Xóa log
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={(e) => handleExportLog(e)}
          >
            Xuất log
          </Button>
        </div>
      </div>

      <div
        id="status-container"
        className="status-log bg-gray-100 p-4 rounded-lg h-96 overflow-y-auto"
      >
        {statusHistory.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            Chưa có hoạt động nào
          </div>
        ) : (
          <div className="space-y-1">
            {statusHistory.map((status, index) => (
              <div key={index} className="text-gray-800">
                {status}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Hướng dẫn sử dụng:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Cột 1: Điền form và lưu thông tin người dùng</li>
          <li>• Cột 2: Xem danh sách, đăng ký tự động, chỉnh sửa thông tin</li>
          <li>• Cột 3: Theo dõi trạng thái và log hoạt động</li>
          <li>• Tất cả dữ liệu được lưu trong localStorage</li>
          <li>• API calls được mô phỏng với delay thực tế</li>
        </ul>
      </div>
    </div>
  );
};
