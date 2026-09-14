import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as userController from "../controllers/user.controller.js";

const router = Router();

// Endpoint được bảo vệ: Bắt buộc phải đi qua authMiddleware trước
router.get("/me", authMiddleware, userController.getMe);

export default router;