import google.generativeai as genai
from textblob import TextBlob
from src.config.settings import GOOGLE_API_KEY, GEMINI_MODEL

class AIService:
    def __init__(self):
        genai.configure(api_key=GOOGLE_API_KEY)
        self.model = genai.GenerativeModel(GEMINI_MODEL)

    def generate_response(self, prompt):
        """Generate a response using Gemini for any given prompt"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            raise Exception(f"Error generating response: {str(e)}")

    def generate_summary(self, text, word_count):
        """Generate summary using Gemini"""
        prompt = f"""Please analyze the following text and create a comprehensive summary in approximately {word_count} words. Structure your response as follows:

1. Title: Create a concise, engaging title that captures the main topic
2. Brief Introduction: 2-3 sentences introducing the main topic and context
3. Target Audience: Identify who this content is primarily aimed at (e.g., beginners, professionals, students, etc.)
4. Key Points: Present the main points in bullet format, focusing on the most important information
5. Conclusion: A brief conclusion that ties everything together and provides value to the target audience

Text to analyze:
{text}

Please format your response as follows:

## Title
[Title]

## Introduction
[Your introduction here]

## Target Audience
[Your target audience analysis here]

## Key Points
- [Point 1]
- [Point 2]
- [Point 3]
...

## Conclusion
[Your conclusion here]"""
        
        response = self.model.generate_content(prompt)
        return response.text

    def translate_text(self, text, target_language):
        """Translate text using Gemini"""
        prompt = f"""Translate the following text to {target_language}:

{text}

Translation:"""
        
        response = self.model.generate_content(prompt)
        return response.text

    def analyze_sentiment(self, comments):
        """Analyze sentiment of comments"""
        if not comments:
            return None
            
        sentiments = []
        for comment in comments:
            analysis = TextBlob(comment)
            sentiments.append(analysis.sentiment.polarity)
        
        avg_sentiment = sum(sentiments) / len(sentiments)
        
        # Categorize sentiment
        if avg_sentiment > 0.2:
            sentiment_category = "Very Positive"
        elif avg_sentiment > 0:
            sentiment_category = "Positive"
        elif avg_sentiment < -0.2:
            sentiment_category = "Very Negative"
        elif avg_sentiment < 0:
            sentiment_category = "Negative"
        else:
            sentiment_category = "Neutral"
        
        return {
            'category': sentiment_category,
            'total_comments': len(comments)
        }

    def analyze_comments(self, comments):
        """Generate a comprehensive analysis of comments using Gemini"""
        if not comments:
            return None
            
        # Prepare comments for analysis
        comments_text = "\n".join(comments)
        
        prompt = f"""Analyze the following YouTube video comments and provide a comprehensive summary of user feedback. Focus on:

1. Overall sentiment and general reception
2. What users liked about the video
3. What users found helpful or learned
4. Any constructive criticism or areas for improvement
5. Key takeaways or common themes in the comments

Comments to analyze:
{comments_text}

Please format your response as follows:

## Overall Reception
[Brief summary of general sentiment and reception]

## What Users Liked
- [Key positive points]
- [Specific features or aspects praised]

## Key Learnings & Helpful Aspects
- [What users learned]
- [What they found particularly helpful]

## Areas for Improvement
- [Constructive feedback]
- [Suggestions for enhancement]

## Common Themes
- [Recurring topics or points]
- [Shared experiences or perspectives]"""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            raise Exception(f"Error analyzing comments: {str(e)}") 