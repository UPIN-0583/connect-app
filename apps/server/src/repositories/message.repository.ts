import { prisma } from "../lib/prisma.js";
import type { MessageType } from "@prisma/client";

const senderSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true
};


// 1. Tạo tin nhắn mới
export async function createMessage(data: {
  conversationId: string;
  senderId: string;
  type?: MessageType;
  content?: string | null;
  mediaUrl?: string | null;
  mediaPublicId?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  replyToId?: string | null;
}) {
  return prisma.message.create({
    data: {
      conversationId: data.conversationId,
      senderId: data.senderId,
      type: data.type ?? "TEXT",
      content: data.content,
      mediaUrl: data.mediaUrl,
      mediaPublicId: data.mediaPublicId,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      replyToId: data.replyToId
    },
    include: {
      sender: {
        select: { id: true, username: true, displayName: true, avatarUrl: true }
      },
      replyTo: {
        select: { 
          id: true, 
          content: true, 
          type: true, 
          fileName: true, 
          sender: { select: { displayName: true } }
        }
      }
    }
  });
}
// 2. Lấy danh sách tin nhắn theo phòng (Cursor-based pagination)
export async function getMessagesByConversation(params: {
  conversationId: string;
  cursor?: string;
  limit: number;
}) {
  const { conversationId, cursor, limit } = params;

  return prisma.message.findMany({
    where: { conversationId },
    take: limit,
    skip: cursor ? 1 : 0, // Bỏ qua mốc cursor hiện tại
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: senderSelect },
      replyTo: {
        select: { 
          id: true, 
          content: true, 
          type: true, 
          fileName: true, 
          sender: { select: { displayName: true } }
        }
      }
    }
  });
}

// 3. Tìm tin nhắn theo ID
export async function findMessageById(id: string) {
  return prisma.message.findUnique({
    where: { id }
  });
}

// 4. Xóa mềm tin nhắn
export async function softDeleteMessage(id: string) {
  return prisma.message.update({
    where: { id },
    data: { deletedAt: new Date() },
    include: {
      sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
    }
  });
}

// 5. Sửa nội dung tin nhắn
export async function updateMessageContent(id: string, newContent: string) {
  return prisma.message.update({
    where: { id },
    data: { content: newContent },
    include: {
      sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
    }
  });
}