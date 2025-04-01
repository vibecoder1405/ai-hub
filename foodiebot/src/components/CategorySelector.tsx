
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Menu, MessageSquare, FileText, Star } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: 'menu' | 'chat' | 'faq' | 'review';
}

interface CategorySelectorProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
  selectedCategory?: string;
  className?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  onSelectCategory,
  selectedCategory,
  className,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'menu':
        return <Menu className="h-6 w-6" />;
      case 'chat':
        return <MessageSquare className="h-6 w-6" />;
      case 'faq':
        return <FileText className="h-6 w-6" />;
      case 'review':
        return <Star className="h-6 w-6" />;
      default:
        return <MessageSquare className="h-6 w-6" />;
    }
  };

  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-4 text-center">Choose a Category</h2>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <Card 
            key={category.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedCategory === category.id 
                ? 'border-restaurant-primary ring-2 ring-restaurant-primary/20' 
                : ''
            }`}
            onClick={() => onSelectCategory(category)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                selectedCategory === category.id 
                  ? 'bg-restaurant-primary text-white' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {getIcon(category.icon)}
              </div>
              <h3 className="font-medium">{category.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
