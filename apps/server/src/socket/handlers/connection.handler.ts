import { AuthSocket } from "../socket-types.js";
import {registerMessageHandlers} from "./message.handler.js";

export const handleConnection = (socket: AuthSocket) => {
  const user = socket.user;
  
  if (!user) {
    socket.disconnect(); // Nếu lọt qua mà không có user -> Cắt cầu dao ngay
    return;
  }

  console.log(`[Socket] 🟢 User kết nối: ${user.id} (SocketID: ${socket.id})`);

  registerMessageHandlers(socket);

  // Lắng nghe khi họ tắt trình duyệt hoặc mất mạng
  socket.on("disconnect", (reason) => {
    console.log(`[Socket] 🔴 User ngắt kết nối: ${user.id} - Lý do: ${reason}`);
    // Ở Task sau mình sẽ làm tính năng Offline Presence ở đây
  });
};