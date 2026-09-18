import React, { useState, useEffect } from "react";
import { socketService } from "@/lib/socket";
import { getMessagesApi, deleteMessageApi } from "../services/message.api";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { CallButton } from "../../call/components/CallOverlay";

interface ChatWindowProps {
  conversation: any | null;
  user: any;
}

export default function ChatWindow({ conversation, user }: ChatWindowProps) {
  const conversationId = conversation?.id || null;
  const [messages, setMessages] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [typists, setTypists] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!conversationId) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const fetchMessages = () => {
      getMessagesApi(token, conversationId)
        .then((res) => {
          if (res && res.messages) setMessages(res.messages.reverse());
        })
        .catch((err) => console.error("Lỗi tải tin nhắn:", err));
    };

    fetchMessages();

    const socket = socketService.getSocket();
    if (socket) {
      socket.emit("conversation:join", { conversationId });

      const handleNewMessage = (msg: any) => {
        if (msg.conversationId === conversationId) setMessages((prev) => [...prev, msg]);
      };
      const handleUpdatedMessage = (updatedMsg: any) => {
        if (updatedMsg.conversationId === conversationId) {
          setMessages((prev) => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
        }
      };
      const handleDeletedMessage = (deletedMsg: any) => {
        if (deletedMsg.conversationId === conversationId) {
          setMessages((prev) => prev.map(m => m.id === deletedMsg.id ? deletedMsg : m));
        }
      };
      const handleTypingStart = (data: { userId: string, conversationId: string }) => {
        if (data.conversationId === conversationId && data.userId !== user?.id) {
          setTypists(prev => new Set([...prev, data.userId]));
        }
      };
      const handleTypingStop = (data: { userId: string, conversationId: string }) => {
        if (data.conversationId === conversationId && data.userId !== user?.id) {
          setTypists(prev => {
            const next = new Set(prev);
            next.delete(data.userId);
            return next;
          });
        }
      };
      const handleReconnect = () => fetchMessages();

      socket.on("message:new", handleNewMessage);
      socket.on("message:updated", handleUpdatedMessage);
      socket.on("message:deleted", handleDeletedMessage);
      socket.on("typing:start", handleTypingStart);
      socket.on("typing:stop", handleTypingStop);
      socket.on("connect", handleReconnect);

      return () => {
        socket.off("message:new", handleNewMessage);
        socket.off("message:updated", handleUpdatedMessage);
        socket.off("message:deleted", handleDeletedMessage);
        socket.off("typing:start", handleTypingStart);
        socket.off("typing:stop", handleTypingStop);
        socket.off("connect", handleReconnect);
      };
    }
  }, [conversationId]);


  const handleDelete = async (msgId: string) => {
    const token = localStorage.getItem("accessToken");
    if (token) await deleteMessageApi(token, msgId);
  };

  if (!conversationId) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-lg font-medium">Chọn một phòng chat để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <div className="p-4 border-b border-gray-200 bg-white font-bold text-gray-800 shadow-sm z-10 flex justify-between items-center">
        {(() => {
          let name = "Đang tải...";
          let currentOtherMember = null;
          if (conversation) {
            if (conversation.type === "DIRECT") {
              currentOtherMember = conversation.members?.find((m: any) => m.userId !== user?.id);
              name = currentOtherMember?.user?.displayName || "User";
            } else {
              name = conversation.name || "Nhóm";
            }
          }
          return (
            <div className="flex items-center justify-between w-full">
              <span>{name}</span>
              {conversation && conversation.type === "DIRECT" && currentOtherMember && (
                <CallButton conversationId={conversation.id} receiverId={currentOtherMember.userId} />
              )}
            </div>
          );
        })()}
      </div>

      <MessageList 
        messages={messages} 
        user={user} 
        typists={typists}
        onReply={setReplyingTo} 
        onEdit={setEditingMessage} 
        onDelete={handleDelete} 
      />

      <MessageInput 
        conversationId={conversationId} 
        replyingTo={replyingTo} 
        setReplyingTo={setReplyingTo}
        editingMessage={editingMessage}
        setEditingMessage={setEditingMessage}
      />
    </div>
  );
}
