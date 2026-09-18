import { useState, useRef, useEffect } from "react";
import { socketService } from "@/lib/socket";
import { WebRTCService, getMicrophoneErrorMsg } from "@/lib/webrtc";
import { CallSession } from "../types/call.types";
import * as callSignaling from "../services/call.service";

export const useCall = () => {
  const [session, setSession] = useState<CallSession | null>(null);
  const sessionRef = useRef<CallSession | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const webrtc = useRef<WebRTCService>(new WebRTCService());

  const updateSession = (nextSession: CallSession | null) => {
    sessionRef.current = nextSession;
    setSession(nextSession);
  };

  const cleanupCall = () => {
    webrtc.current.cleanup();
    updateSession(null);
    setIsMuted(false);
  };

  const startCall = async (conversationId: string, receiverId: string) => {
    try {
      // 1. Xin quyền Microphone trước tiên
      await webrtc.current.initialize();
      
      // 2. Microphone OK -> Tiến hành gọi
      const callId = "call_" + Date.now();
      const meId = socketService.getSocket()?.id || "";
      
      updateSession({ callId, callerId: meId, receiverId, status: "CALLING", type: "VOICE" });
      callSignaling.sendCallRequest(callId, conversationId, receiverId);
      
    } catch (error) {
      alert(getMicrophoneErrorMsg(error));
      cleanupCall(); // Dọn dẹp nếu lỡ có lỗi gì đó
    }
  };

  const acceptCall = async () => {
    const currentSession = sessionRef.current;
    if (!currentSession) return;
    
    // Đang đổ chuông, chuyển sang Connecting ngay để khóa UI
    updateSession({ ...currentSession, status: "CONNECTING" });

    try {
      // 1. Xin quyền Microphone trước khi gửi webrtc:offer (Nếu là receiver, ta chờ offer, nhưng vẫn phải init mic trước)
      await webrtc.current.initialize();
      
      // 2. Báo cho Caller biết là ta đã Accept
      callSignaling.sendCallAccept(currentSession.callId, currentSession.callerId);
      
      // Chờ socket.on("webrtc:offer") ở Context để handleOfferAndCreateAnswer...
    } catch (error) {
      alert(getMicrophoneErrorMsg(error));
      // Báo cho bên kia biết là call bị end (vì ta không thể tham gia)
      callSignaling.sendCallEnd(currentSession.callId, currentSession.callerId);
      cleanupCall();
    }
  };

  const rejectCall = () => {
    const currentSession = sessionRef.current;
    if (!currentSession) return;
    callSignaling.sendCallReject(currentSession.callId, currentSession.callerId);
    cleanupCall();
  };

  const cancelCall = () => {
    const currentSession = sessionRef.current;
    if (!currentSession) return;
    callSignaling.sendCallCancel(currentSession.callId, currentSession.receiverId);
    cleanupCall();
  };

  const endCall = () => {
    const currentSession = sessionRef.current;
    if (!currentSession) return;
    
    const meId = socketService.getSocket()?.id || "";
    const targetId = currentSession.callerId === meId ? currentSession.receiverId : currentSession.callerId;
    
    callSignaling.sendCallEnd(currentSession.callId, targetId);
    cleanupCall();
  };

  const toggleMute = () => {
    const muted = webrtc.current.toggleMute();
    setIsMuted(muted);
  };

  return {
    session,
    sessionRef,
    updateSession,
    isMuted,
    startCall,
    acceptCall,
    rejectCall,
    cancelCall,
    endCall,
    toggleMute,
    cleanupCall,
    webrtc
  };
};