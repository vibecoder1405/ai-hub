import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import ChatMessage, { Message, TypingIndicator } from './ChatMessage';
import CategorySelector, { Category } from './CategorySelector';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SentimentSummary from './SentimentSummary';
import { getSampleSentimentData } from '@/utils/sentimentAnalysis';

// Sample restaurant logo
const RESTAURANT_LOGO = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D';

// Sample categories
const CATEGORIES: Category[] = [
  {
    id: 'menu',
    name: 'Menu',
    description: 'Browse our delicious offerings',
    icon: 'menu',
  },
  {
    id: 'reviews',
    name: 'Reviews',
    description: 'See what others are saying',
    icon: 'review',
  },
  {
    id: 'faqs',
    name: 'FAQs',
    description: 'Frequently asked questions',
    icon: 'faq',
  },
  {
    id: 'chat',
    name: 'Chat History',
    description: 'Your previous conversations',
    icon: 'chat',
  },
];

// Example welcome messages for each category
const WELCOME_MESSAGES: Record<string, string> = {
  menu: "Hamare menu mein aapka swagat hai! Aap kya dekhna chahenge? Veg, non-veg ya koi special dish? (Welcome to our menu! What would you like to see? Veg, non-veg or any special dish?)",
  reviews: "Hamare customers ne humein 4.8/5 rating di hai. Aap kisi specific dish ke reviews dekhna chahenge? (Our customers have given us a 4.8/5 rating. Would you like to see reviews for any specific dish?)",
  faqs: "Yahan kuch common sawaal hain. Aap kya jaanna chahte hain? Restaurant timing, delivery options ya kuch aur? (Here are some common questions. What would you like to know? Restaurant timing, delivery options or something else?)",
  chat: "Aapke pichle conversations yahan hain. Kya aap koi naya sawal poochna chahte hain? (Your previous conversations are here. Would you like to ask a new question?)"
};

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSentiment, setShowSentiment] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    setShowSentiment(selectedCategory === 'reviews' || selectedCategory === 'chat');
  }, [selectedCategory]);

  const handleSendMessage = (content: string) => {
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newUserMessage]);
    setIsTyping(true);
    
    setTimeout(() => {
      const botResponse: Message = {
        id: `bot-${Date.now()}`,
        content: generateBotResponse(content, selectedCategory || ''),
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category.id);
    setMessages([]);
    
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: `bot-welcome-${Date.now()}`,
        content: WELCOME_MESSAGES[category.id] || "Namaste! Aap kya jaanna chahte hain? (Hello! What would you like to know?)",
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
    }, 300);
  };

  const generateBotResponse = (userMessage: string, category: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (category === 'menu') {
      if (lowerCaseMessage.includes('veg') || lowerCaseMessage.includes('vegetarian')) {
        return "Hamare veg menu mein Paneer Butter Masala (₹250), Dal Tadka (₹180), Veg Biryani (₹220) aur Malai Kofta (₹270) shamil hain. Aapko kaunsi dish pasand hai? (Our veg menu includes Paneer Butter Masala (₹250), Dal Tadka (₹180), Veg Biryani (₹220) and Malai Kofta (₹270). Which dish do you prefer?)";
      } else if (lowerCaseMessage.includes('non veg') || lowerCaseMessage.includes('nonveg')) {
        return "Non-veg menu mein Butter Chicken (₹320), Chicken Biryani (₹280), Mutton Rogan Josh (₹350) aur Fish Curry (₹300) available hain. Aapka kya order hoga? (In our non-veg menu, Butter Chicken (₹320), Chicken Biryani (₹280), Mutton Rogan Josh (₹350) and Fish Curry (₹300) are available. What would you like to order?)";
      } else if (lowerCaseMessage.includes('special') || lowerCaseMessage.includes('best')) {
        return "Aaj ka special Chef's Special Thali hai - jisme paneer, dal, rice, roti, salad aur dessert shamil hai, sirf ₹450 mein. Ye humare customers ka favorite hai! (Today's special is the Chef's Special Thali - which includes paneer, dal, rice, roti, salad and dessert, for just ₹450. It's our customers' favorite!)";
      }
    } else if (category === 'reviews') {
      if (lowerCaseMessage.includes('butter chicken') || lowerCaseMessage.includes('chicken')) {
        return "Butter Chicken ke baare mein Rahul ne kaha: \"Bahut tasty butter chicken, perfect spice level aur creamy gravy.\" Priya ne likha: \"Best butter chicken I've ever had!\" (About Butter Chicken, Rahul said: \"Very tasty butter chicken, perfect spice level and creamy gravy.\" Priya wrote: \"Best butter chicken I've ever had!\")";
      } else if (lowerCaseMessage.includes('service') || lowerCaseMessage.includes('staff')) {
        return "Hamare service ke baare mein Amit ne kaha: \"Staff bahut friendly hai aur service fast hai.\" Neha ne likha: \"Waiters bahut achhe se attend karte hain aur recommendations bhi dete hain.\" (About our service, Amit said: \"Staff is very friendly and service is fast.\" Neha wrote: \"Waiters attend very well and also give recommendations.\")";
      }
    } else if (category === 'faqs') {
      if (lowerCaseMessage.includes('time') || lowerCaseMessage.includes('hours') || lowerCaseMessage.includes('timing')) {
        return "Humara restaurant har din subah 11 baje se raat 11 baje tak khula rehta hai. Weekend pe hum midnight 1 baje tak open rehte hain. (Our restaurant is open every day from 11 AM to 11 PM. On weekends we remain open until 1 AM.)";
      } else if (lowerCaseMessage.includes('location') || lowerCaseMessage.includes('address')) {
        return "Humara restaurant 123 Food Street, Tasty Nagar, New Delhi mein situated hai. Metro station se sirf 5 minute ki walking distance hai. (Our restaurant is situated at 123 Food Street, Tasty Nagar, New Delhi. It's just a 5-minute walk from the metro station.)";
      } else if (lowerCaseMessage.includes('delivery') || lowerCaseMessage.includes('takeout')) {
        return "Haan, hum delivery services provide karte hain. Aap humari website ya app se order kar sakte hain, ya phir Swiggy aur Zomato pe bhi available hain. Delivery 3-5 km radius mein free hai. (Yes, we provide delivery services. You can order from our website or app, or we're also available on Swiggy and Zomato. Delivery is free within a 3-5 km radius.)";
      }
    }
    
    const defaultResponses = [
      "Mujhe aapki baat samajh nahi aayi. Kya aap dobara puchh sakte hain? (I didn't understand. Could you ask again?)",
      "Is baare mein aur detail mein jankaari denge kya? (Could you provide more details about this?)",
      "Main aapki kaise madad kar sakta hoon? (How can I help you?)",
      "Kya aap kuch aur jaanna chahte hain? (Would you like to know something else?)"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const resetChat = () => {
    setSelectedCategory(null);
    setMessages([]);
    setShowSentiment(false);
  };

  const sentimentData = selectedCategory ? getSampleSentimentData(selectedCategory) : [];

  return (
    <div className="bg-gray-50 shadow-lg rounded-lg overflow-hidden flex flex-col border">
      {!selectedCategory ? (
        <div className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-restaurant-dark">Welcome to FoodieBot</h1>
            <p className="text-muted-foreground mt-1">Select a category to start chatting</p>
          </div>
          
          <div className="flex items-center justify-center mb-8">
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img 
                src={RESTAURANT_LOGO} 
                alt="Restaurant Logo" 
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          
          <CategorySelector 
            categories={CATEGORIES}
            onSelectCategory={handleSelectCategory}
            className="max-w-2xl mx-auto"
          />
        </div>
      ) : (
        <>
          <ChatHeader 
            restaurantName="Taste of India"
            restaurantLogo={RESTAURANT_LOGO}
            onBackClick={resetChat}
          />
          
          <div className="flex-1 overflow-y-auto p-4 chat-scrollbar bg-restaurant-background" style={{ height: '500px' }}>
            {showSentiment && sentimentData.length > 0 && (
              <SentimentSummary 
                sentimentData={sentimentData}
                className="mb-4"
              />
            )}
            
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLastMessage={index === messages.length - 1}
              />
            ))}
            
            {isTyping && <TypingIndicator />}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="flex justify-between items-center p-2 bg-white border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetChat}
              className="text-xs text-muted-foreground"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Change Category
            </Button>
            
            <div className="text-xs text-restaurant-primary font-medium">
              {CATEGORIES.find(cat => cat.id === selectedCategory)?.name}
            </div>
          </div>
          
          <ChatInput 
            onSendMessage={handleSendMessage} 
            isLoading={isTyping}
          />
        </>
      )}
    </div>
  );
};

export default ChatContainer;
