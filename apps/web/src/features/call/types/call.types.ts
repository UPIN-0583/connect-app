export type CallStatus = "IDLE" | "CALLING" | "RINGING" | "CONNECTING" | "CONNECTED" | "ENDING";

export interface CallSession {
  callId: string;
  callerId: string;
  receiverId: string;
  status: CallStatus;
  startTime?: number;
  type: "VOICE";
}
