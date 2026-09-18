import { useState, useRef, useEffect } from "react";
import { socketService } from "@/lib/socket";
import { WebRTCService } from "@/lib/webrtc";
import { CallSession, CallStatus } from "../types/call.types";
import * as callSignaling from "../services/call.service";

export const useCall = () => {
  const [session, setSession] = useState<CallSession | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const webrtc = useRef<WebRTCService>(new WebRTCService());
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // --- ACTIONS ---

  const startCall = (conversationId: string, receiverId: string) => {
    const callId = "call_" + Date.now();
    setSession({ callId, callerId: (socketService.getSocket()?.id || ""), receiverId, status: "CALLING", type: "VOICE" });
    callSignaling.sendCallRequest(callId, conversationId, receiverId);
  };

  const acceptCall = async () => {
    if (!session) return;
    setSession(prev => prev ? { ...prev, status: "CONNECTING" } : null);
    callSignaling.sendCallAccept(session.callId, session.callerId);
    
    // We are the receiver, wait for webrtc:offer from caller. The stream initialization happens when offer arrives or right now.
  };

  const rejectCall = () => {
    if (!session) return;
    callSignaling.sendCallReject(session.callId, session.callerId);
    cleanupCall();
  };

  const cancelCall = () => {
    if (!session) return;
    callSignaling.sendCallCancel(session.callId, session.receiverId);
    cleanupCall();
  };

  const endCall = () => {
    if (!session) return;
    const targetId = session.callerId === (socketService.getSocket()?.id || "") ? session.receiverId : session.callerId;
    callSignaling.sendCallEnd(session.callId, targetId);
    cleanupCall();
  };

  const toggleMute = () => {
    const muted = webrtc.current.toggleMute();
    setIsMuted(muted);
  };

  const cleanupCall = () => {
    webrtc.current.cleanup();
    setSession(null);
    setRemoteStream(null);
    setIsMuted(false);
    if (timerInterval.current) clearInterval(timerInterval.current);
  };

  // --- SOCKET LISTENERS ---
  
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // 1. Incoming Call Request
    socket.on("call:request", (data) => {
      setSession({
        callId: data.callId,
        callerId: data.callerId,
        receiverId: socket.id || "",
        status: "RINGING",
        type: "VOICE"
      });
    });

    // 2. Call Accepted (Caller receives this)
    socket.on("call:accept", async (data) => {
      setSession(prev => prev ? { ...prev, status: "CONNECTING" } : null);
      
      // Initialize WebRTC as Caller
      await webrtc.current.initialize();
      const offer = await webrtc.current.createOffer();
      
      const targetId = session?.receiverId || ""; // Need state sync, but we use data.targetId if available, wait, session state might be stale in this closure. 
      // Better to rely on functional state updates or refs. We'll refine this.
    });

    // We will complete the socket listeners in the full Context implementation to avoid closure stale state.
    
    return () => {
      socket.off("call:request");
      socket.off("call:accept");
      // ...
    };
  }, []);

  return {
    session,
    isMuted,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    cancelCall,
    endCall,
    toggleMute,
    setSession // for internal context updates
  };
};
