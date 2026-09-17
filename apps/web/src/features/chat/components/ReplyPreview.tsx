import React from 'react';

interface Props {
  replyTo: any;
  isMine: boolean;
}

export default function ReplyPreview({ replyTo, isMine }: Props) {
  if (!replyTo) return null;
  
  return (
    <div className={`mb-2 p-2 rounded-md text-xs border-l-4 ${
      isMine ? 'bg-blue-800/40 border-blue-200 text-blue-50' : 'bg-gray-200 border-blue-600 text-gray-900'
    }`}>
      <p className="font-extrabold mb-1">{replyTo.sender?.displayName || "Ai đó"}</p>
      <p className="opacity-90 truncate">
        {replyTo.content || (replyTo.type === "IMAGE" ? "[Hình ảnh]" : "[Tệp đính kèm]")}
      </p>
    </div>
  );
}
