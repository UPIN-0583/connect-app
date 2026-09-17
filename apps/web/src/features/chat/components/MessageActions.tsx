import React from 'react';
import type { Message } from '../types/chat.types';

interface Props {
  msg: Message;
  isMine: boolean;
  onReply: (msg: Message) => void;
  onEdit: (msg: Message) => void;
  onDelete: (msgId: string) => void;
}

export default function MessageActions({ msg, isMine, onReply, onEdit, onDelete }: Props) {
  return (
    <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity justify-center gap-2 mx-2 shrink-0">
      <button 
        onClick={() => onReply(msg)} 
        className="text-[12px] text-gray-500 hover:text-blue-600 font-bold text-left drop-shadow-sm"
      >
        Trả lời
      </button>
      
      {isMine && msg.type === "TEXT" && (
        <button 
          onClick={() => onEdit(msg)} 
          className="text-[12px] text-gray-500 hover:text-green-600 font-bold text-left drop-shadow-sm"
        >
          Sửa
        </button>
      )}
      
      {isMine && (
        <button 
          onClick={() => {
            if (confirm("Thu hồi tin nhắn này?")) onDelete(msg.id);
          }} 
          className="text-[12px] text-gray-500 hover:text-red-600 font-bold text-left drop-shadow-sm"
        >
          Thu hồi
        </button>
      )}
    </div>
  );
}
