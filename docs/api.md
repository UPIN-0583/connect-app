# REST API Documentation

## Base URL
- Development: `http://localhost:5000`

## Endpoints

### 1. Health Check
- **Route**: `GET /api/health`
- **Mô tả**: Kiểm tra trạng thái hoạt động của backend server
- **Response**:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-09-11T03:00:00.000Z"
  }
  ```

### 2. Users (Lấy danh sách người dùng)
- **Route**: `GET /api/users`
- **Mô tả**: Lấy danh sách tài khoản người dùng
- **Response**:
  ```json
  [
    {
      "id": "uuid",
      "username": "demouser",
      "displayName": "Demo User",
      "email": "demo@connectapp.com",
      "createdAt": "2026-09-11T03:00:00.000Z"
    }
  ]
  ```

### 3. Authentication (Kế hoạch mở rộng)
- `POST /api/auth/register`: Đăng ký tài khoản
- `POST /api/auth/login`: Đăng nhập & cấp phát JWT Access / Refresh token
- `POST /api/auth/refresh`: Làm mới token
- `POST /api/auth/logout`: Đăng xuất
