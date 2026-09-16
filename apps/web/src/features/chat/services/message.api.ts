import type { Message, SendMessageDto, GetMessagesResponse } from "../types/chat.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// 1. Lấy danh sách tin nhắn theo phân trang Cursor
export async function getMessagesApi(
  accessToken: string,
  conversationId: string,
  cursor?: string,
  limit: number = 30
): Promise<GetMessagesResponse> {
  const query = new URLSearchParams({ limit: limit.toString() });
  if (cursor) {
    query.set("cursor", cursor);
  }

  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages?${query.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || "Không thể lấy danh sách tin nhắn");
  }
  return json.data;
}

// 2. Gửi tin nhắn mới
export async function sendMessageApi(
  accessToken: string,
  conversationId: string,
  data: SendMessageDto
): Promise<Message> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || "Không thể gửi tin nhắn");
  }
  return json.data;
}

// 3. Xóa mềm tin nhắn
export async function deleteMessageApi(
  accessToken: string,
  messageId: string
): Promise<Message> {
  const res = await fetch(`${API_URL}/messages/${messageId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || "Không thể xóa tin nhắn");
  }
  return json.data;
}