"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMeApi, logoutApi } from "@/features/auth/services/auth.api";

import ConversationList from "@/features/conversation/components/ConversationList";
import ChatWindow from "@/features/chat/components/ChatWindow";

export default function AppPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const profile = await getMeApi(token);
        setUser(profile);
      } catch {
        localStorage.removeItem("accessToken");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      localStorage.removeItem("accessToken");
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 text-gray-600 font-medium">
        Đang tải giao diện...
      </div>
    );
  }

  if (!user) return null;

  return (
    // Container bao phủ toàn màn hình, không cho cuộn ngang dọc
    <div className="h-screen w-screen overflow-hidden flex bg-white font-sans">
      
      {/* Cột trái: Danh sách cuộc trò chuyện */}
      <ConversationList user={user} onLogout={handleLogout} />

      {/* Cột phải: Khung chat hiện tại */}
      <ChatWindow />
      
    </div>
  );
}