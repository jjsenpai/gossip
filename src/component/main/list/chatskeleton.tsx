import React from 'react';

export const ChatSkeleton: React.FC = () => {
    const messages = [];
    for (let i = 0; i < 7; i++) {
      messages.push(
        <div key={i} className="flex items-start space-x-4">
          <div className="bg-gray-300 h-12 w-20 rounded-full animate-pulse"></div>
          <div className="bg-gray-300 h-12 rounded animate-pulse w-full"></div>
        </div>
      );
    }
    return messages;
  }