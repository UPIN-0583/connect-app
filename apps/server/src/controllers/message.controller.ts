import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { sendMessageSchema, getMessagesQuerySchema } from "../schemas/message.schema.js";
import * as messageService from "../services/message.service.js";

// POST /api/conversations/:conversationId/messages - Gửi tin nhắn vào phòng
export async function sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user!.userId;
    const { conversationId } = req.params;
    const { content, type } = sendMessageSchema.parse(req.body);

    const message = await messageService.sendMessage({
      conversationId: conversationId as string,
      senderId: currentUserId,
      content,
      type
    });

    return res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/conversations/:conversationId/messages - Đọc tin nhắn (Cursor-based)
export async function getMessages(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user!.userId;
    const { conversationId } = req.params;
    const { cursor, limit } = getMessagesQuerySchema.parse(req.query);

    const result = await messageService.getMessages({
      conversationId: conversationId as string,
      userId: currentUserId,
      cursor,
      limit
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/messages/:messageId - Xóa mềm tin nhắn
export async function deleteMessage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user!.userId;
    const { messageId } = req.params;

    const deleted = await messageService.deleteMessage({
      messageId: messageId as string,
      userId: currentUserId
    });

    return res.status(200).json({
      success: true,
      message: "Tin nhắn đã được xóa",
      data: deleted
    });
  } catch (error) {
    next(error);
  }
}