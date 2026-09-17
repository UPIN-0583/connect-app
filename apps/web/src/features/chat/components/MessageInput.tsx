import React, { useState, useRef } from 'react';
import { socketService } from '@/lib/socket';
import { sendMessageApi, editMessageApi } from '../services/message.api';

interface Props {
  conversationId: string;
  replyingTo: any;
  setReplyingTo: (msg: any) => void;
  editingMessage: any;
  setEditingMessage: (msg: any) => void;
}

export default function MessageInput({ 
  conversationId, 
  replyingTo, 
  setReplyingTo, 
  editingMessage, 
  setEditingMessage 
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const socket = socketService.getSocket();
    if (socket && conversationId) {
      socket.emit("typing:start", { conversationId });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing:stop", { conversationId });
      }, 2000);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && !selectedFile) || !conversationId || isSending) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setIsSending(true);
    setUploadProgress(0);

    try {
      if (editingMessage) {
        await editMessageApi(token, editingMessage.id, inputValue.trim());
        setEditingMessage(null);
        setInputValue("");
        setIsSending(false);
        return;
      }

      const formData = new FormData();
      let type = "TEXT";
      if (selectedFile) {
        type = selectedFile.type.startsWith("image/") ? "IMAGE" : "FILE";
        formData.append("file", selectedFile);
      }
      formData.append("type", type);
      if (inputValue.trim()) formData.append("content", inputValue.trim());
      if (replyingTo) formData.append("replyToId", replyingTo.id);

      await sendMessageApi(token, conversationId, formData, (percent) => {
        setUploadProgress(percent);
      });
      
      setInputValue("");
      setSelectedFile(null);
      setReplyingTo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert("Lỗi upload! Hãy kiểm tra dung lượng.");
    } finally {
      setIsSending(false);
      setUploadProgress(0);
    }
  };

  const progressBars = Math.floor(uploadProgress / 10);
  const emptyBars = 10 - progressBars;
  const progressString = "█".repeat(progressBars) + "░".repeat(emptyBars) + ` ${uploadProgress}%`;

  return (
    <div className="p-4 bg-white border-t border-gray-200 shrink-0">
      
      {/* Khung báo đang TRẢ LỜI */}
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between bg-blue-50 border-l-4 border-blue-500 px-3 py-2 rounded-r max-w-4xl mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-blue-700 truncate">Đang trả lời {replyingTo.sender?.displayName || "Ai đó"}</p>
            <p className="text-sm text-gray-700 truncate">{replyingTo.content || "[Đính kèm]"}</p>
          </div>
          <button type="button" onClick={() => setReplyingTo(null)} className="ml-3 text-gray-400 hover:text-red-500 font-bold p-1">✕</button>
        </div>
      )}

      {/* Khung báo đang SỬA */}
      {editingMessage && (
        <div className="mb-2 flex items-center justify-between bg-green-50 border-l-4 border-green-500 px-3 py-2 rounded-r max-w-4xl mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-green-700 truncate">Đang sửa tin nhắn</p>
            <p className="text-sm text-gray-700 truncate">{editingMessage.content}</p>
          </div>
          <button type="button" onClick={() => { setEditingMessage(null); setInputValue(""); }} className="ml-3 text-gray-400 hover:text-red-500 font-bold p-1">✕</button>
        </div>
      )}

      {/* Thanh Upload Progress */}
      {isSending && selectedFile && (
        <div className="max-w-4xl mx-auto mb-2 text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
          Uploading... {progressString}
        </div>
      )}

      {/* Form nhập liệu */}
      <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setSelectedFile(e.target.files[0]);
            }
          }}
        />

        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full transition shrink-0"
          disabled={isSending}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
        </button>

        {selectedFile ? (
          <div className="flex-1 flex items-center justify-between bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
            <span className="text-sm text-gray-700 truncate max-w-[200px]">{selectedFile.name}</span>
            <button type="button" onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-600 font-bold ml-2">✕</button>
          </div>
        ) : (
          <input 
            type="text" 
            placeholder={editingMessage ? "Sửa nội dung tin nhắn..." : "Nhập tin nhắn..."}
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
            value={inputValue}
            onChange={handleChange}
            disabled={isSending}
          />
        )}

        <button 
          type="submit" 
          disabled={isSending || (!inputValue.trim() && !selectedFile)}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </form>
    </div>
  );
}
