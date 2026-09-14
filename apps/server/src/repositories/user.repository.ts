import { prisma } from "../lib/prisma.js";
import type { User } from "@prisma/client";


export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}


export async function findUserByUsername(username: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { username } });
}

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}


export async function createUser(data: {
  email: string;
  username: string;
  passwordHash: string;
  displayName: string;
}): Promise<User> {
  return prisma.user.create({data})
}