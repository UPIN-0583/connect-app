import React, { useEffect, useState } from "react";
import { getConversationsApi } from "../services/conversation.api";

interface ConversationListProps {
  user: any; 
  onLogout: () => void;
  onSelectConversation: (id: string) => void;
}

export default function ConversationList({ user, onLogout, onSelectConversation }: ConversationListProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  useEffect(() => {
    // Khi load giao diện, lấy danh sách chat thật từ Database!
    const token = localStorage.getItem("accessToken");
    if (token) {
      getConversationsApi(token)
        .then(data => setConversations(data))
        .catch(err => console.error("Lỗi tải chat:", err));
    }
  }, []);

  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full shrink-0">
      {/* Phần Header */}
      <div className="p-4 border-b border-gray-100 font-bold text-xl text-gray-800">
        Đoạn chat
      </div>

      {/* Danh sách Chat */}
      <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">Bạn chưa có cuộc trò chuyện nào.</div>
        ) : (
          conversations.map((conv) => (
            <div 
              key={conv.id} 
              // THÊM DÒNG NÀY VÀO ĐỂ BẤM ĐƯỢC NHÉ:
              onClick={() => onSelectConversation(conv.id)} 
              className="flex items-center gap-3 p-3 cursor-pointer transition hover:bg-gray-50 border-b border-gray-50"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                {conv.name ? conv.name.charAt(0) : (conv.type === "DIRECT" ? "1" : "G")}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {conv.name ? conv.name : (conv.type === "DIRECT" ? "Chat 1-1" : "Nhóm")}
                </h3>
                <p className="text-xs truncate text-gray-400">ID: {conv.id.substring(0,8)}...</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Phần Footer: Profile & Đăng xuất */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center gap-3">
         <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shrink-0">
            {user?.displayName?.charAt(0).toUpperCase() || "U"}
         </div>
         <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-800 truncate">{user?.displayName}</h4>
            <p className="text-xs text-green-600 font-medium">Trực tuyến</p>
         </div>
         <button 
           onClick={onLogout}
           className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
           title="Đăng xuất"
         >
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
         </button>
      </div>
    </div>
  );
}