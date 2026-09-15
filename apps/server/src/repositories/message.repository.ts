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
  content: string;
  type?: MessageType;
}) {
  return prisma.message.create({
    data: {
      conversationId: data.conversationId,
      senderId: data.senderId,
      content: data.content,
      type: data.type ?? "TEXT"
    },
    include: {
      sender: { select: senderSelect }
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
      sender: { select: senderSelect }
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
    data: {
      deletedAt: new Date()
    }
  });
}