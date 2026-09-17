import React from 'react';
import type { Message } from '../types/chat.types';
import TextMessage from './TextMessage';
import ImageMessage from './ImageMessage';
import FileMessage from './FileMessage';
import ReplyPreview from './ReplyPreview';
import MessageActions from './MessageActions';

interface Props {
  msg: Message;
  isMine: boolean;
  onReply: (msg: Message) => void;
  onEdit: (msg: Message) => void;
  onDelete: (msgId: string) => void;
}

export default function MessageItem({ msg, isMine, onReply, onEdit, onDelete }: Props) {
  return (
    <div className={`flex w-full group items-center mb-4 ${isMine ? 'justify-start flex-row-reverse' : 'justify-start'}`}>
      
      <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
          isMine 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
        } ${msg.deletedAt ? 'bg-gray-100 border-gray-300 !text-gray-500 italic !rounded-2xl' : ''}`}
      >
        {msg.deletedAt ? (
          <p className="text-sm opacity-80">Tin nhắn đã bị thu hồi</p>
        ) : (
          <>
            <ReplyPreview replyTo={msg.replyTo} isMine={isMine} />
            {msg.type === "IMAGE" && msg.mediaUrl && <ImageMessage mediaUrl={msg.mediaUrl} />}
            {msg.type === "FILE" && msg.mediaUrl && (
              <FileMessage mediaUrl={msg.mediaUrl} fileName={msg.fileName} isMine={isMine} />
            )}
            {msg.type === "TEXT" && msg.content && <TextMessage content={msg.content} />}
          </>
        )}
      </div>

      {!msg.deletedAt && (
        <MessageActions msg={msg} isMine={isMine} onReply={onReply} onEdit={onEdit} onDelete={onDelete} />
      )}
      
    </div>
  );
}
