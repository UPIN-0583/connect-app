# Database Design

## Database Engine
- **PostgreSQL** (Hosted on Neon Serverless)
- **ORM**: Prisma Client

## Schemas & Models

### Model `User`
Lưu trữ thông tin tài khoản người dùng:

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | `@id`, `@default(uuid())` | Mã định danh duy nhất |
| `email` | String | `@unique` | Địa chỉ email đăng ký |
| `username` | String | `@unique` | Tên người dùng / handle |
| `createdAt` | DateTime | `@default(now())` | Thời gian tạo tài khoản |

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  username  String   @unique
  createdAt DateTime @default(now())
}
```
