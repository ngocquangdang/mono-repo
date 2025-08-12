"use client";

import { useState, useEffect } from 'react';
import { RegistrationForm } from './components/RegistrationForm';
import { UserList } from './components/UserList';
import { StatusPanel } from './components/StatusPanel';
import { UserRegistration } from './types';
import { storageUtils } from './utils';

export default function Home() {
  const [statusMessage, setStatusMessage] = useState('');
  const [users, setUsers] = useState<UserRegistration[]>([]);

  useEffect(() => {
    // Load users on component mount
    const savedUsers = storageUtils.getUsers();
    setUsers(savedUsers);
  }, []);

  const handleUserSaved = () => {
    setStatusMessage('Đã lưu thông tin người dùng mới');
    // Reload users after saving
    const savedUsers = storageUtils.getUsers();
    setUsers(savedUsers);
  };

  const handleUserUpdated = () => {
    // Reload users after updating
    const savedUsers = storageUtils.getUsers();
    setUsers(savedUsers);
  };

  const handleStatusUpdate = (message: string) => {
    setStatusMessage(message);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            POP MART Registration System
          </h1>
          <p className="text-center text-gray-600">
            Hệ thống đăng ký tự động với 3 cột chức năng
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột 1: Form đăng ký */}
          <div className="lg:col-span-1">
            <RegistrationForm onUserSaved={handleUserSaved} />
          </div>

          {/* Cột 2: Danh sách người dùng */}
          <div className="lg:col-span-1">
            <UserList 
              onUserUpdated={handleUserUpdated}
              onStatusUpdate={handleStatusUpdate}
              users={users}
            />
          </div>

          {/* Cột 3: Panel trạng thái */}
          <div className="lg:col-span-1">
            <StatusPanel statusMessage={statusMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}
