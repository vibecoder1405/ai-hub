
import React from 'react';
import { SentimentScore, SentimentData } from '@/utils/sentimentAnalysis';
import { cn } from '@/lib/utils';
import SentimentChart from './SentimentChart';
import { Smile, Frown, Meh } from 'lucide-react';

interface SentimentSummaryProps {
  sentimentData: SentimentData[];
  className?: string;
}

const SentimentSummary: React.FC<SentimentSummaryProps> = ({
  sentimentData,
  className
}) => {
  // Calculate overall sentiment across all categories
  const calculateOverallSentiment = (): SentimentScore => {
    if (sentimentData.length === 0) {
      return {
        positive: 0.33,
        negative: 0.33,
        neutral: 0.34,
        overall: 'neutral'
      };
    }

    let totalPositive = 0;
    let totalNegative = 0;
    let totalNeutral = 0;

    sentimentData.forEach(data => {
      totalPositive += data.score.positive;
      totalNegative += data.score.negative;
      totalNeutral += data.score.neutral;
    });

    const count = sentimentData.length;
    const avgPositive = totalPositive / count;
    const avgNegative = totalNegative / count;
    const avgNeutral = totalNeutral / count;

    let overall: 'positive' | 'negative' | 'neutral';
    if (avgPositive > avgNegative && avgPositive > avgNeutral) {
      overall = 'positive';
    } else if (avgNegative > avgPositive && avgNegative > avgNeutral) {
      overall = 'negative';
    } else {
      overall = 'neutral';
    }

    return {
      positive: avgPositive,
      negative: avgNegative,
      neutral: avgNeutral,
      overall
    };
  };

  const overallSentiment = calculateOverallSentiment();

  const renderSentimentIcon = () => {
    switch (overallSentiment.overall) {
      case 'positive':
        return <Smile className="text-green-500 h-8 w-8" />;
      case 'negative':
        return <Frown className="text-red-500 h-8 w-8" />;
      default:
        return <Meh className="text-gray-500 h-8 w-8" />;
    }
  };

  const getOverallSentimentText = (): string => {
    switch (overallSentiment.overall) {
      case 'positive':
        return 'Mostly Positive';
      case 'negative':
        return 'Mostly Negative';
      default:
        return 'Neutral';
    }
  };

  return (
    <div className={cn("p-4 bg-white rounded-lg shadow", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Sentiment Analysis</h3>
        <div className="flex items-center gap-2">
          {renderSentimentIcon()}
          <span className="font-medium">{getOverallSentimentText()}</span>
        </div>
      </div>
      
      {sentimentData.length > 0 ? (
        <SentimentChart data={sentimentData} />
      ) : (
        <div className="py-8 text-center text-gray-500">
          No sentiment data available
        </div>
      )}
    </div>
  );
};

export default SentimentSummary;
