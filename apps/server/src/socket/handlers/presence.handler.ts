import { AuthSocket } from "../socket-types.js";
import { getIO } from "../socket-server.js";

// Global map in-memory for presence
const userSockets = new Map<string, Set<string>>();

export const handlePresenceConnect = (socket: AuthSocket) => {
  const user = socket.user!;
  
  if (!userSockets.has(user.id)) {
    userSockets.set(user.id, new Set());
  }
  userSockets.get(user.id)!.add(socket.id);
  
  // Neu la tab dau tien -> ONLINE
  if (userSockets.get(user.id)!.size === 1) {
    getIO().emit("presence:online", { userId: user.id });
    console.log(`[Presence] \u{1F7E2} User ${user.id} is now ONLINE`);
  }

  // Gui danh sach online cho user moi connect
  const onlineUsers = Array.from(userSockets.keys());
  socket.emit("presence:sync", { userIds: onlineUsers });
};

export const handlePresenceDisconnect = (socket: AuthSocket) => {
  const user = socket.user;
  if (!user) return;

  const sockets = userSockets.get(user.id);
  if (sockets) {
    sockets.delete(socket.id);
    
    // Neu tat tab cuoi cung -> OFFLINE
    if (sockets.size === 0) {
      userSockets.delete(user.id);
      getIO().emit("presence:offline", { userId: user.id });
      console.log(`[Presence] \u{1F534} User ${user.id} is now OFFLINE`);
    }
  }
};
