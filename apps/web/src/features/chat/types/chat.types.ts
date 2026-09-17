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
  mediaUrl?: string | null;
  mediaPublicId?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  replyToId?: string | null;
  replyTo?: any;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sender: MessageSender;
}

export interface SendMessageDto {
  content: string;
  mediaUrl?: string | null;
  mediaPublicId?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  replyToId?: string | null;
  replyTo?: any;
  type?: MessageType;
}

export interface GetMessagesResponse {
  messages: Message[];
  nextCursor: string | null;
}
