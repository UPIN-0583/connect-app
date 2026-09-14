import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import { verifyAccessToken } from "../utils/jwt.util.js";


export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    // Lấy header Authorization từ request
    const authHeader = req.headers.authorization;

    // Kiểm tra nếu không có header HOẶC không bắt đầu bằng chữ "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "UNAUTHORIZED", "Vui lòng đăng nhập để tiếp tục");
    }

    // Tách chuỗi để lấy ra token thật
    // Chuỗi có dạng "Bearer abc.xyz...", dùng .split(" ")[1] để lấy phần sau
    const token = authHeader.split(" ")[1];

    // Dùng hàm verifyAccessToken(token) để giải mã
    const payload = verifyAccessToken(token);

    // Gắn thông tin userId vào req.user để các Controller phía sau sử dụng
    req.user = {
      userId: payload.userId
    };

    // Cho phép request đi tiếp vào Controller
    next();
  } catch (error) {
    // Nếu token hết hạn hoặc sai chữ ký, jwt.verify sẽ ném lỗi.
    // Ta biến nó thành lỗi 401 chuẩn của hệ thống:
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, "UNAUTHORIZED", "Token không hợp lệ hoặc đã hết hạn"));
    }
  }
}