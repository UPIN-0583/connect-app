import { z } from "zod";

export const createDirectConversationSchema = z.object({
  userId: z.uuid("ID người dùng không đúng định dạng UUID")
});

export type CreateDirectConversationInput = z.infer<typeof createDirectConversationSchema>;