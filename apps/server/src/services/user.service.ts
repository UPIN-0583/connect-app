import { findUserById } from "../repositories/user.repository.js";
import { AppError } from "../utils/errors.js";

export async function getProfile(userId: string) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "Không tìm thấy thông tin người dùng");
  }
  
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    status: user.status,
    createdAt: user.createdAt
  }
}