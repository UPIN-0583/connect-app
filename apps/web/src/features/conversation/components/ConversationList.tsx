import React, { useEffect, useState } from "react";
import { getConversationsApi } from "../services/conversation.api";
import { socketService } from "@/lib/socket";

interface ConversationListProps {
  user: any; 
  onLogout: () => void;
  onSelectConversation: (conv: any) => void;
}

export default function ConversationList({ user, onLogout, onSelectConversation }: ConversationListProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set()); 

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getConversationsApi(token)
        .then(data => setConversations(data))
        .catch(err => console.error("Lỗi tải chat:", err));
    }
  }, []);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.on("presence:sync", (data: { userIds: string[] }) => setOnlineUsers(new Set(data.userIds)));
      socket.on("presence:online", (data: { userId: string }) => setOnlineUsers(prev => new Set([...prev, data.userId])));
      socket.on("presence:offline", (data: { userId: string }) => setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      }));
    }
  }, []);

  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-gray-100 font-bold text-xl text-gray-800">
        {"Đoạn chat"}
      </div>

      <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">{"Bạn chưa có cuộc trò chuyện nào."}</div>
        ) : (
           conversations.map((conv) => {
          const otherMember = conv.members?.find((m: any) => m.userId !== user?.id);
          const isOnline = otherMember ? onlineUsers.has(otherMember.userId) : false;
          
          let displayName = conv.name;
          if (!displayName) {
             displayName = conv.type === "DIRECT" 
               ? (otherMember?.user?.displayName || "User")
               : "Nhóm";
          }

          let avatarChar = displayName.charAt(0).toUpperCase();

          return (
            <div 
              key={conv.id} 
              onClick={() => onSelectConversation(conv)} 
              className="flex items-center gap-3 p-3 cursor-pointer transition hover:bg-gray-50 border-b border-gray-50"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                  {avatarChar}
                </div>
                {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {displayName}
                </h3>
                <p className={`text-xs truncate ${isOnline ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                   {isOnline ? "Trực tuyến" : (conv.messages?.[0]?.content || "Ngoại tuyến")}
                </p>
              </div>
            </div>
          );
        })
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center gap-3">
         <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shrink-0">
            {user?.displayName?.charAt(0).toUpperCase() || "U"}
         </div>
         <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-800 truncate">{user?.displayName}</h4>
            <p className="text-xs text-green-600 font-medium">{"Trực tuyến"}</p>
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
