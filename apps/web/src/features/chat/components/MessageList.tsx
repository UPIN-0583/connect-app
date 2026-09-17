import React, { useEffect, useRef } from 'react';
import type { Message } from '../types/chat.types';
import MessageItem from './MessageItem';

interface Props {
  messages: Message[];
  user: any;
  onReply: (msg: Message) => void;
  onEdit: (msg: Message) => void;
  onDelete: (msgId: string) => void;
  typists: Set<string>;
}

export default function MessageList({ messages, user, onReply, onEdit, onDelete, typists }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typists]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col" ref={scrollRef}>
      {messages.map((msg) => (
        <MessageItem 
          key={msg.id} 
          msg={msg} 
          isMine={msg.senderId === user?.id} 
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {typists.size > 0 && (
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-500 rounded-2xl px-4 py-2 text-sm italic shadow-sm rounded-bl-none flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
            <span className="ml-2">Ai đó đang gõ...</span>
          </div>
        </div>
      )}
    </div>
    
  );
}
