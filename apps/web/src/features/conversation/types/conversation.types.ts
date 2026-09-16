export type ConversationType = "DIRECT" | "GROUP";
export type MemberRole = "MEMBER" | "ADMIN";

export interface ConversationMemberUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  status: "ONLINE" | "OFFLINE" | "AWAY";
}

export interface ConversationMember {
  id: string;
  conversationId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  lastReadMessageId: string | null;
  user: ConversationMemberUser;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  avatarUrl: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  members: ConversationMember[];
  messages?: any[]; // Tin nhắn mới nhất (preview)
}

export interface CreateDirectConversationDto {
  userId: string;
}