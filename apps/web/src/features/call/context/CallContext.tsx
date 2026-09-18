import React, { createContext, useContext, useEffect } from "react";
import { useCall } from "../hooks/useCall";
import { socketService } from "@/lib/socket";
import * as callSignaling from "../services/call.service";
import { getMicrophoneErrorMsg } from "@/lib/webrtc";

const CallContext = createContext<ReturnType<typeof useCall> | null>(null);

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const callParams = useCall();
  const { sessionRef, updateSession, cleanupCall, webrtc, endCall } = callParams;

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
        const audioEl = document.getElementById("remote-audio") as HTMLAudioElement;
        if (audioEl) {
          audioEl.srcObject = stream;
          audioEl.play().catch(e => console.error("Auto-play prevented", e));
        }
      },
      onConnectionStateChange: (state) => {
        const s = sessionRef.current;
        if (state === "connected" && s) {
          updateSession({ ...s, status: "CONNECTED", startTime: Date.now() });
        } else if (state === "disconnected" || state === "failed" || state === "closed") {
          endCall();
        }
      }
    });

    socket.on("call:request", (data) => {
      if (!sessionRef.current) {
        updateSession({
          callId: data.callId,
          callerId: data.callerId,
          receiverId: socket.id || "", 
          status: "RINGING",
          type: "VOICE"
        });
      }
    });

    socket.on("call:accept", async (data) => {
      const s = sessionRef.current;
      if (s && s.callId === data.callId) {
        // We are the caller, receiver just accepted
        // Caller's mic is ALREADY initialized during startCall!
        updateSession({ ...s, status: "CONNECTING" });
        try {
          const offer = await webrtc.current.createOffer();
          callSignaling.sendWebRTCOffer(s.callId, s.receiverId, offer);
        } catch (err) {
          alert("Loi tao ket noi Webrtc.");
          endCall();
        }
      }
    });

    socket.on("call:reject", () => {
      cleanupCall();
    });

    socket.on("call:cancel", () => {
      cleanupCall();
    });

    socket.on("call:end", () => {
      cleanupCall();
    });

    socket.on("webrtc:offer", async (data) => {
      const s = sessionRef.current;
      if (s && s.callId === data.callId) {
        try {
          // Receiver's mic is ALREADY initialized during acceptCall!
          const answer = await webrtc.current.handleOfferAndCreateAnswer(data.offer);
          callSignaling.sendWebRTCAnswer(s.callId, s.callerId, answer);
        } catch(err) {
          alert("Loi xu ly ket noi Webrtc.");
          endCall();
        }
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
  }, []); // Only runs once on mount

  return (
    <CallContext.Provider value={callParams}>
      {children}
      <audio id="remote-audio" autoPlay />
    </CallContext.Provider>
  );
};

export const useCallContext = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCallContext must be used within CallProvider");
  return ctx;
};