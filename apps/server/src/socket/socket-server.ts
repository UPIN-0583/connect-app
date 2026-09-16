import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { socketAuthMiddleware } from "./socket-auth.js";
import { handleConnection } from "./handlers/connection.handler.js";
import { ClientToServerEvents, ServerToClientEvents } from "./socket-types.js";

type AppSocketServer = Server<ClientToServerEvents, ServerToClientEvents>;

let io: AppSocketServer | null = null;

export const initializeSocket = (httpServer: HttpServer) => {
  // Khởi tạo Socket.IO đính kèm vào HTTP Server
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // 1. Áp dụng bảo vệ Auth
  io.use(socketAuthMiddleware as any);

  // 2. Bắt sự kiện khi có người kết nối
  io.on("connection", (socket) => {
    handleConnection(socket as any); 
  });

  console.log("[Socket] 🚀 Khởi tạo Socket.IO thành công!");
  return io;
};

// Hàm tiện ích để sau này các Services (như Message Service) có thể gọi `getIO().emit(...)`
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io chưa được khởi tạo!");
  }
  return io;
};