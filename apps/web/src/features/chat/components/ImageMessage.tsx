import React, { useState } from 'react';

interface Props {
  mediaUrl: string;
}

export default function ImageMessage({ mediaUrl }: Props) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <img 
        src={mediaUrl} 
        alt="Đính kèm" 
        onClick={() => setIsPreviewOpen(true)}
        className="max-w-full rounded-lg mb-1 max-h-64 object-cover cursor-pointer hover:opacity-90 transition" 
      />

      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-red-500 z-[60]"
            onClick={() => setIsPreviewOpen(false)}
          >
            &times;
          </button>
          <img 
            src={mediaUrl} 
            alt="Preview" 
            className="max-w-full max-h-full rounded-md shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </>
  );
}