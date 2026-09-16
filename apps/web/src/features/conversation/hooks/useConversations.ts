"use client";

import { useState, useEffect, useCallback } from "react";
import { getConversationsApi } from "../services/conversation.api";
import type { Conversation } from "../types/conversation.types";

export function useConversations(accessToken: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getConversationsApi(accessToken);
      setConversations(data);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tải danh sách cuộc trò chuyện");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    refreshConversations: fetchConversations
  };
}