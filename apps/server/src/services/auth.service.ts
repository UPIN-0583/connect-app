import { AppError } from "../utils/errors.js";
import { hashPassword, verifyPassword } from "../utils/password.util.js";
import { 
  generateAccessToken, 
  generateRefreshToken, 
  hashToken, 
  verifyRefreshToken 
} from "../utils/jwt.util.js";
import { 
  findUserByEmail, 
  findUserByUsername, 
  createUser 
} from "../repositories/user.repository.js";
import { 
            createRefreshToken,
            findRefreshTokenByHash,
            revokeRefreshToken 
         } from "../repositories/refresh-token.repository.js";
import type { RegisterInput, LoginInput } from "../schemas/auth.schema.js";


export async function register(input: RegisterInput) {
  const existingEmail = await findUserByEmail(input.email);
  if (existingEmail) {
    throw new AppError(400, "EMAIL_ALREADY_EXISTS", "Email này đã được sử dụng");
  }

  const username = await findUserByUsername(input.username);
  if(username){
    throw new AppError(400,"USERNAME_ALREADY_EXISTS", "Tên đăng nhập này đã tồn tại");
  } 

  const passwordHash = await hashPassword(input.password);

  const newUser = await createUser({
    email: input.email,
    username: input.username,
    displayName: input.displayName,
    passwordHash: passwordHash
  });

  return {
    id: newUser.id,
    email: newUser.email,
    username: newUser.username,
    displayName: newUser.displayName,
    createdAt: newUser.createdAt
  };
}


export async function login(input: LoginInput) {
  const user = await findUserByEmail(input.email);
  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Email hoặc mật khẩu không chính xác");
  }

  const isPasswordValid = await verifyPassword(user.passwordHash, input.password);
  if(!isPasswordValid){
    throw new AppError(401,"INVALID_CREDENTIALS", "Email hoặc mật khẩu không chính xác");
  }

  const accessToken = generateAccessToken({ userId: user.id });
  const refreshToken = generateRefreshToken({ userId: user.id });

  const tokenHash = hashToken(refreshToken);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày sau
  await createRefreshToken({
    userId: user.id,
    tokenHash,
    expiresAt
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName
    }
  };
}


export async function refresh(rawRefreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token không hợp lệ hoặc đã hết hạn");
  }
  // Băm rawRefreshToken bằng hashToken để tìm trong Database
  const tokenHash = hashToken(rawRefreshToken);
  const tokenRecord = await findRefreshTokenByHash(tokenHash);

  // Kiểm tra 3 điều kiện:
  // - Có tìm thấy tokenRecord trong DB không? (!tokenRecord)
  // - Token đã bị thu hồi chưa? (tokenRecord.revokedAt !== null)
  // - Token đã hết hạn chưa? (tokenRecord.expiresAt < new Date())
  if (!tokenRecord || tokenRecord.revokedAt !== null || tokenRecord.expiresAt < new Date()) {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token không hợp lệ hoặc đã bị thu hồi");
  }
  // Kỹ thuật Token Rotation (Cực kỳ bảo mật)
  // 1. Thu hồi token cũ
  await revokeRefreshToken(tokenRecord.id);
  
  // 2. Tạo cặp token MỚI TINH
  const newAccessToken = generateAccessToken({ userId: tokenRecord.userId });
  const newRefreshToken = generateRefreshToken({ userId: tokenRecord.userId });
  
  // 3. Lưu token mới vào Database (hạn 7 ngày)
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await createRefreshToken({
    userId: tokenRecord.userId,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: newExpiresAt
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
}

export async function logout(rawRefreshToken: string) {
  const tokenHash = hashToken(rawRefreshToken);
  const tokenRecord = await findRefreshTokenByHash(tokenHash);
  // Nếu tìm thấy và chưa bị thu hồi thì tiến hành thu hồi nó
  if (tokenRecord && tokenRecord.revokedAt === null) {
    await revokeRefreshToken(tokenRecord.id);
  }
  return { success: true };
}