import { Router } from "express"; 
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as conversationController from "../controllers/conversation.controller.js";
import * as messageController from "../controllers/message.controller.js";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Tất cả các route bên dưới đều bắt buộc đăng nhập
router.use(authMiddleware);

// Quản lý Conversation
router.post("/direct", conversationController.createDirectConversation);
router.get("/", conversationController.getUserConversations);
router.get("/:conversationId", conversationController.getConversationDetail);

// Tin nhắn trong Conversation
router.post(
  "/:conversationId/messages", 
  upload.single("file"), 
  messageController.sendMessage
);
router.get("/:conversationId/messages", messageController.getMessages);

export default router;