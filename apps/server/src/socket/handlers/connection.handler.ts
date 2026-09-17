import { AuthSocket } from "../socket-types.js";
import {registerMessageHandlers} from "./message.handler.js";

import { getIO } from "../socket-server.js"; 

const userSockets = new Map<string, Set<string>>();

export const handleConnection = (socket: AuthSocket) => {
  const user = socket.user;
  
  if (!user) {
    socket.disconnect(); // Nếu lọt qua mà không có user -> Cắt cầu dao ngay
    return;
  }

  console.log(`[Socket] 🟢 User kết nối: ${user.id} (SocketID: ${socket.id})`);

  // 1. Thêm socket này vào danh sách của User
  if (!userSockets.has(user.id)) {
    userSockets.set(user.id, new Set());
  }
  userSockets.get(user.id)!.add(socket.id);
  // Nếu đây là tab ĐẦU TIÊN user này mở -> Báo cho toàn server biết họ đã ONLINE
  if (userSockets.get(user.id)!.size === 1) {
    getIO().emit("presence:online", { userId: user.id });
    console.log(`[Presence] 🟢 User ${user.id} is now ONLINE`);
  }

  const onlineUsers = Array.from(userSockets.keys());
  socket.emit("presence:sync", { userIds: onlineUsers });

  registerMessageHandlers(socket);

  // 2. Xử lý khi tắt tab / rớt mạng
  socket.on("disconnect", () => {
    const sockets = userSockets.get(user.id);
    if (sockets) {
      sockets.delete(socket.id);
      
      // Nếu tắt tab CUỐI CÙNG -> Báo cho toàn server biết họ đã OFFLINE
      if (sockets.size === 0) {
        userSockets.delete(user.id);
        getIO().emit("presence:offline", { userId: user.id });
        console.log(`[Presence] 🔴 User ${user.id} is now OFFLINE`);
      }
    }
  });

  // Lắng nghe khi họ tắt trình duyệt hoặc mất mạng
  socket.on("disconnect", (reason) => {
    console.log(`[Socket] 🔴 User ngắt kết nối: ${user.id} - Lý do: ${reason}`);
    // Ở Task sau mình sẽ làm tính năng Offline Presence ở đây
  });
};