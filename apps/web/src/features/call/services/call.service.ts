import { socketService } from "@/lib/socket";

export const sendCallRequest = (callId: string, conversationId: string, receiverId: string) => {
  socketService.getSocket()?.emit("call:request", { callId, conversationId, receiverId, type: "VOICE" });
};

export const sendCallAccept = (callId: string, callerId: string) => {
  socketService.getSocket()?.emit("call:accept", { callId, callerId });
};

export const sendCallReject = (callId: string, callerId: string) => {
  socketService.getSocket()?.emit("call:reject", { callId, callerId });
};

export const sendCallCancel = (callId: string, receiverId: string) => {
  socketService.getSocket()?.emit("call:cancel", { callId, receiverId });
};

export const sendCallEnd = (callId: string, targetId: string) => {
  socketService.getSocket()?.emit("call:end", { callId, targetId });
};

export const sendWebRTCOffer = (callId: string, targetId: string, offer: any) => {
  socketService.getSocket()?.emit("webrtc:offer", { callId, targetId, offer });
};

export const sendWebRTCAnswer = (callId: string, targetId: string, answer: any) => {
  socketService.getSocket()?.emit("webrtc:answer", { callId, targetId, answer });
};

export const sendWebRTCIceCandidate = (callId: string, targetId: string, candidate: any) => {
  socketService.getSocket()?.emit("webrtc:ice-candidate", { callId, targetId, candidate });
};
