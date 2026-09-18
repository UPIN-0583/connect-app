import React, { createContext, useContext, useEffect, useRef } from "react";
import { useCall } from "../hooks/useCall";
import { socketService } from "@/lib/socket";
import { WebRTCService } from "@/lib/webrtc";
import * as callSignaling from "../services/call.service";

const CallContext = createContext<ReturnType<typeof useCall> | null>(null);

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const callParams = useCall();
  
  // Since we use closures in Socket.io event listeners, we need refs for latest state
  const sessionRef = useRef(callParams.session);
  useEffect(() => { sessionRef.current = callParams.session; }, [callParams.session]);
  
  const webrtc = useRef(new WebRTCService());

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Configure WebRTC Callbacks
    webrtc.current.setCallbacks({
      onIceCandidate: (candidate) => {
        const s = sessionRef.current;
        if (s) {
          const targetId = s.callerId === socket.id ? s.receiverId : s.callerId;
          callSignaling.sendWebRTCIceCandidate(s.callId, targetId, candidate);
        }
      },
      onRemoteTrack: (stream) => {
        // We can expose this stream to a global audio element
        const audioEl = document.getElementById("remote-audio") as HTMLAudioElement;
        if (audioEl) {
          audioEl.srcObject = stream;
          audioEl.play().catch(e => console.error("Auto-play prevented", e));
        }
      },
      onConnectionStateChange: (state) => {
        if (state === "connected") {
          callParams.setSession(prev => prev ? { ...prev, status: "CONNECTED", startTime: Date.now() } : null);
        } else if (state === "disconnected" || state === "failed" || state === "closed") {
          callParams.endCall();
        }
      }
    });

    socket.on("call:request", (data) => {
      // Only accept new call if IDLE
      if (!sessionRef.current) {
        callParams.setSession({
          callId: data.callId,
          callerId: data.callerId,
          receiverId: socket.id || "", // Current user is receiver
          status: "RINGING",
          type: "VOICE"
        });
      }
    });

    socket.on("call:accept", async (data) => {
      const s = sessionRef.current;
      if (s && s.callId === data.callId) {
        callParams.setSession(prev => prev ? { ...prev, status: "CONNECTING" } : null);
        await webrtc.current.initialize();
        const offer = await webrtc.current.createOffer();
        callSignaling.sendWebRTCOffer(s.callId, s.receiverId, offer);
      }
    });

    socket.on("call:reject", () => {
      callParams.setSession(null);
      webrtc.current.cleanup();
    });

    socket.on("call:cancel", () => {
      callParams.setSession(null);
      webrtc.current.cleanup();
    });

    socket.on("call:end", () => {
      callParams.setSession(null);
      webrtc.current.cleanup();
    });

    socket.on("webrtc:offer", async (data) => {
      const s = sessionRef.current;
      if (s && s.callId === data.callId) {
        await webrtc.current.initialize();
        const answer = await webrtc.current.handleOfferAndCreateAnswer(data.offer);
        callSignaling.sendWebRTCAnswer(s.callId, s.callerId, answer);
      }
    });

    socket.on("webrtc:answer", async (data) => {
      const s = sessionRef.current;
      if (s && s.callId === data.callId) {
        await webrtc.current.handleAnswer(data.answer);
      }
    });

    socket.on("webrtc:ice-candidate", async (data) => {
      const s = sessionRef.current;
      if (s && s.callId === data.callId) {
        await webrtc.current.handleIceCandidate(data.candidate);
      }
    });

    return () => {
      socket.off("call:request");
      socket.off("call:accept");
      socket.off("call:reject");
      socket.off("call:cancel");
      socket.off("call:end");
      socket.off("webrtc:offer");
      socket.off("webrtc:answer");
      socket.off("webrtc:ice-candidate");
    };
  }, []);

  return (
    <CallContext.Provider value={{
      ...callParams,
      toggleMute: () => {
        const muted = webrtc.current.toggleMute();
        // Trigger re-render by calling something on callParams if needed, 
        // or just rely on the internal state in useCall if we wire it up.
      },
      endCall: () => {
        callParams.endCall();
        webrtc.current.cleanup();
      }
    }}>
      {children}
      {/* Hidden audio element for remote stream playback */}
      <audio id="remote-audio" autoPlay />
    </CallContext.Provider>
  );
};

export const useCallContext = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCallContext must be used within CallProvider");
  return ctx;
};
