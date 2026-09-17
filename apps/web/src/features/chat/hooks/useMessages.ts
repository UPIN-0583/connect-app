"use client";

import { useState, useEffect, useCallback } from "react";
import { getMessagesApi, sendMessageApi, deleteMessageApi } from "../services/message.api";
import type { Message, SendMessageDto } from "../types/chat.types";

export function useMessages(conversationId: string | null, accessToken: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Tải danh sách tin nhắn ban đầu
  const fetchMessages = useCallback(async () => {
    if (!conversationId || !accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMessagesApi(accessToken, conversationId);
      setMessages(data.messages);
      setNextCursor(data.nextCursor);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tải tin nhắn");
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, accessToken]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Hàm gửi tin nhắn (lạc quan cập nhật vào state giao diện)
  const sendMessage = async (formData: FormData) => {
    if (!conversationId || !accessToken) return;
    const newMessage = await sendMessageApi(accessToken, conversationId, formData);
    setMessages((prev) => [newMessage, ...prev]);
    return newMessage;
  };

  // Hàm xóa tin nhắn
  const deleteMessage = async (messageId: string) => {
    if (!accessToken) return;
    await deleteMessageApi(accessToken, messageId);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, deletedAt: new Date().toISOString() } : msg
      )
    );
  };

  return {
    messages,
    nextCursor,
    isLoading,
    error,
    sendMessage,
    deleteMessage,
    refreshMessages: fetchMessages
  };
}
