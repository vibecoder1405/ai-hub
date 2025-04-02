# Welcome to Transliterated Chatbot: FoodieBot

## What does this project do?

This project is a transliterated chatbot designed for food-related interactions. You can:

- **Upload chat history, menus, FAQs, and reviews** to train the chatbot.
- **Talk to the application in transliterated language** for seamless communication.
- **Review and analyze interactions** to improve the chatbot’s responses.

## Technology Stack

This project is built with modern web technologies:

### Frontend
- **TypeScript** - Type-safe JavaScript
- **React** - UI component library
- **Vite** - Fast build tool and development server
- **shadcn-ui** - Beautiful and accessible UI components
- **Tailwind CSS** - Utility-first CSS framework

### Data Storage
- **localforage** - Client-side storage library (uses IndexedDB/WebSQL/localStorage)

### AI Integration
- **Google Generative AI SDK** - Integration with Gemini LLM
- **Custom language detection** - For transliterated languages

## Local Development and Deployment

### Setup

1. Clone the repository:
   ```sh
   git clone <YOUR_REPOSITORY_URL>
   cd foodiebot
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Configure Gemini API Key:
   - Open the `.env` file
   - Add your Gemini API key (get it from: https://makersuite.google.com/app/apikey)
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Running the Application

1. Start the development server:
   ```sh
   npm run dev
   ```
   This will start the application on http://localhost:3000

2. For production build:
   ```sh
   npm run build
   npm run preview
   ```
   The preview server will also run on http://localhost:3000

## Usage Guide

### Settings Page

1. Navigate to the Settings page
2. Use the Document Uploader to upload files in different categories:
   - **Menu** - Upload menu items, prices, descriptions
   - **Reviews** - Upload customer reviews
   - **FAQs** - Upload frequently asked questions and answers
   - **Chat History** - Upload previous chat interactions

### Chat Interface

1. Return to the Home page
2. Type questions in the chat interface
3. **Transliteration Examples**:
   - Hindi: "menu mein kya hai?", "aapka restaurant kahan hai?"
   - Telugu: "mee restaurant ekkada undi?", "menu lo emi undi?"
   - English: "What's on the menu?", "Where is your restaurant located?"

### Document Storage

Documents are stored in your browser's local storage (IndexedDB). The chatbot uses these documents as context when answering questions. If you clear your browser data, the documents will be lost.
