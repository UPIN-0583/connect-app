import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as messageController from "../controllers/message.controller.js";

const router = Router();

router.use(authMiddleware);

// Xóa mềm tin nhắn theo messageId
router.delete("/:messageId", messageController.deleteMessage);

export default router;