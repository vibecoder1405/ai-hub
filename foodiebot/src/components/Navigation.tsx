
import React from 'react';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';
import { Cog, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <NavigationMenu className="max-w-full w-full justify-between px-4 py-2 bg-white border-b shadow-sm">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-restaurant-primary">
            <MessageSquare className="h-6 w-6" />
            <span>FoodieBot</span>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>

      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/settings" className="flex items-center gap-2 px-8 py-4 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
            <Cog className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navigation;
