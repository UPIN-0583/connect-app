import { AuthSocket } from "../socket-types.js";
import { registerMessageHandlers } from "./message.handler.js";
import { registerTypingHandlers } from "./typing.handler.js";
import { registerReadHandlers } from "./read.handler.js";
import { handlePresenceConnect, handlePresenceDisconnect } from "./presence.handler.js";
import { registerCallHandlers } from "./call.handler.js";

export const handleConnection = (socket: AuthSocket) => {
  const user = socket.user;
  
  if (!user) {
    socket.disconnect();
    return;
  }

  console.log(`[Socket] \u{1F7E2} User connected: ${user.id} (SocketID: ${socket.id})`);

  // Presence logic
  handlePresenceConnect(socket);

  // Feature Handlers
  registerMessageHandlers(socket);
  registerTypingHandlers(socket);
  registerReadHandlers(socket);
  registerCallHandlers(socket);

  socket.on("disconnect", (reason) => {
    console.log(`[Socket] \u{1F534} User disconnected: ${user.id} - Reason: ${reason}`);
    handlePresenceDisconnect(socket);
  });
};
