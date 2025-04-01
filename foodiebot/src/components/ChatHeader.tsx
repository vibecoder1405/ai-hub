
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, ArrowLeft } from 'lucide-react';

interface ChatHeaderProps {
  restaurantName: string;
  restaurantLogo?: string;
  onBackClick?: () => void;
  onMenuClick?: () => void;
  className?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  restaurantName,
  restaurantLogo = '',
  onBackClick,
  onMenuClick,
  className,
}) => {
  return (
    <div className={cn(
      'flex items-center justify-between p-4 bg-white border-b',
      'sticky top-0 z-10 shadow-sm',
      className
    )}>
      <div className="flex items-center space-x-2">
        {onBackClick && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBackClick} 
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <div className="flex items-center gap-3">
          {restaurantLogo ? (
            <div className="h-10 w-10 rounded-full overflow-hidden">
              <img 
                src={restaurantLogo} 
                alt={`${restaurantName} logo`} 
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-restaurant-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {restaurantName.charAt(0)}
              </span>
            </div>
          )}
          
          <div>
            <h2 className="font-bold text-lg">{restaurantName}</h2>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </div>
      
      {onMenuClick && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default ChatHeader;
