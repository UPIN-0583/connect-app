import { prisma } from "../lib/prisma.js";
import type { RefreshToken } from "@prisma/client";

export async function createRefreshToken(data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<RefreshToken> {
  return prisma.refreshToken.create({ data });
}

export async function findRefreshTokenByHash(tokenHash: string) {
  return prisma.refreshToken.findFirst({
    where: { tokenHash },
    include: { user: true }
  });
}

export async function revokeRefreshToken(id: string): Promise<RefreshToken> {
  return prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date() }
  });
}