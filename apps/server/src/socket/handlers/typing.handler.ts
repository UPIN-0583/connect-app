import { AuthSocket } from "../socket-types.js";

export const registerTypingHandlers = (socket: AuthSocket) => {
  const user = socket.user!;

  socket.on("typing:start", (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit("typing:start", { 
      userId: user.id, 
      conversationId: data.conversationId 
    });
  });

  socket.on("typing:stop", (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit("typing:stop", { 
      userId: user.id, 
      conversationId: data.conversationId 
    });
  });
};
