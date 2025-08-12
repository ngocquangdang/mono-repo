# POP MART Registration System

Hệ thống đăng ký tự động POP MART với 3 cột chức năng chính.

## Tính năng

### Cột 1: Form đăng ký
- Form đăng ký theo thiết kế POP MART
- Tự động điền sẵn thông tin mẫu
- Lưu thông tin vào localStorage
- Reset form sau khi lưu

### Cột 2: Danh sách người dùng
- Hiển thị tất cả người dùng đã lưu
- Nút "Đăng ký" tự động:
  - Lấy captcha mới từ API
  - Gọi API đăng ký
  - Cập nhật trạng thái
- Nút "Chi tiết" để chỉnh sửa thông tin
- Nút "Xóa" để xóa người dùng

### Cột 3: Panel trạng thái
- Hiển thị log hoạt động real-time
- Auto-scroll để theo dõi
- Xuất log ra file
- Xóa log

## Công nghệ sử dụng

- **Next.js 15** với App Router
- **React 19** với hooks
- **TypeScript** cho type safety
- **Tailwind CSS** cho styling
- **localStorage** cho data persistence
- **Monorepo** với Turborepo

## Cấu trúc dự án

```
apps/web/
├── app/
│   ├── components/
│   │   ├── RegistrationForm.tsx    # Form đăng ký
│   │   ├── UserList.tsx            # Danh sách người dùng
│   │   └── StatusPanel.tsx         # Panel trạng thái
│   ├── types.ts                    # TypeScript types
│   ├── utils.ts                    # Utility functions
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Main page
├── tailwind.config.js              # Tailwind config
└── postcss.config.js               # PostCSS config
```

## API Simulation

Hệ thống mô phỏng các API calls:

- `getCaptcha()`: Tạo captcha ngẫu nhiên
- `registerUser()`: Đăng ký người dùng với tỷ lệ thành công 70%

## Cách sử dụng

1. **Lưu người dùng**: Điền form ở cột 1 và nhấn "Lưu"
2. **Đăng ký tự động**: Nhấn nút "Đăng ký" ở cột 2
3. **Chỉnh sửa**: Nhấn "Chi tiết" để sửa thông tin
4. **Theo dõi**: Xem log ở cột 3

## Development

```bash
# Chạy development server
yarn dev

# Build production
yarn build

# Lint code
yarn lint

# Type check
yarn check-types
```

## Data Structure

```typescript
interface UserRegistration {
  id: string;
  salesDate: string;
  session: string;
  fullName: string;
  dateOfBirth: {
    day: string;
    month: string;
    year: string;
  };
  phoneNumber: string;
  email: string;
  idCard: string;
  captcha: string;
  isRegistered: boolean;
  registrationResult?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Features

- ✅ Responsive design
- ✅ TypeScript support
- ✅ Local storage persistence
- ✅ Real-time status updates
- ✅ Auto-registration flow
- ✅ Form validation
- ✅ Error handling
- ✅ Log export functionality
