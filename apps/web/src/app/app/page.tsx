"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMeApi, logoutApi } from "@/features/auth/services/auth.api";
import { socketService } from "@/lib/socket";

import ConversationList from "@/features/conversation/components/ConversationList";
import ChatWindow from "@/features/chat/components/ChatWindow";
import { CallProvider } from "@/features/call/context/CallContext";
import { CallOverlay } from "@/features/call/components/CallOverlay";

export default function AppPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<any>(null);

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
        socketService.connect(token);
      } catch {
        localStorage.removeItem("accessToken");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();

    return () => {
      socketService.disconnect();
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      localStorage.removeItem("accessToken");
      socketService.disconnect();
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
    <CallProvider>
      <div className="h-screen w-screen overflow-hidden flex bg-white font-sans">
        <ConversationList user={user} onLogout={handleLogout} onSelectConversation={(conv) => setActiveConversation(conv)} />
        <ChatWindow conversation={activeConversation} user={user} />
      </div>
      <CallOverlay />
    </CallProvider>
  );
}
