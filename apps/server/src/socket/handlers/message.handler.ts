import { AuthSocket } from "../socket-types.js";
import { getIO } from "../socket-server.js";
import * as messageService from "../../services/message.service.js";
import * as conversationRepo from "../../repositories/conversation.repository.js";

export const registerMessageHandlers = (socket: AuthSocket) => {
  const user = socket.user!;

  socket.on("conversation:join", async (data: { conversationId: string }) => {
    try {
      const isMember = await conversationRepo.isMember(data.conversationId, user.id);
      if (!isMember) {
        socket.emit("error", { message: "Access denied." });
        return;
      }
      
      const roomName = `conversation:${data.conversationId}`;
      socket.join(roomName);
      console.log(`[Socket] \u{1F4AC} User ${user.id} joined room: ${roomName}`);
    } catch (err) {
      console.error("[Socket Error] Join room error:", err);
    }
  });

  socket.on("message:send", async (data: { conversationId: string; content: string }) => {
     try {
       const newMessage = await messageService.sendMessage({
         conversationId: data.conversationId,
         senderId: user.id,
         content: data.content
       });

       const roomName = `conversation:${data.conversationId}`;
       getIO().to(roomName).emit("message:new", newMessage);
     } catch (err: any) {
        socket.emit("error", { message: err.message || "Error saving message" });
     }
  });
};
