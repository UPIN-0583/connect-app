import { prisma } from "../lib/prisma.js";

// Thông tin user tối giản trả kèm trong các quan hệ thành viên
const userSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  status: true
};

// 1. Tìm cuộc trò chuyện trực tiếp 1-1 giữa 2 người
export async function findDirectConversation(userAId: string, userBId: string) {
  return prisma.conversation.findFirst({
    where: {
      type: "DIRECT",
      AND: [
        { members: { some: { userId: userAId } } },
        { members: { some: { userId: userBId } } }
      ]
    },
    include: {
      members: {
        include: { user: { select: userSelect } }
      }
    }
  });
}

// 2. Tạo cuộc trò chuyện trực tiếp 1-1 mới
export async function createDirectConversation(userAId: string, userBId: string) {
  return prisma.conversation.create({
    data: {
      type: "DIRECT",
      createdBy: userAId,
      members: {
        create: [
          { userId: userAId, role: "MEMBER" },
          { userId: userBId, role: "MEMBER" }
        ]
      }
    },
    include: {
      members: {
        include: { user: { select: userSelect } }
      }
    }
  });
}

// 3. Lấy danh sách cuộc trò chuyện của một User
export async function findUserConversations(userId: string) {
  return prisma.conversation.findMany({
    where: {
      members: {
        some: { userId }
      }
    },
    include: {
      members: {
        include: { user: { select: userSelect } }
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1 // Lấy tin nhắn mới nhất để hiển thị preview tin nhắn cuối
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });
}

// 4. Tìm phòng theo ID
export async function findConversationById(id: string) {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: userSelect } }
      }
    }
  });
}

// 5. Kiểm tra một User có phải thành viên của phòng không
export async function isMember(conversationId: string, userId: string): Promise<boolean> {
  const member = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId
      }
    }
  });
  return !!member;
}

// 6. Cập nhật thời gian updatedAt của phòng khi có tin nhắn mới
export async function updateConversationTimestamp(id: string) {
  return prisma.conversation.update({
    where: { id },
    data: { updatedAt: new Date() }
  });
}

// Cập nhật ID tin nhắn cuối cùng mà user đã đọc
export async function updateLastReadMessage(conversationId: string, userId: string, messageId: string) {
  return prisma.conversationMember.update({
    where: {
      // Khóa đôi (Composite key) được Prisma tự tạo dựa trên @@unique
      conversationId_userId: { 
        conversationId,
        userId
      }
    },
    data: {
      lastReadMessageId: messageId
    }
  });
}