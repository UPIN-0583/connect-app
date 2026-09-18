import React from 'react';

interface Props {
  mediaUrl: string;
  fileName?: string | null;
  isMine: boolean;
}

export default function FileMessage({ mediaUrl, fileName, isMine }: Props) {
  return (
    <a 
      href={mediaUrl} 
      target="_blank" 
      rel="noreferrer" 
      className={`flex items-center gap-2 p-3 rounded-xl mb-1 transition-all ${
        isMine ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-200 hover:bg-gray-300 text-blue-800'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      <span className="text-sm font-bold underline truncate">
        {fileName || "Tài liệu đính kèm"}
      </span>
    </a>
  );
}
