import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as messageController from "../controllers/message.controller.js";

const router = Router({ mergeParams: true });

const upload = multer({ storage: multer.memoryStorage() });
router.use(authMiddleware);

router.post(
  "/",
  upload.single("file"),
  messageController.sendMessage
);

// Sửa tin nhắn
router.put("/:messageId", messageController.editMessage);

router.delete("/:messageId", messageController.deleteMessage);

export default router;
