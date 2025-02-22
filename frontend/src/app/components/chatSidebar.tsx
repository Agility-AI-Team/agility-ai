import React from 'react';

interface ChatSidebarProps {
  messages: string[];
}

export function ChatSidebar({ messages }: ChatSidebarProps) {
  
  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-secondary/5 backdrop-blur-sm p-6 overflow-y-auto">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className="bg-background/10 rounded-lg p-4"
          >
            {message}
          </div>
        ))}
      </div>
    </div>
  );
}