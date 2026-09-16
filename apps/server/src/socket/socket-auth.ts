import { AuthSocket } from "./socket-types.js";
import { verifyAccessToken } from "../utils/jwt.util.js"; 

export const socketAuthMiddleware = (socket: AuthSocket, next: (err?: Error) => void) => {
  // Client sẽ truyền token qua socket.handshake.auth
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication error: Missing token"));
  }

  try {
    // Dùng luôn hàm tiện ích đã tạo ở Day 1
    const decoded = verifyAccessToken(token);
    
    // Gắn User hợp lệ vào socket
    socket.user = { id: decoded.userId };
    
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
};