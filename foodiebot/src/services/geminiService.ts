import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';
import { Document } from './documentStorage';

// Initialize the Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Check if API key is valid
const isValidApiKey = API_KEY && API_KEY !== 'your_gemini_api_key_here';

// Only initialize the API if we have a valid key
let genAI: GoogleGenerativeAI | null = null;
if (isValidApiKey) {
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  console.warn('No valid Gemini API key found. The chatbot will use fallback responses.');
}

// Default generation config
const defaultConfig: GenerationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
};

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are FoodieBot, a helpful assistant for a restaurant. 
You can provide information about the menu, answer FAQs, discuss reviews, and handle customer inquiries.

IMPORTANT: You MUST respond in the SAME LANGUAGE STYLE as the user's query.
- If the user types in Hindi using English characters (transliterated Hindi/Hinglish), respond in transliterated Hindi
- If the user types in Telugu using English characters (transliterated Telugu), respond in transliterated Telugu
- If the user types in any Indian language using English characters, respond in the same transliterated language
- If the user types in English, respond in English
- If the user mixes languages, respond in the same mixed style

Examples of transliterated responses:
- Hindi: For "menu mein kya hai?": "Hamare menu mein aaj Butter Chicken, Paneer Tikka, aur Veg Biryani hai. Aap kya order karna chahenge?"
- Telugu: For "mee restaurant ekkada undi?": "Maa restaurant 123 Food Street, Tasty Nagar, New Delhi lo undi. Metro station nunchi kevalam 5 nimishala walking distance lo undi."
- Telugu: For "menu lo emi undi?": "Maa menu lo chala varieties unnai. Butter Chicken, Paneer Tikka, Veg mariyu Non-Veg Biryani, Naan, inka chala unnai. Meeru emi try cheyyalani anukuntunnaru?"

ALWAYS prioritize using information from the user's uploaded documents in your responses.

