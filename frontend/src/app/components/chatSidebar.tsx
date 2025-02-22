import React, { useRef, useEffect } from 'react';
import { TranscriptItem, TranscriptItemType } from '../models/transcriptItem';
import { Wrench } from 'lucide-react';

interface ChatSidebarProps {
  messages: TranscriptItem[];
}

export function ChatSidebar({ messages }: ChatSidebarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="fixed left-0 top-0 h-full w-80 bg-secondary/5 backdrop-blur-sm p-6 overflow-y-auto"
    >
      <div className="space-y-4">
        {messages.map((message, index) =>
          message.type === TranscriptItemType.TOOL ? (
            <div
              key={index}
              className="bg-background/10 border border-secondary rounded-lg p-4 flex items-center gap-2"
            >
              <Wrench className="w-4 h-4 text-secondary" />
              <span>{message.text}</span>
            </div>
          ) : (
            <div key={index} className="bg-background/10 rounded-lg p-4">
              {message.text}
            </div>
          )
        )}
      </div>
    </div>
  );
}