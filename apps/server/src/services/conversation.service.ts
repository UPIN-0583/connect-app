import * as conversationRepo from "../repositories/conversation.repository.js";
import { findUserById } from "../repositories/user.repository.js";
import { AppError } from "../utils/errors.js";

// 1. Tạo hoặc lấy lại cuộc trò chuyện 1-1 giữa 2 người
export async function getOrCreateDirectConversation(currentUserId: string, targetUserId: string) {
  // Rule 1: Không được tự chat với chính mình
  if (currentUserId === targetUserId) {
    throw new AppError(400, "CANNOT_CHAT_WITH_SELF", "Bạn không thể tạo cuộc trò chuyện với chính mình");
  }

  // Rule 2: Kiểm tra người nhận có tồn tại trong hệ thống không
  const targetUser = await findUserById(targetUserId);
  if (!targetUser) {
    throw new AppError(404, "USER_NOT_FOUND", "Người dùng không tồn tại");
  }

  // Rule 3: Kiểm tra đã từng có phòng chat 1-1 giữa 2 người chưa
  const existingConversation = await conversationRepo.findDirectConversation(currentUserId, targetUserId);
  if (existingConversation) {
    return existingConversation; // Trả về phòng cũ nếu đã có
  }

  // Rule 4: Nếu chưa có thì tạo phòng mới
  return conversationRepo.createDirectConversation(currentUserId, targetUserId);
}

// 2. Lấy danh sách các cuộc trò chuyện của User hiện tại
export async function getUserConversations(userId: string) {
  return conversationRepo.findUserConversations(userId);
}

// 3. Lấy chi tiết phòng (kiểm tra quyền thành viên)
export async function getConversationDetail(conversationId: string, userId: string) {
  const conversation = await conversationRepo.findConversationById(conversationId);
  if (!conversation) {
    throw new AppError(404, "CONVERSATION_NOT_FOUND", "Không tìm thấy cuộc trò chuyện");
  }

  // Quyền hạn: Phải là thành viên mới được xem
  const isMember = await conversationRepo.isMember(conversationId, userId);
  if (!isMember) {
    throw new AppError(403, "NOT_CONVERSATION_MEMBER", "Bạn không có quyền truy cập cuộc trò chuyện này");
  }

  return conversation;
}