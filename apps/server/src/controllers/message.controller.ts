import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { sendMessageSchema, getMessagesQuerySchema } from "../schemas/message.schema.js";
import * as messageService from "../services/message.service.js";
import * as mediaService from "../services/media.service.js";
import * as conversationRepo from "../repositories/conversation.repository.js";
import { getIO } from "../socket/socket-server.js";
import { AppError } from "../utils/errors.js";
import { MessageType } from "@prisma/client";

// POST /api/conversations/:conversationId/messages - Gửi tin nhắn vào phòng
export async function sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user!.userId;
    const { conversationId } = req.params;

    // Vì lấy từ formData nên các giá trị đều là chuỗi
    const body = req.body || {};
    const type = (body.type as MessageType) || "TEXT";  
    
    const content = body.content as string | undefined;
    const replyToId = body.replyToId as string | undefined;
    const file = req.file; // Cục file quý giá đã bị multer tóm gọn
    // QUY TẮC SỐ 1: BẢO MẬT (Không quyền = Không làm gì cả)
    const isMember = await conversationRepo.isMember(conversationId as string, currentUserId);
    if (!isMember) {
      throw new AppError(403, "NOT_CONVERSATION_MEMBER", "Từ chối truy cập");
    }
    if (type === "TEXT" && !content) {
      throw new AppError(400, "BAD_REQUEST", "Tin nhắn chữ không được để trống");
    }
    // QUY TẮC SỐ 2: XỬ LÝ FILE (Đẩy lên Cloudinary)
    let mediaMetadata = {};
    if ((type === "IMAGE" || type === "FILE") && file) {
      // Code xử lý upload sẽ chạy mất khoảng 1-3 giây
      mediaMetadata = await mediaService.uploadMedia(file, type);
    } else if ((type === "IMAGE" || type === "FILE") && !file) {
       throw new AppError(400, "BAD_REQUEST", "Yêu cầu đính kèm file hợp lệ");
    }
    // QUY TẮC SỐ 3: LƯU VÀO DB
    const message = await messageService.sendMessage({
      conversationId: conversationId as string,
      senderId: currentUserId,
      type,
      content,
      replyToId,
      ...mediaMetadata
    });
    // QUY TẮC SỐ 4: BÁO CHO SOCKET ĐỂ NHẢY REALTIME TRÊN MÀN HÌNH MỌI NGƯỜI
    const io = getIO();
    io.to(`conversation:${conversationId}`).emit("message:new", message);
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

// API SỬA (Thêm mới vào)
export async function editMessage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const messageId = req.params.messageId as string;
    const { content } = req.body;

    if (!content || typeof content !== "string" || !content.trim()) {
      throw new AppError(400, "BAD_REQUEST", "Nội dung không được để trống");
    }

    const updatedMessage = await messageService.editMessage({ messageId, userId, newContent: content.trim() });

    // Báo cho mọi người trong phòng biết là tôi vừa sửa tin nhắn!
    const io = getIO();
    io.to(`conversation:${updatedMessage.conversationId}`).emit("message:updated", updatedMessage);

    res.json({ success: true, data: updatedMessage });
  } catch (err) {
    next(err);
  }
}

// API XÓA (Viết lại)
export async function deleteMessage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const messageId = req.params.messageId as string;

    const deletedMessage = await messageService.deleteMessage({ messageId, userId });

    // Báo cho mọi người trong phòng là tin nhắn vừa "bay màu"
    const io = getIO();
    io.to(`conversation:${deletedMessage.conversationId}`).emit("message:deleted", deletedMessage);

    res.json({ success: true, data: deletedMessage });
  } catch (error) {
    next(error);
  }
}