Always be polite, helpful, and informative.`;

// Format documents for context
const formatDocumentsForContext = (documents: Document[]): string => {
  let context = '';
  
  // Group documents by category
  const menuDocs = documents.filter(doc => doc.category === 'menu');
  const faqDocs = documents.filter(doc => doc.category === 'faqs');
  const reviewDocs = documents.filter(doc => doc.category === 'reviews');
  const chatHistoryDocs = documents.filter(doc => doc.category === 'chatHistory');
  
  // Add menu information
  if (menuDocs.length > 0) {
    context += '### MENU INFORMATION:\n';
    menuDocs.forEach(doc => {
      context += `${doc.content}\n\n`;
    });
  }
  
  // Add FAQ information
  if (faqDocs.length > 0) {
    context += '### FREQUENTLY ASKED QUESTIONS:\n';
    faqDocs.forEach(doc => {
      context += `${doc.content}\n\n`;
    });
  }
  
  // Add review information
  if (reviewDocs.length > 0) {
    context += '### CUSTOMER REVIEWS:\n';
    reviewDocs.forEach(doc => {
      context += `${doc.content}\n\n`;
    });
  }
  
  // Add chat history for context
  if (chatHistoryDocs.length > 0) {
    context += '### PREVIOUS CHAT INTERACTIONS:\n';
    chatHistoryDocs.forEach(doc => {
      context += `${doc.content}\n\n`;
    });
  }
  
  return context;
};

// Create a chat model
export const createChatModel = (): GenerativeModel | null => {
  if (!genAI) return null;
  
  try {
    return genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: defaultConfig,
    });
  } catch (error) {
    console.error('Error creating chat model:', error);
    return null;
  }
};

// Interface for chat messages
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// Fallback responses when API is not available
const getFallbackResponse = (userMessage: string): string => {
  const lowerCaseMessage = userMessage.toLowerCase();
  
  // Simple keyword matching for fallback responses
  if (lowerCaseMessage.includes('menu') || lowerCaseMessage.includes('food') || lowerCaseMessage.includes('dish')) {
    return "Our menu includes a variety of dishes including Butter Chicken, Paneer Tikka, Biryani, and more. Since the Gemini API is not configured, I can only provide basic responses. Please add your API key to get more detailed information.";
  }
  
  if (lowerCaseMessage.includes('review') || lowerCaseMessage.includes('rating')) {
    return "Our restaurant has received excellent reviews from customers. Since the Gemini API is not configured, I can only provide basic responses. Please add your API key to get more detailed information.";
  }
  
  if (lowerCaseMessage.includes('faq') || lowerCaseMessage.includes('question') || lowerCaseMessage.includes('help')) {
    return "I can help answer frequently asked questions about our restaurant. Since the Gemini API is not configured, I can only provide basic responses. Please add your API key to get more detailed information.";
  }
  
  return "I'm here to help with information about our restaurant. To get more detailed and personalized responses, please configure the Gemini API by adding your API key to the .env file.";
};

// Enhanced fallback responses with document context awareness
const getEnhancedFallbackResponse = (userMessage: string, documents: Document[]): string => {
  const lowerCaseMessage = userMessage.toLowerCase();
  
  // Extract relevant content from documents based on user query
  let relevantContent = '';
  
  // First check if this is a transliterated query
  if (lowerCaseMessage.includes('kya') || lowerCaseMessage.includes('hai') || lowerCaseMessage.includes('aap') ||
      lowerCaseMessage.includes('mein') || lowerCaseMessage.includes('hum') || lowerCaseMessage.includes('kaise') ||
      lowerCaseMessage.includes('batao') || lowerCaseMessage.includes('chahta') || lowerCaseMessage.includes('chahti') ||
      lowerCaseMessage.includes('karenge') || lowerCaseMessage.includes('karna') || lowerCaseMessage.includes('dena')) {
    
    // Menu related transliterated responses
    if (lowerCaseMessage.includes('menu') || lowerCaseMessage.includes('khana') || lowerCaseMessage.includes('khaana')) {
      return "Hamare menu mein bahut saare tasty dishes hain jaise Butter Chicken, Paneer Tikka, Veg aur Non-Veg Biryani, Naan, aur bahut kuch. Aap kya try karna chahenge?";  
    }
    
    // Review related transliterated responses
    if (lowerCaseMessage.includes('review') || lowerCaseMessage.includes('rating')) {
      return "Hamare customers ne humein 4.8/5 rating di hai. Unhe hamara khana, service aur ambiance bahut pasand aaya. Kuch customers ke reviews: 'Best Indian food in town', 'Maza aa gaya', 'Ekdum authentic taste'.";  
    }
    
    // FAQ related transliterated responses
    if (lowerCaseMessage.includes('time') || lowerCaseMessage.includes('samay') || lowerCaseMessage.includes('khula') || 
        lowerCaseMessage.includes('open') || lowerCaseMessage.includes('kab')) {
      return "Humara restaurant har din subah 11 baje se raat 11 baje tak khula rehta hai. Weekend pe hum midnight 1 baje tak open rehte hain.";  
    }
    
    if (lowerCaseMessage.includes('location') || lowerCaseMessage.includes('address') || lowerCaseMessage.includes('kahan')) {
      return "Humara restaurant 123 Food Street, Tasty Nagar, New Delhi mein hai. Metro station se sirf 5 minute ki walking distance hai.";  
    }
    
    return "Namaste! Aap humse kisi bhi bhasha mein baat kar sakte hain. Hum aapki madad karne ke liye hamesha taiyar hain. Kya aap humara menu dekhna chahenge ya koi aur jaankari chahiye?";  
  }
  
  // Check for menu-related queries in English
  if (lowerCaseMessage.includes('menu') || lowerCaseMessage.includes('food') || lowerCaseMessage.includes('dish') || 
      lowerCaseMessage.includes('eat') || lowerCaseMessage.includes('order')) {
    // Look for menu documents
    const menuDocs = documents.filter(doc => doc.category === 'menu');
    if (menuDocs.length > 0) {
      relevantContent = `Based on our menu documents, I can tell you about: ${menuDocs.map(doc => doc.name).join(', ')}. `;
      
      // If asking about a specific food item, try to find it
      const foodTerms = ['chicken', 'paneer', 'biryani', 'curry', 'naan', 'rice', 'veg', 'vegetarian', 'non-veg'];
      for (const term of foodTerms) {
        if (lowerCaseMessage.includes(term)) {
          for (const doc of menuDocs) {
            if (doc.content.toLowerCase().includes(term)) {
              relevantContent += `I found information about ${term} in our menu. `;
              break;
            }
          }
        }
      }
    }
    
    return relevantContent + "Our menu includes a variety of dishes including Butter Chicken, Paneer Tikka, Biryani, and more. What would you like to know about our menu?";
  }
  
  // Check for review-related queries
  if (lowerCaseMessage.includes('review') || lowerCaseMessage.includes('rating') || 
      lowerCaseMessage.includes('feedback') || lowerCaseMessage.includes('experience')) {
    // Look for review documents
    const reviewDocs = documents.filter(doc => doc.category === 'reviews');
    if (reviewDocs.length > 0) {
      relevantContent = `We have ${reviewDocs.length} review documents available. `;
      
      // Check for specific review topics
      const reviewTerms = ['service', 'taste', 'ambiance', 'price', 'value', 'quality'];
      for (const term of reviewTerms) {
        if (lowerCaseMessage.includes(term)) {
          for (const doc of reviewDocs) {
            if (doc.content.toLowerCase().includes(term)) {
              relevantContent += `We have reviews mentioning ${term}. `;
              break;
            }
          }
        }
      }
    }
    
    return relevantContent + "Our restaurant has received excellent reviews from customers. Most customers appreciate our food quality, service, and ambiance.";
  }
  
  // Check for FAQ-related queries
  if (lowerCaseMessage.includes('faq') || lowerCaseMessage.includes('question') || lowerCaseMessage.includes('help') ||
      lowerCaseMessage.includes('how') || lowerCaseMessage.includes('what') || lowerCaseMessage.includes('when') ||
      lowerCaseMessage.includes('where') || lowerCaseMessage.includes('why')) {
    // Look for FAQ documents
    const faqDocs = documents.filter(doc => doc.category === 'faqs');
    if (faqDocs.length > 0) {
      relevantContent = `We have ${faqDocs.length} FAQ documents available. `;
      
      // Check for specific FAQ topics
      const faqTerms = ['hours', 'time', 'location', 'reservation', 'booking', 'parking', 'delivery'];
      for (const term of faqTerms) {
        if (lowerCaseMessage.includes(term)) {
          for (const doc of faqDocs) {
            if (doc.content.toLowerCase().includes(term)) {
              relevantContent += `I found information about ${term} in our FAQs. `;
              break;
            }
          }
        }
      }
    }
    
    return relevantContent + "We're open from 11 AM to 11 PM daily. We offer dine-in, takeout, and delivery services. Reservations are recommended for weekends.";
  }
  
  // Handle transliterated queries
  if (lowerCaseMessage.includes('kya') || lowerCaseMessage.includes('hai') || lowerCaseMessage.includes('aap') ||
      lowerCaseMessage.includes('mein') || lowerCaseMessage.includes('hum') || lowerCaseMessage.includes('kaise') ||
      lowerCaseMessage.includes('batao') || lowerCaseMessage.includes('chahta') || lowerCaseMessage.includes('chahti') ||
      lowerCaseMessage.includes('karenge') || lowerCaseMessage.includes('karna') || lowerCaseMessage.includes('dena')) {
    
    // Menu related transliterated responses
    if (lowerCaseMessage.includes('menu') || lowerCaseMessage.includes('khana') || lowerCaseMessage.includes('khaana')) {
      return "Hamare menu mein bahut saare tasty dishes hain jaise Butter Chicken, Paneer Tikka, Veg aur Non-Veg Biryani, Naan, aur bahut kuch. Aap kya try karna chahenge?";  
    }
    
    // Review related transliterated responses
    if (lowerCaseMessage.includes('review') || lowerCaseMessage.includes('rating')) {
      return "Hamare customers ne humein 4.8/5 rating di hai. Unhe hamara khana, service aur ambiance bahut pasand aaya. Kuch customers ke reviews: 'Best Indian food in town', 'Maza aa gaya', 'Ekdum authentic taste'.";  
    }
    
    // FAQ related transliterated responses
    if (lowerCaseMessage.includes('time') || lowerCaseMessage.includes('samay') || lowerCaseMessage.includes('khula') || 
        lowerCaseMessage.includes('open') || lowerCaseMessage.includes('kab')) {
      return "Humara restaurant har din subah 11 baje se raat 11 baje tak khula rehta hai. Weekend pe hum midnight 1 baje tak open rehte hain.";  
    }
    
    if (lowerCaseMessage.includes('location') || lowerCaseMessage.includes('address') || lowerCaseMessage.includes('kahan')) {
      return "Humara restaurant 123 Food Street, Tasty Nagar, New Delhi mein hai. Metro station se sirf 5 minute ki walking distance hai.";  
    }
    
    return "Namaste! Aap humse kisi bhi bhasha mein baat kar sakte hain. Hum aapki madad karne ke liye hamesha taiyar hain. Kya aap humara menu dekhna chahenge ya koi aur jaankari chahiye?";
  }
  
  // Default response
  return "Welcome to FoodieBot! I can help you with our menu, reviews, and frequently asked questions. What would you like to know about our restaurant?";
};

// Detect language from user query
const detectLanguage = (text: string): 'english' | 'hindi' | 'telugu' | 'other' => {
  const lowerText = text.toLowerCase();
  
  // Telugu markers
  const teluguWords = ['undi', 'unnai', 'ledu', 'meeru', 'nenu', 'memu', 'emi', 'ekkada', 
                      'chala', 'bagundi', 'enduku', 'ela', 'eppudu', 'evaru', 'ikkada',
                      'akkada', 'vanta', 'ruchi', 'tinna', 'tinali', 'cheyyandi', 'cheppandi'];
  
  // Hindi markers
  const hindiWords = ['kya', 'hai', 'aap', 'mein', 'hum', 'kaise', 'batao', 'chahta', 'chahti',
                     'karenge', 'karna', 'dena', 'khana', 'khaana', 'samay', 'khula', 'kab',
                     'kahan', 'accha', 'theek', 'bahut'];
  
  // Check for Telugu words
  for (const word of teluguWords) {
    if (lowerText.includes(word)) {
      return 'telugu';
    }
  }
  
  // Check for Hindi words
  for (const word of hindiWords) {
    if (lowerText.includes(word)) {
      return 'hindi';
    }
  }
  
  // Default to English if no markers found
  return 'english';
};

// Extract relevant document content based on query - for context, not direct display
const extractRelevantDocumentContent = (query: string, documents: Document[]): string => {
  const lowerQuery = query.toLowerCase();
  let relevantContent = '';
  
  // Extract keywords from the query
  const keywords = lowerQuery.split(/\s+/).filter(word => word.length > 3);
  
  // Find documents that match the keywords
  for (const doc of documents) {
    const lowerContent = doc.content.toLowerCase();
    
    // Check if any keyword is in the document content
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword)) {
        // Add document content as context, without 'From doc.name' prefix
        relevantContent += `${doc.content}\n\n`;
        break; // Move to next document after finding a match
      }
    }
  }
  
  return relevantContent;
};

// Generate Telugu response based on query and documents
const getTeluguResponse = (query: string, documents: Document[]): string => {
  const lowerQuery = query.toLowerCase();
  // We don't want to display document content directly, just use it for context
  const hasRelevantDocs = extractRelevantDocumentContent(query, documents).length > 0;
  
  // Menu related
  if (lowerQuery.includes('menu') || lowerQuery.includes('food') || lowerQuery.includes('tinna') || lowerQuery.includes('tinali')) {
    return "Maa menu lo chala varieties unnai. Butter Chicken, Paneer Tikka, Veg mariyu Non-Veg Biryani, Naan, inka chala unnai. Meeru emi try cheyyalani anukuntunnaru?";
  }
  
  // Location related
  if (lowerQuery.includes('ekkada') || lowerQuery.includes('address') || lowerQuery.includes('location')) {
    return "Maa restaurant 123 Food Street, Tasty Nagar, New Delhi lo undi. Metro station nunchi kevalam 5 nimishala walking distance lo undi.";
  }
  
  // Time related
  if (lowerQuery.includes('time') || lowerQuery.includes('eppudu') || lowerQuery.includes('open')) {
    return "Maa restaurant prathi roju udayam 11 gantala nunchi raatri 11 gantala varaku open ga untundi. Weekend lo midnight 1 ganta varaku open ga untamu.";
  }
  
  // Reviews related
  if (lowerQuery.includes('review') || lowerQuery.includes('rating') || lowerQuery.includes('bagundi')) {
    return "Maa customers maku 4.8/5 rating ichcharu. Vallaki maa food, service mariyu ambiance chala nachindi. Konni reviews: 'Best Indian food in town', 'Chala bagundi', 'Authentic taste'.";
  }
  
  // Default Telugu response
  return "Namaskaram! Meeru maa restaurant gurinchi emi telususkovaali anukuntunnaru? Menu, reviews, leda FAQs gurinchi adagandi. Meeku ela sahaayam cheyagalanu?";
};

// Attempt to generate a response using Gemini API if available
export const generateResponse = async (
  messages: ChatMessage[],
  documents: Document[]
): Promise<string> => {
  // Get the last user message
  const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
  if (!lastUserMessage) {
    return "I'm waiting for your question. How can I help you today?";
  }
  
  // If we have a valid API key, try to use Gemini
  if (isValidApiKey && genAI) {
    try {
      const model = createChatModel();
      if (!model) {
        throw new Error('Failed to create chat model');
      }
      
      const chat = model.startChat({
        history: [],
        generationConfig: defaultConfig,
      });
      
      // Format context from documents
      const context = formatDocumentsForContext(documents);
      
      // Add system prompt and context as the first message
      const firstPrompt = `${SYSTEM_PROMPT}\n\nHere is the context information to help you respond:\n${context}\n\nPlease respond to the user's queries based on this information.`;
      
      // Send the first message with system prompt and context
      await chat.sendMessage(firstPrompt);
      
      // Send the user's message and get response
      const response = await chat.sendMessage(lastUserMessage.content);
      return response.response.text();
    } catch (error) {
      console.error('Error generating response with Gemini:', error);
      // Fall back to our local handling if Gemini fails
    }
  }
  
  // Fallback to local handling if Gemini is not available or fails
  // Detect language
  const language = detectLanguage(lastUserMessage.content);
  
  // Generate response based on language
  if (language === 'telugu') {
    return getTeluguResponse(lastUserMessage.content, documents);
  } else if (language === 'hindi') {
    // Use Hindi response logic without dumping document content
    const lowerQuery = lastUserMessage.content.toLowerCase();
    
    // Menu related
    if (lowerQuery.includes('menu') || lowerQuery.includes('khana')) {
      return "Hamare menu mein bahut saare tasty dishes hain jaise Butter Chicken, Paneer Tikka, Veg aur Non-Veg Biryani, Naan, aur bahut kuch. Aap kya try karna chahenge?";
    }
    
    // Location related
    if (lowerQuery.includes('kahan') || lowerQuery.includes('address') || lowerQuery.includes('location')) {
      return "Humara restaurant 123 Food Street, Tasty Nagar, New Delhi mein hai. Metro station se sirf 5 minute ki walking distance hai.";
    }
    
    // Default Hindi response
    return "Namaste! Aap humse kisi bhi bhasha mein baat kar sakte hain. Hum aapki madad karne ke liye hamesha taiyar hain. Kya aap humara menu dekhna chahenge ya koi aur jaankari chahiye?";
  }
  
  // Use our enhanced fallback responses that consider the documents
  return getEnhancedFallbackResponse(lastUserMessage.content, documents);
};
