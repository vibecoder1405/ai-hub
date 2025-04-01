
import React from 'react';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isLastMessage?: boolean;
  className?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLastMessage = false,
  className,
}) => {
  const isUser = message.sender === 'user';
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(message.timestamp);
  
  return (
    <div className={cn(
      'flex mb-2',
      isUser ? 'justify-end' : 'justify-start',
      className
    )}>
      <div className={cn(
        'max-w-[75%] rounded-2xl py-2 px-4',
        isUser 
          ? 'bg-restaurant-tertiary text-white rounded-br-none'
          : 'bg-white border border-gray-200 rounded-bl-none',
        isLastMessage && isUser ? 'mb-4' : ''
      )}>
        <p className="text-sm md:text-base whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div className={cn(
          'text-[10px] mt-1',
          isUser ? 'text-white/70' : 'text-gray-500'
        )}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

export const TypingIndicator = () => {
  return (
    <div className="flex mb-2 justify-start">
      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none py-2 px-4">
        <div className="flex space-x-1 items-center h-6">
          <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
