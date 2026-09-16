import { io, Socket } from "socket.io-client";

// URL của Backend (Nếu NEXT_PUBLIC_API_URL là http://localhost:5000/api thì SOCKET_URL sẽ là http://localhost:5000)
const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace("/api", "");

class SocketService {
  private socket: Socket | null = null;

  // Hàm gọi khi User đăng nhập thành công
  connect(accessToken: string) {
    if (this.socket?.connected) return; // Tránh mở nhiều kết nối

    this.socket = io(SOCKET_URL, {
      auth: {
        token: accessToken // Chìa khoá JWT nhét vào đây để Backend kiểm tra!
      }
    });

    this.socket.on("connect", () => {
      console.log("🟢 [Frontend] Đã kết nối Socket thành công!");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔴 [Frontend] Mất kết nối Socket:", reason);
    });

    this.socket.on("connect_error", (err) => {
      console.error("❌ [Frontend] Lỗi kết nối Socket:", err.message);
    });
  }

  // Hàm gọi khi User Đăng xuất
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

// Xuất ra 1 biến duy nhất (Singleton) để dùng chung toàn app
export const socketService = new SocketService();