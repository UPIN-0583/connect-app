import React, { useState, useEffect, useRef } from "react";
import { socketService } from "@/lib/socket";
import { getMessagesApi } from "../services/message.api";

interface ChatWindowProps {
  conversationId: string | null;
  user: any;
}

export default function ChatWindow({ conversationId, user }: ChatWindowProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null); // Dùng để cuộn xuống cuối màn hình

  // [A] CHẠY MỖI KHI BẠN BẤM VÀO 1 ĐOẠN CHAT MỚI
  useEffect(() => {
    if (!conversationId) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // 1. Tải tin nhắn cũ (REST API)
    getMessagesApi(token, conversationId)
      .then((res) => {
        if (res && res.messages) {
          setMessages(res.messages.reverse());
        }
      })
      .catch(err => console.error("Lỗi tải tin nhắn cũ:", err));

    // 2. Tham gia phòng Socket & Lắng nghe tin nhắn mới
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit("conversation:join", { conversationId });

      const handleNewMessage = (msg: any) => {
        // Nếu tin nhắn mới đúng là của phòng đang mở thì hiển thị
        if (msg.conversationId === conversationId) {
          setMessages((prev) => [...prev, msg]);
        }
      };

      socket.on("message:new", handleNewMessage);

      // Cleanup khi người dùng chuyển phòng khác
      return () => {
        socket.off("message:new", handleNewMessage);
      };
    }
  }, [conversationId]);

  // [B] Cứ có tin nhắn mới là tự động cuộn xuống cuối cùng
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // [C] HÀM GỬI TIN NHẮN (SOCKET)
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn trình duyệt load lại trang khi gõ Enter
    if (!inputValue.trim() || !conversationId) return;

    const socket = socketService.getSocket();
    if (socket) {
      socket.emit("message:send", {
        conversationId,
        content: inputValue.trim(),
      });
      setInputValue(""); // Gửi xong xoá trắng ô nhập
    }
  };

  // NẾU CHƯA CHỌN PHÒNG CHAT
  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-full min-w-0">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-3xl">💬</div>
        <p className="text-gray-500 font-medium">Hãy chọn một đoạn chat bên trái để bắt đầu</p>
      </div>
    );
  }

  // NẾU ĐÃ CHỌN
  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full min-w-0">
      {/* Header */}
      <div className="h-[73px] px-6 border-b border-gray-200 bg-white flex items-center shadow-sm shrink-0">
        <h2 className="text-lg font-bold text-gray-800">Phòng Chat Realtime</h2>
      </div>

      {/* Khu vực hiển thị tin nhắn */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.id; // Xác định ai là người gửi
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ô Nhập tin nhắn */}
      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nhập tin nhắn... (Nhấn Enter để gửi)" 
            className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-full px-4 py-2.5 text-sm outline-none transition"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2.5 transition flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>
  );
}