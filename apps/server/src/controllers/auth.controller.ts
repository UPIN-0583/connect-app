import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
};

// POST /api/auth/register
 
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = registerSchema.parse(req.body);

    const result = await authService.register(validatedData);

    return res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error); // Đẩy lỗi về error.middleware.ts tự xử lý
  }
}

// POST /api/auth/login
 
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = loginSchema.parse(req.body);

    const result = await authService.login(validatedData);

    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

    // Trả về accessToken và user (không cần trả refreshToken trong body vì đã có trong cookie)
    return res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user
      }
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/refresh
 
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    // Lấy refreshToken từ cookie do trình duyệt tự động gửi kèm
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Không tìm thấy refresh token" }
      });
    }

    const result = await authService.refresh(refreshToken);

    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/logout
 
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    // Xóa cookie khỏi trình duyệt
    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "Đăng xuất thành công"
    });
  } catch (error) {
    next(error);
  }
}