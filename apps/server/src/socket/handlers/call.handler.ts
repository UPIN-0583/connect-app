import { AuthSocket } from "../socket-types.js";
import { getIO } from "../socket-server.js";
import { callService } from "../../modules/calls/call.service.js";

// Utility function to get user's socket room (we can use a room named user:userId to send messages to all tabs of a user)
const getUserRoom = (userId: string) => `user:${userId}`;

export const registerCallHandlers = (socket: AuthSocket) => {
  const user = socket.user!;

  // 0. Auto-join user to their personal room when they connect so we can route calls to them
  socket.join(getUserRoom(user.id));

  // --- CALL SIGNALING ---
  
  socket.on("call:request", async (data) => {
    try {
      const isValid = await callService.validateCallRequest(data, user.id);
      if (!isValid) return;

      console.log(`[Call] 📞 User ${user.id} is calling ${data.receiverId} (Call ID: ${data.callId})`);
      
      // Route the request to the receiver's personal room
      socket.to(getUserRoom(data.receiverId)).emit("call:request", {
        callId: data.callId,
        conversationId: data.conversationId,
        callerId: user.id,
        type: data.type
      });
    } catch (err) {
      console.error("[Call] Error handling call:request", err);
    }
  });

  socket.on("call:accept", (data) => {
    console.log(`[Call] ✅ User ${user.id} accepted call ${data.callId} from ${data.callerId}`);
    socket.to(getUserRoom(data.callerId)).emit("call:accept", { callId: data.callId });
  });

  socket.on("call:reject", (data) => {
    console.log(`[Call] ❌ User ${user.id} rejected call ${data.callId} from ${data.callerId}`);
    socket.to(getUserRoom(data.callerId)).emit("call:reject", { callId: data.callId });
  });

  socket.on("call:cancel", (data) => {
    console.log(`[Call] 🚫 User ${user.id} cancelled call ${data.callId} to ${data.receiverId}`);
    socket.to(getUserRoom(data.receiverId)).emit("call:cancel", { callId: data.callId });
  });

  socket.on("call:end", (data) => {
    console.log(`[Call] 🏁 User ${user.id} ended call ${data.callId} with ${data.targetId}`);
    socket.to(getUserRoom(data.targetId)).emit("call:end", { callId: data.callId });
  });

  // --- WEBRTC SIGNALING ---
  
  socket.on("webrtc:offer", (data) => {
    socket.to(getUserRoom(data.targetId)).emit("webrtc:offer", {
      callId: data.callId,
      callerId: user.id,
      offer: data.offer
    });
  });

  socket.on("webrtc:answer", (data) => {
    socket.to(getUserRoom(data.targetId)).emit("webrtc:answer", {
      callId: data.callId,
      receiverId: user.id,
      answer: data.answer
    });
  });

  socket.on("webrtc:ice-candidate", (data) => {
    socket.to(getUserRoom(data.targetId)).emit("webrtc:ice-candidate", {
      callId: data.callId,
      senderId: user.id,
      candidate: data.candidate
    });
  });
};
