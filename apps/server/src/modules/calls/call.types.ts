export type CallType = "VOICE";

export interface CallRequestPayload {
  callId: string;
  conversationId: string;
  receiverId: string;
  type: CallType;
}
