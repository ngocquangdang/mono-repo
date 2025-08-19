"use client";
import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { UserRegistration } from '../types';
import { storageUtils, apiUtils, generateId, SalesDate, Session } from '../utils';

interface RegistrationFormProps {
  onUserSaved: () => void;
}

export const RegistrationForm = ({ onUserSaved }: RegistrationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [salesDates, setSalesDates] = useState<SalesDate[]>([]);
  const [isLoadingSalesDates, setIsLoadingSalesDates] = useState(true);
  const [sessionsMap, setSessionsMap] = useState<{ [salesDateId: string]: Session[] }>({});
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  
  const [formData, setFormData] = useState({
    salesDate: '',
    session: '',
    fullName: '',
    dateOfBirth: { day: '', month: '', year: '' },
    phoneNumber: '',
    email: '',
    idCard: '',
    captcha: '',
  });

  // Fetch sales dates and then automatically fetch sessions for all dates
  useEffect(() => {
    const fetchSalesDatesAndSessions = async () => {
      try {
        setIsLoadingSalesDates(true);
        const result = await apiUtils.getSalesDates();
        if (result.success && result.salesDates.length > 0) {
          setSalesDates(result.salesDates);
          
          // Set the first sales date as default
          const firstSalesDate = result.salesDates[0]?.value || '';
          setFormData(prev => ({
            ...prev,
            salesDate: firstSalesDate
          }));

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
          
          // Set the first session of the first sales date as default
          const firstSessions = sessionsData[firstSalesDate] || [];
          if (firstSessions.length > 0) {
            setFormData(prev => ({
              ...prev,
              session: firstSessions[0]?.value || ''
            }));
          }
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

  const handleSalesDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSalesDate = e.target.value;
    setFormData(prev => ({
      ...prev,
      salesDate: selectedSalesDate,
      session: '' // Reset session when sales date changes
    }));

    // Set the first session of the selected sales date
    const sessionsForSelectedDate = sessionsMap[selectedSalesDate] || [];
    if (sessionsForSelectedDate.length > 0) {
      setFormData(prev => ({
        ...prev,
        session: sessionsForSelectedDate[0]?.value || ''
      }));
    }
  };

  const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      session: e.target.value
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (field: 'day' | 'month' | 'year', value: string) => {
    setFormData(prev => ({
      ...prev,
      dateOfBirth: {
        ...prev.dateOfBirth,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newUser: UserRegistration = {
        id: generateId(),
        salesDate: formData.salesDate,
        session: formData.session,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        idCard: formData.idCard,
        captcha: formData.captcha,
        isRegistered: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      storageUtils.saveUser(newUser);
      onUserSaved();
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    const firstSalesDate = salesDates.length > 0 ? salesDates[0]?.value || '' : '';
    const firstSessions = sessionsMap[firstSalesDate] || [];
    
    setFormData({
      salesDate: firstSalesDate,
      session: firstSessions.length > 0 ? firstSessions[0]?.value || '' : '',
      fullName: '',
      dateOfBirth: { day: '', month: '', year: '' },
      phoneNumber: '',
      email: '',
      idCard: '',
      captcha: '',
    });
  };

  // Get current sessions for selected sales date
  const currentSessions = sessionsMap[formData.salesDate] || [];

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sales date (Ngày bán hàng)
        </label>
        {isLoadingSalesDates ? (
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
            Loading sales dates...
          </div>
        ) : (
          <select
            value={formData.salesDate}
            onChange={handleSalesDateChange}
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

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Session (Phiên)
        </label>
        {isLoadingSessions ? (
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
            Loading sessions...
          </div>
        ) : (
          <select
            value={formData.session}
            onChange={handleSessionChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            disabled={!formData.salesDate || currentSessions.length === 0}
          >
            <option value="">-- Chọn phiên --</option>
            {currentSessions.map((session) => (
              <option key={session.value} value={session.value}>
                {session.displayText}
              </option>
            ))}
          </select>
        )}
      </div>

      <Input
        label="Full name (Họ và tên)"
        value={formData.fullName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('fullName', e.target.value)}
        required
      />

      <Input
        label="Phone number (Số điện thoại)"
        value={formData.phoneNumber}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phoneNumber', e.target.value)}
        required
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
        required
      />

      <Input
        label="ID Card (CCCD)"
        value={formData.idCard}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('idCard', e.target.value)}
        required
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date of birth (Ngày sinh)
        </label>
        <div className="grid grid-cols-3 gap-2">
          <Input
            label="Day"
            value={formData.dateOfBirth.day}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange('day', e.target.value)}
            required
          />
          <Input
            label="Month"
            value={formData.dateOfBirth.month}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange('month', e.target.value)}
            required
          />
          <Input
            label="Year"
            value={formData.dateOfBirth.year}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange('year', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Đang lưu...' : 'Lưu'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={resetForm}
          disabled={isLoading}
        >
          Làm mới
        </Button>
      </div>
    </form>
  );
};
