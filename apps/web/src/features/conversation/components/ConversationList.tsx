import React from "react";

interface ConversationListProps {
  user: any; // Chứa thông tin Profile truyền từ page.tsx xuống
  onLogout: () => void;
}

export default function ConversationList({ user, onLogout }: ConversationListProps) {
  // Dữ liệu giả (Mock data) để test UI
  const mockConversations = [
    { id: "1", name: "Alice", lastMessage: "Hello there!", time: "10:30 AM", isActive: true },
    { id: "2", name: "Team Kết Nối", lastMessage: "Sếp: Ai code tính năng này?", time: "Hôm qua", isActive: false },
    { id: "3", name: "Bob", lastMessage: "Đi nhậu không?", time: "T2", isActive: false },
  ];

  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full shrink-0">
      {/* Phần Header */}
      <div className="p-4 border-b border-gray-100 font-bold text-xl text-gray-800">
        Đoạn chat
      </div>

      {/* Danh sách Chat */}
      <div className="flex-1 overflow-y-auto">
        {mockConversations.map((conv) => (
          <div 
            key={conv.id} 
            className={`flex items-center gap-3 p-3 cursor-pointer transition ${conv.isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
          >
            {/* Avatar chữ cái đầu */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
              {conv.name.charAt(0)}
            </div>
            {/* Thông tin */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="font-semibold text-gray-900 truncate">{conv.name}</h3>
                <span className="text-xs text-gray-500 shrink-0">{conv.time}</span>
              </div>
              <p className={`text-sm truncate ${conv.isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {conv.lastMessage}
              </p>
            </div>
          </div>
        ))}
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