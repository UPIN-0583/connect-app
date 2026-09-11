# Realtime WebSocket Architecture

## Công nghệ sử dụng
- **Socket.IO** (Client & Server)
- **Redis Adapter**: Dùng cho việc scale đa tiến trình / đa server sau này

## Luồng hoạt động dự kiến
1. Người dùng kết nối WebSocket gửi kèm Access Token để xác thực.
2. Server xác thực và đưa socket vào room cá nhân (`user:<userId>`) và các conversation rooms (`room:<conversationId>`).
3. Các sự kiện chính:
   - `message:send`: Gửi tin nhắn mới đến room
   - `message:receive`: Nhận tin nhắn trong room
   - `typing:start` / `typing:stop`: Trạng thái đang soạn tin nhắn
   - `presence:status`: Trạng thái online / offline / away
