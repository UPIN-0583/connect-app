import { Message } from "@prisma/client";
import { Socket } from "socket.io";

// Dữ liệu User sẽ được gắn vào socket sau khi xác thực thành công
export interface SocketUser {
  id: string;
}

// Mở rộng Socket mặc định của thư viện
export interface AuthSocket extends Socket {
  user?: SocketUser;
}

// Các sự kiện Server GỬI VỀ Client
export interface ServerToClientEvents {
  "presence:online": (data: { userId: string }) => void;
  "presence:offline": (data: { userId: string }) => void;
  error: (err: { message: string; code?: string }) => void;

  "message:new": (message: Message) => void;
  "typing:start": (data: { userId: string; conversationId: string }) => void;
  "typing:stop": (data: { userId: string; conversationId: string }) => void;
}

// Các sự kiện Client GỬI LÊN Server
export interface ClientToServerEvents {
  "conversation:join": (data: { conversationId: string }) => void;
  "message:send": (data: { conversationId: string; content: string }) => void;
  "typing:start": (data: { conversationId: string }) => void;
  "typing:stop": (data: { conversationId: string }) => void;
}