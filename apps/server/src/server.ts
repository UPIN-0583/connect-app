import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";


import type { User } from "@connect-app/types";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js"; 
import conversationRoutes from "./routes/conversation.routes.js";
import messageRoutes from "./routes/message.routes.js";

import { errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true // Bắt buộc true để trình duyệt gửi/nhận Cookie
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Connect App Backend Server is running" });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// Error Handler BẮT BUỘC đặt ở cuối cùng của file
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

export { app};
