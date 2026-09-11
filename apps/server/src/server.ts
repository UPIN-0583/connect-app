import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import type { User } from "@connect-app/types";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Connect App Backend Server is running" });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/users", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch {
    const mockUsers: User[] = [
      {
        id: "1",
        username: "demouser",
        displayName: "Demo User",
        email: "demo@connectapp.com",
        createdAt: new Date().toISOString()
      }
    ];
    res.json(mockUsers);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

export { app, prisma };
