import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { createDirectConversationSchema } from "../schemas/conversation.schema.js";
import * as conversationService from "../services/conversation.service.js";

// POST /api/conversations/direct - Tạo hoặc mở phòng chat 1-1
export async function createDirectConversation(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user!.userId;
    const { userId: targetUserId } = createDirectConversationSchema.parse(req.body);

    const conversation = await conversationService.getOrCreateDirectConversation(currentUserId, targetUserId);

    return res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/conversations - Lấy danh sách các cuộc trò chuyện của tôi
export async function getUserConversations(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user!.userId;
    const conversations = await conversationService.getUserConversations(currentUserId);

    return res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/conversations/:conversationId - Xem chi tiết một cuộc trò chuyện
export async function getConversationDetail(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user!.userId;
    const { conversationId } = req.params;

    const conversation = await conversationService.getConversationDetail(conversationId as string, currentUserId);

    return res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
}