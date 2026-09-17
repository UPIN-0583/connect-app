import React from 'react';

export default function TextMessage({ content }: { content: string }) {
  if (!content) return null;
  return <p className="text-[15px] leading-relaxed break-words">{content}</p>;
}