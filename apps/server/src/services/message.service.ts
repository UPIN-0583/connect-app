import * as messageRepo from "../repositories/message.repository.js";
import * as conversationRepo from "../repositories/conversation.repository.js";
import { AppError } from "../utils/errors.js";
import type { MessageType } from "@prisma/client";
import * as mediaService from "../services/media.service.js";

// 1. Gửi tin nhắn mới
export async function sendMessage(params: {
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

  // RULE 3: NẾU LÀ TIN NHẮN TRẢ LỜI -> KIỂM TRA TIN NHẮN GỐC
  if (params.replyToId) {
    const parentMessage = await messageRepo.findMessageById(params.replyToId);
    if (!parentMessage) {
      throw new AppError(404, "MESSAGE_NOT_FOUND", "Tin nhắn gốc không tồn tại");
    }
    if (parentMessage.conversationId !== conversationId) {
      throw new AppError(403, "FORBIDDEN", "Không thể trả lời tin nhắn của phòng chat khác");
    }
  }

  // Tạo tin nhắn
  const message = await messageRepo.createMessage({ ...params });

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

// Hàm SỬA TIN NHẮN
export async function editMessage(params: { messageId: string; userId: string; newContent: string }) {
  const { messageId, userId, newContent } = params;

  const message = await messageRepo.findMessageById(messageId);
  if (!message) throw new AppError(404, "MESSAGE_NOT_FOUND", "Không tìm thấy tin nhắn");
  if (message.senderId !== userId) throw new AppError(403, "FORBIDDEN", "Không có quyền sửa tin nhắn này");
  if (message.deletedAt) throw new AppError(400, "BAD_REQUEST", "Không thể sửa tin nhắn đã xóa");
  if (message.type !== "TEXT") throw new AppError(400, "BAD_REQUEST", "Chỉ được phép sửa tin nhắn chữ");

  return messageRepo.updateMessageContent(messageId, newContent);
}

// Hàm XÓA TIN NHẮN
export async function deleteMessage(params: { messageId: string; userId: string }) {
  const { messageId, userId } = params;

  const message = await messageRepo.findMessageById(messageId);
  if (!message) throw new AppError(404, "MESSAGE_NOT_FOUND", "Không tìm thấy tin nhắn");
  if (message.senderId !== userId) throw new AppError(403, "FORBIDDEN", "Bạn không có quyền xóa tin nhắn này");
  if (message.deletedAt) throw new AppError(400, "BAD_REQUEST", "Tin nhắn đã bị xóa từ trước");

  // XÓA FILE TRÊN CLOUDINARY ĐỂ DỌN RÁC
  if (message.mediaPublicId) {
    await mediaService.deleteMedia(message.mediaPublicId, message.type === "IMAGE");
  }

  return messageRepo.softDeleteMessage(messageId);
}