
// Simple sentiment analysis based on keywords
// In a production app, you would use a more sophisticated NLP model

export type SentimentScore = {
  positive: number;
  negative: number;
  neutral: number;
  overall: 'positive' | 'negative' | 'neutral';
};

export type SentimentData = {
  category: string;
  score: SentimentScore;
};

const POSITIVE_KEYWORDS = [
  'great', 'tasty', 'delicious', 'excellent', 'amazing', 'best',
  'good', 'love', 'perfect', 'favorite', 'fresh', 'nice', 'bahut', 'achha',
  'bahut achha', 'badhiya', 'pasand', 'swadisht', 'mast'
];

const NEGATIVE_KEYWORDS = [
  'bad', 'worst', 'terrible', 'poor', 'awful', 'disappointing', 
  'horrible', 'kharab', 'bura', 'bakwas', 'bekar', 'problem', 'ganda',
  'not good', 'not tasty', 'cold', 'slow'
];

export const analyzeSentiment = (text: string): SentimentScore => {
  const lowerCaseText = text.toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  POSITIVE_KEYWORDS.forEach(keyword => {
    if (lowerCaseText.includes(keyword.toLowerCase())) {
      positiveCount++;
    }
  });
  
  NEGATIVE_KEYWORDS.forEach(keyword => {
    if (lowerCaseText.includes(keyword.toLowerCase())) {
      negativeCount++;
    }
  });

  const total = positiveCount + negativeCount;
  const neutralCount = total === 0 ? 1 : 0;
  
  let overall: 'positive' | 'negative' | 'neutral';
  
  if (positiveCount > negativeCount) {
    overall = 'positive';
  } else if (negativeCount > positiveCount) {
    overall = 'negative';
  } else {
    overall = 'neutral';
  }
  
  return {
    positive: total === 0 ? 0.33 : positiveCount / (total || 1),
    negative: total === 0 ? 0.33 : negativeCount / (total || 1),
    neutral: total === 0 ? 0.34 : neutralCount / (total || 1),
    overall
  };
};

export const getSampleSentimentData = (category: string): SentimentData[] => {
  if (category === 'reviews') {
    return [
      {
        category: 'Food Quality',
        score: {
          positive: 0.75,
          negative: 0.15,
          neutral: 0.10,
          overall: 'positive'
        }
      },
      {
        category: 'Service',
        score: {
          positive: 0.65,
          negative: 0.25,
          neutral: 0.10,
          overall: 'positive'
        }
      },
      {
        category: 'Ambiance',
        score: {
          positive: 0.80,
          negative: 0.10,
          neutral: 0.10,
          overall: 'positive'
        }
      }
    ];
  } else if (category === 'chat') {
    return [
      {
        category: 'Customer Satisfaction',
        score: {
          positive: 0.60,
          negative: 0.20,
          neutral: 0.20,
          overall: 'positive'
        }
      },
      {
        category: 'Issue Resolution',
        score: {
          positive: 0.55,
          negative: 0.30,
          neutral: 0.15,
          overall: 'positive'
        }
      }
    ];
  }
  
  return [];
};
