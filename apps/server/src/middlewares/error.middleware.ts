import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  console.error("❌ Unexpected Error:", err);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
    },
  });
}
