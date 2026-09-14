export type ErrorCode =
  | "EMAIL_ALREADY_EXISTS"
  | "USERNAME_ALREADY_EXISTS"
  | "INVALID_CREDENTIALS"
  | "UNAUTHORIZED"
  | "INVALID_REFRESH_TOKEN"
  | "USER_NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;

  constructor(statusCode: number, code: ErrorCode, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
