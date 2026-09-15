# Database Design

## Database Engine
- **PostgreSQL** (Hosted on Neon Serverless)
- **ORM**: Prisma Client v6.x

---

## Enums

### `UserStatus`
Trạng thái trực tuyến của người dùng:
- `ONLINE`: Đang hoạt động
- `OFFLINE`: Không hoạt động
- `AWAY`: Tạm vắng

### `ConversationType`
Phân loại cuộc trò chuyện:
- `DIRECT`: Cuộc trò chuyện 1-1 giữa hai người dùng
- `GROUP`: Cuộc trò chuyện nhóm nhiều thành viên

### `MemberRole`
Vai trò của thành viên trong cuộc trò chuyện:
- `MEMBER`: Thành viên thông thường
- `ADMIN`: Quản trị viên phòng chat

### `MessageType`
Loại nội dung tin nhắn:
- `TEXT`: Tin nhắn văn bản thuần túy
- `IMAGE`: Hình ảnh
- `FILE`: Tệp đính kèm
- `AUDIO`: Tin nhắn thoại / âm thanh
- `SYSTEM`: Thông báo hệ thống (thành viên vào/ra nhóm, đổi tên phòng...)

---

## Models & Schemas

### 1. Model `User` (`users`)
Lưu trữ thông tin tài khoản người dùng:

| Trường | Kiểu dữ liệu | Ràng buộc / Thuộc tính | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | `@id @default(uuid())` | Khóa chính duy nhất |
| `email` | String | `@unique` | Email đăng nhập |
| `username` | String | `@unique` | Tên người dùng định danh |
| `passwordHash` | String | `@map("password_hash")` | Mật khẩu băm (Argon2id) |
| `displayName` | String | `@map("display_name")` | Tên hiển thị công khai |
| `avatarUrl` | String? | `@map("avatar_url")` | Đường dẫn ảnh đại diện |
| `bio` | String? | | Tiểu sử ngắn |
| `status` | UserStatus | `@default(OFFLINE)` | Trạng thái hoạt động |
| `lastSeenAt` | DateTime? | `@map("last_seen_at")` | Thời điểm hoạt động cuối |
| `createdAt` | DateTime | `@default(now()) @map("created_at")` | Ngày tạo |
| `updatedAt` | DateTime | `@updatedAt @map("updated_at")` | Ngày cập nhật |

---

### 2. Model `RefreshToken` (`refresh_tokens`)
Quản lý phiên đăng nhập và cơ chế Token Rotation:

| Trường | Kiểu dữ liệu | Ràng buộc / Thuộc tính | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | `@id @default(uuid())` | Khóa chính |
| `userId` | String | `@map("user_id")` | Khóa ngoại trỏ về `users.id` (onDelete: Cascade) |
| `tokenHash` | String | `@map("token_hash")` | Hash SHA-256 của Refresh Token |
| `expiresAt` | DateTime | `@map("expires_at")` | Thời điểm token hết hạn |
| `revokedAt` | DateTime? | `@map("revoked_at")` | Thời điểm token bị thu hồi (đăng xuất / rotation) |
| `createdAt` | DateTime | `@default(now()) @map("created_at")` | Ngày tạo token |

*Index: `@@index([userId])`, `@@index([tokenHash])*

---

### 3. Model `Conversation` (`conversations`)
Lưu thông tin phòng trò chuyện:

| Trường | Kiểu dữ liệu | Ràng buộc / Thuộc tính | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | `@id @default(uuid())` | Khóa chính |
| `type` | ConversationType | `@default(DIRECT)` | Loại phòng (DIRECT / GROUP) |
| `name` | String? | | Tên nhóm (dành cho GROUP) |
| `avatarUrl` | String? | `@map("avatar_url")` | Ảnh nhóm (dành cho GROUP) |
| `createdBy` | String? | `@map("created_by")` | ID người tạo phòng |
| `createdAt` | DateTime | `@default(now()) @map("created_at")` | Ngày tạo |
| `updatedAt` | DateTime | `@updatedAt @map("updated_at")` | Thời điểm có tin nhắn mới nhất |

---

### 4. Model `ConversationMember` (`conversation_members`)
Bảng trung gian liên kết giữa `User` và `Conversation`:

| Trường | Kiểu dữ liệu | Ràng buộc / Thuộc tính | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | `@id @default(uuid())` | Khóa chính |
| `conversationId` | String | `@map("conversation_id")` | Khóa ngoại trỏ về `conversations.id` |
| `userId` | String | `@map("user_id")` | Khóa ngoại trỏ về `users.id` |
| `role` | MemberRole | `@default(MEMBER)` | Vai trò trong phòng (MEMBER / ADMIN) |
| `joinedAt` | DateTime | `@default(now()) @map("joined_at")` | Thời điểm tham gia phòng |
| `lastReadMessageId` | String? | `@map("last_read_message_id")` | ID tin nhắn đọc gần nhất (đánh dấu đã đọc) |

*Ràng buộc & Index:*
- `@@unique([conversationId, userId])`: Mỗi user chỉ là thành viên 1 lần trong 1 phòng.
- `@@index([conversationId])`, `@@index([userId])`.

---

### 5. Model `Message` (`messages`)
Lưu trữ nội dung các tin nhắn gửi đi:

| Trường | Kiểu dữ liệu | Ràng buộc / Thuộc tính | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | `@id @default(uuid())` | Khóa chính |
| `conversationId` | String | `@map("conversation_id")` | Khóa ngoại trỏ về `conversations.id` |
| `senderId` | String | `@map("sender_id")` | Khóa ngoại trỏ về `users.id` |
| `type` | MessageType | `@default(TEXT)` | Loại tin nhắn (TEXT, IMAGE...) |
| `content` | String | | Nội dung văn bản tin nhắn |
| `deletedAt` | DateTime? | `@map("deleted_at")` | Thời điểm xóa mềm (`null` nếu chưa xóa) |
| `createdAt` | DateTime | `@default(now()) @map("created_at")` | Thời điểm gửi |
| `updatedAt` | DateTime | `@updatedAt @map("updated_at")` | Thời điểm chỉnh sửa |

*Index: `@@index([conversationId, createdAt])`: Tối ưu hóa truy vấn tải tin nhắn phân trang (Cursor pagination).*
