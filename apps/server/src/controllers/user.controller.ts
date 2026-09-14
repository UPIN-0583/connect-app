import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import * as userService from "../services/user.service.js";

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Lấy userId từ req.user đã được authMiddleware giải mã
    const userId = req.user!.userId;

    // Gọi service
    const userProfile = await userService.getProfile(userId);

    return res.status(200).json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    next(error);
  }
}