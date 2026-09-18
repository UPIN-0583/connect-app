import { AuthSocket } from "../socket-types.js";
import { getIO } from "../socket-server.js";
import * as conversationRepo from "../../repositories/conversation.repository.js";

export const registerReadHandlers = (socket: AuthSocket) => {
  const user = socket.user!;

  socket.on("message:read", async (data: { conversationId: string; messageId: string }) => {
    try {
       await conversationRepo.updateLastReadMessage(data.conversationId, user.id, data.messageId);
       
       const roomName = `conversation:${data.conversationId}`;
       getIO().to(roomName).emit("message:read_updated", {
         conversationId: data.conversationId,
         userId: user.id,
         messageId: data.messageId
       });
    } catch (err) {
       console.error("[Socket] Error updating Read Receipt:", err);
    }
  });
};
