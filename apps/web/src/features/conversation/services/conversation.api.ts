import { fetchWithAuth } from "@/lib/api";
import type { Conversation, CreateDirectConversationDto } from "../types/conversation.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// 1. Lấy danh sách các cuộc trò chuyện
export async function getConversationsApi(accessToken: string): Promise<Conversation[]> {
  const res = await fetch(`${API_URL}/conversations`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || "Không thể lấy danh sách cuộc trò chuyện");
  }
  return json.data;
}

// 2. Tạo hoặc mở phòng chat 1-1 với người dùng khác
export async function createDirectConversationApi(
  accessToken: string,
  data: CreateDirectConversationDto
): Promise<Conversation> {
  const res = await fetch(`${API_URL}/conversations/direct`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || "Không thể tạo cuộc trò chuyện");
  }
  return json.data;
}

// 3. Lấy chi tiết thông tin một phòng chat
export async function getConversationDetailApi(
  accessToken: string,
  conversationId: string
): Promise<Conversation> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || "Không thể lấy chi tiết cuộc trò chuyện");
  }
  return json.data;
}