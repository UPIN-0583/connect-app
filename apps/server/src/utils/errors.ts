export type ErrorCode =
  | "EMAIL_ALREADY_EXISTS"
  | "USERNAME_ALREADY_EXISTS"
  | "INVALID_CREDENTIALS"
  | "UNAUTHORIZED"
  | "INVALID_REFRESH_TOKEN"
  | "USER_NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_SERVER_ERROR"
  | "CONVERSATION_NOT_FOUND"       // Không tìm thấy phòng chat
  | "NOT_CONVERSATION_MEMBER"      // Không phải thành viên của phòng (403)
  | "CANNOT_CHAT_WITH_SELF"        // Không thể tự tạo chat với chính mình
  | "MESSAGE_NOT_FOUND"            // Không tìm thấy tin nhắn
  | "MESSAGE_NOT_OWNER"            // Cố tình sửa/xóa tin nhắn của người khác (403)
  | "BAD_REQUEST"                  // Yêu cầu không hợp lệ (ví dụ: trả lời tin nhắn không tồn tại)
  | "FORBIDDEN";                  // Yêu cầu bị từ chối (ví dụ: trả lời tin nhắn khác phòng)

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;

  constructor(statusCode: number, code: ErrorCode, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
