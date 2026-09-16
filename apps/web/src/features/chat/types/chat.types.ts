export type MessageType = "TEXT" | "IMAGE" | "FILE" | "AUDIO" | "SYSTEM";

export interface MessageSender {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sender: MessageSender;
}

export interface SendMessageDto {
  content: string;
  type?: MessageType;
}

export interface GetMessagesResponse {
  messages: Message[];
  nextCursor: string | null;
}