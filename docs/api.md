# REST API Documentation

## Base URL
- Development: `http://localhost:5000`

---

## Chuẩn phản hồi chung (Response Format)

### Thành công:
```json
{
  "success": true,
  "data": { ... }
}
```

### Thất bại:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mô tả lỗi chi tiết"
  }
}
```

### Bảng mã lỗi hệ thống (Error Codes):
- `EMAIL_ALREADY_EXISTS`: Email đã được sử dụng (400)
- `USERNAME_ALREADY_EXISTS`: Username đã tồn tại (400)
- `INVALID_CREDENTIALS`: Sai email hoặc mật khẩu (401)
- `UNAUTHORIZED`: Chưa đăng nhập hoặc token không hợp lệ (401)
- `INVALID_REFRESH_TOKEN`: Refresh token không hợp lệ hoặc đã bị thu hồi (401)
- `USER_NOT_FOUND`: Không tìm thấy người dùng (404)
- `VALIDATION_ERROR`: Dữ liệu gửi lên không đúng định dạng Zod schema (400)
- `CANNOT_CHAT_WITH_SELF`: Không thể tự tạo cuộc trò chuyện với chính mình (400)
- `CONVERSATION_NOT_FOUND`: Không tìm thấy phòng chat (404)
- `NOT_CONVERSATION_MEMBER`: Không phải thành viên của cuộc trò chuyện (403)
- `MESSAGE_NOT_FOUND`: Không tìm thấy tin nhắn (404)
- `MESSAGE_NOT_OWNER`: Không có quyền xóa/sửa tin nhắn của người khác (403)

---

## 1. Health Check

### `GET /api/health`
Kiểm tra trạng thái server.
- **Header:** Không yêu cầu
- **Response 200:**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-09-15T08:00:00.000Z"
  }
  ```

---

## 2. Authentication

### `POST /api/auth/register`
Đăng ký tài khoản mới.
- **Body (JSON):**
  ```json
  {
    "email": "user@example.com",
    "username": "userexample",
    "password": "Password123@",
    "displayName": "User Example"
  }
  ```
- **Response 201:**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "userexample",
      "displayName": "User Example",
      "createdAt": "2026-09-15T08:00:00.000Z"
    }
  }
  ```

### `POST /api/auth/login`
Đăng nhập, trả về Access Token trong body và set Refresh Token vào HTTP-Only Cookie.
- **Body (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123@"
  }
  ```
- **Response 200:**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOi...",
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "username": "userexample",
        "displayName": "User Example"
      }
    }
  }
  ```
- **Set-Cookie:** `refreshToken=...; HttpOnly; SameSite=Lax; Max-Age=604800; Path=/`

### `POST /api/auth/refresh`
Làm mới Access Token khi token cũ hết hạn (sử dụng Refresh Token từ Cookie).
- **Header:** Tự động gửi kèm Cookie `refreshToken`
- **Response 200:**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOi..."
    }
  }
  ```

### `POST /api/auth/logout`
Đăng xuất tài khoản, thu hồi refresh token và xóa cookie.
- **Response 200:**
  ```json
  {
    "success": true,
    "message": "Đăng xuất thành công"
  }
  ```

---

## 3. Users

### `GET /api/users/me`
Lấy thông tin tài khoản đang đăng nhập.
- **Header:** `Authorization: Bearer <accessToken>`
- **Response 200:**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "userexample",
      "displayName": "User Example",
      "avatarUrl": null,
      "bio": null,
      "status": "OFFLINE",
      "createdAt": "2026-09-15T08:00:00.000Z"
    }
  }
  ```

---

## 4. Conversations

### `POST /api/conversations/direct`
Tạo mới hoặc lấy lại cuộc trò chuyện 1-1 giữa người dùng hiện tại và người dùng khác (chống trùng phòng).
- **Header:** `Authorization: Bearer <accessToken>`
- **Body (JSON):**
  ```json
  {
    "userId": "uuid-nguoi-nhan"
  }
  ```
- **Response 200:**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-phong-chat",
      "type": "DIRECT",
      "name": null,
      "avatarUrl": null,
      "createdBy": "uuid-nguoi-tao",
      "createdAt": "2026-09-15T08:00:00.000Z",
      "updatedAt": "2026-09-15T08:00:00.000Z",
      "members": [
        {
          "role": "MEMBER",
          "user": {
            "id": "uuid-A",
            "username": "usera",
            "displayName": "User A",
            "avatarUrl": null,
            "status": "ONLINE"
          }
        },
        {
          "role": "MEMBER",
          "user": {
            "id": "uuid-B",
            "username": "userb",
            "displayName": "User B",
            "avatarUrl": null,
            "status": "OFFLINE"
          }
        }
      ]
    }
  }
  ```

### `GET /api/conversations`
Lấy danh sách các cuộc trò chuyện của người dùng hiện tại (kèm tin nhắn mới nhất để hiển thị xem trước).
- **Header:** `Authorization: Bearer <accessToken>`
- **Response 200:** Danh sách các cuộc trò chuyện sắp xếp theo `updatedAt: desc`.

### `GET /api/conversations/:conversationId`
Lấy chi tiết thông tin và thành viên của một phòng chat.
- **Header:** `Authorization: Bearer <accessToken>`
- **Response 200:** Thông tin phòng chat. Trả về `403 NOT_CONVERSATION_MEMBER` nếu người gọi không thuộc phòng.

---

## 5. Messages

### `POST /api/conversations/:conversationId/messages`
Gửi tin nhắn mới vào cuộc trò chuyện.
- **Header:** `Authorization: Bearer <accessToken>`
- **Body (JSON):**
  ```json
  {
    "content": "Nội dung tin nhắn",
    "type": "TEXT"
  }
  ```
- **Response 201:**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-tin-nhan",
      "conversationId": "uuid-phong",
      "senderId": "uuid-nguoi-gui",
      "type": "TEXT",
      "content": "Nội dung tin nhắn",
      "deletedAt": null,
      "createdAt": "2026-09-15T08:00:00.000Z",
      "updatedAt": "2026-09-15T08:00:00.000Z",
      "sender": {
        "id": "uuid-nguoi-gui",
        "username": "usera",
        "displayName": "User A",
        "avatarUrl": null
      }
    }
  }
  ```

### `GET /api/conversations/:conversationId/messages`
Lấy danh sách tin nhắn theo phân trang con trỏ (Cursor-based pagination).
- **Header:** `Authorization: Bearer <accessToken>`
- **Query Params:**
  - `limit`: Số tin nhắn muốn lấy (1 - 100, mặc định: 30)
  - `cursor`: UUID của tin nhắn làm mốc phân trang (tùy chọn)
- **Response 200:**
  ```json
  {
    "success": true,
    "data": {
      "messages": [ ... ],
      "nextCursor": "uuid-tin-nhan-tiep-theo-hoac-null"
    }
  }
  ```

### `DELETE /api/messages/:messageId`
Xóa mềm tin nhắn (chỉ người gửi mới có quyền xóa).
- **Header:** `Authorization: Bearer <accessToken>`
- **Response 200:**
  ```json
  {
    "success": true,
    "message": "Tin nhắn đã được xóa",
    "data": {
      "id": "uuid-tin-nhan",
      "deletedAt": "2026-09-15T08:30:00.000Z"
    }
  }
  ```
