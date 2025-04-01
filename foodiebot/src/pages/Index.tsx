
import React from 'react';
import Navigation from '@/components/Navigation';
import ChatContainer from '@/components/ChatContainer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-restaurant-light to-restaurant-background flex flex-col">
      <Navigation />
      <div className="container px-4 mx-auto flex-1 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-restaurant-dark">FoodieBot – Your Transliteration-Powered Restaurant Chatbot</h1>
          <p className="text-muted-foreground mb-8">Ask questions about our menu, read reviews, or get answers to FAQs</p>
          <ChatContainer />
        </div>
      </div>
      <footer className="py-4 border-t bg-white">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; 2023 FoodieBot. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
