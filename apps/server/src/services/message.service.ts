import * as messageRepo from "../repositories/message.repository.js";
import * as conversationRepo from "../repositories/conversation.repository.js";
import { AppError } from "../utils/errors.js";
import type { MessageType } from "@prisma/client";

// 1. Gửi tin nhắn mới
export async function sendMessage(params: {
  conversationId: string;
  senderId: string;
  content: string;
  type?: MessageType;
}) {
  const { conversationId, senderId, content, type } = params;

  // Rule 1: Kiểm tra phòng có tồn tại không
  const conversation = await conversationRepo.findConversationById(conversationId);
  if (!conversation) {
    throw new AppError(404, "CONVERSATION_NOT_FOUND", "Không tìm thấy cuộc trò chuyện");
  }

  // Rule 2: Kiểm tra người gửi có thuộc phòng chat này không
  const isMember = await conversationRepo.isMember(conversationId, senderId);
  if (!isMember) {
    throw new AppError(403, "NOT_CONVERSATION_MEMBER", "Bạn không có quyền gửi tin nhắn vào cuộc trò chuyện này");
  }

  // Tạo tin nhắn
  const message = await messageRepo.createMessage({
    conversationId,
    senderId,
    content,
    type
  });

  // Cập nhật updatedAt của phòng để phòng chat nhảy lên đầu danh sách
  await conversationRepo.updateConversationTimestamp(conversationId);

  return message;
}

// 2. Lấy danh sách tin nhắn theo phân trang Cursor
export async function getMessages(params: {
  conversationId: string;
  userId: string;
  cursor?: string;
  limit: number;
}) {
  const { conversationId, userId, cursor, limit } = params;

  // Rule 1: Kiểm tra phòng có tồn tại không
  const conversation = await conversationRepo.findConversationById(conversationId);
  if (!conversation) {
    throw new AppError(404, "CONVERSATION_NOT_FOUND", "Không tìm thấy cuộc trò chuyện");
  }

  // Rule 2: Kiểm tra quyền xem tin nhắn
  const isMember = await conversationRepo.isMember(conversationId, userId);
  if (!isMember) {
    throw new AppError(403, "NOT_CONVERSATION_MEMBER", "Bạn không có quyền xem tin nhắn của cuộc trò chuyện này");
  }

  // Lấy tin nhắn từ DB
  const messages = await messageRepo.getMessagesByConversation({
    conversationId,
    cursor,
    limit
  });

  // Xác định nextCursor cho trang tiếp theo
  const nextCursor = messages.length === limit ? messages[messages.length - 1]?.id : null;

  return {
    messages,
    nextCursor
  };
}

// 3. Xóa mềm tin nhắn
export async function deleteMessage(params: { messageId: string; userId: string }) {
  const { messageId, userId } = params;

  // Rule 1: Tìm tin nhắn
  const message = await messageRepo.findMessageById(messageId);
  if (!message) {
    throw new AppError(404, "MESSAGE_NOT_FOUND", "Không tìm thấy tin nhắn");
  }

  // Rule 2: Kiểm tra chính chủ - chỉ người gửi mới được xóa tin nhắn của mình
  if (message.senderId !== userId) {
    throw new AppError(403, "MESSAGE_NOT_OWNER", "Bạn không có quyền xóa tin nhắn này");
  }

  return messageRepo.softDeleteMessage(messageId);
}