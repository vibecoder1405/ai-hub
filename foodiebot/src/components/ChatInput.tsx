
import React, { useState, FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  placeholder = "Aap kya poochna chahte hain? (What would you like to ask?)",
  isLoading = false,
  className,
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        'flex items-center p-4 border-t bg-white sticky bottom-0',
        className
      )}
    >
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1 text-base focus-visible:ring-restaurant-primary"
      />
      <Button 
        type="submit"
        variant="ghost"
        size="icon"
        disabled={!message.trim() || isLoading}
        className={cn(
          'ml-2',
          message.trim() && !isLoading ? 'text-restaurant-primary hover:text-restaurant-primary hover:bg-restaurant-light' : ''
        )}
      >
        <Send className={`h-5 w-5 ${message.trim() && !isLoading ? 'fill-restaurant-primary' : ''}`} />
      </Button>
    </form>
  );
};

export default ChatInput;
