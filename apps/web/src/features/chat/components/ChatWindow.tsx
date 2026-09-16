import React from "react";

export default function ChatWindow() {
  // Dữ liệu giả định tin nhắn
  const mockMessages = [
    { id: "1", text: "Chào bạn, khoẻ không?", isMine: false, time: "10:28 AM" },
    { id: "2", text: "Mình khoẻ, bạn đang làm gì đấy?", isMine: true, time: "10:29 AM" },
    { id: "3", text: "Mình đang học code giao diện Chat nè haha", isMine: false, time: "10:30 AM" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full min-w-0">
      {/* Header khung chat */}
      <div className="h-[73px] px-6 border-b border-gray-200 bg-white flex items-center shadow-sm shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0 mr-3">
          A
        </div>
        <h2 className="text-lg font-bold text-gray-800">Alice</h2>
      </div>

      {/* Khu vực chứa tin nhắn */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {mockMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.isMine 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className={`text-[10px] mt-1 text-right ${msg.isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Khu vực nhập Text */}
      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <input 
            type="text" 
            placeholder="Nhập tin nhắn..." 
            className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-full px-4 py-2.5 text-sm outline-none transition"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2.5 transition flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    </div>
  );
}