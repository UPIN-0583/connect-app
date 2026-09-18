import { fetchWithAuth, xhrWithAuth } from "@/lib/api";
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

  const res = await fetchWithAuth(`${API_URL}/conversations/${conversationId}/messages?${query.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || "Không thể lấy danh sách tin nhắn");
  }
  return json.data;
}

// 2. Gửi tin nhắn mới thay thế hàm fetch bằng XMLHttpRequest. 
// Lý do là thằng fetch của JavaScript không hỗ trợ đo lường số Bytes đang tải lên. 
// Chỉ có XHR mới có cái vòi onprogress để chúng ta bắt được chuẩn xác số % file đang đẩy lên Cloudinary!
export function sendMessageApi(
  accessToken: string,
  conversationId: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<any> {
  return xhrWithAuth(`${API_URL}/conversations/${conversationId}/messages`, formData, onProgress);
}

export async function deleteMessageApi(
  accessToken: string,
  messageId: string
): Promise<Message> {
  const res = await fetchWithAuth(`${API_URL}/messages/${messageId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || "Không thể xóa tin nhắn");
  }
  return json.data;
}
export async function editMessageApi(accessToken: string, messageId: string, content: string): Promise<Message> {
  const res = await fetchWithAuth(`${API_URL}/messages/${messageId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Không thể sửa tin nhắn');
  return json.data;
}
