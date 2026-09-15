import { z } from "zod";

// Schema validate body khi gửi tin nhắn
export const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Nội dung tin nhắn không được để trống")
    .max(5000, "Nội dung tin nhắn tối đa 5000 ký tự"),
  
  type: z
    .enum(["TEXT", "IMAGE", "FILE", "AUDIO", "SYSTEM"])
    .default("TEXT")
});

// Schema validate query params khi lấy danh sách tin nhắn: ?cursor=...&limit=30
export const getMessagesQuerySchema = z.object({
  cursor: z.uuid("Cursor phải là định dạng UUID hợp lệ").optional(),
  limit: z.coerce
    .number()
    .int("Limit phải là số nguyên")
    .min(1, "Limit tối thiểu là 1")
    .max(100, "Limit tối đa là 100")
    .default(30)
});

// Export Type tương ứng
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetMessagesQueryInput = z.infer<typeof getMessagesQuerySchema>;