
import React from 'react';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { SentimentData } from '@/utils/sentimentAnalysis';

interface SentimentChartProps {
  data: SentimentData[];
  className?: string;
}

const SentimentChart: React.FC<SentimentChartProps> = ({ 
  data,
  className 
}) => {
  // Transform sentiment data for chart display
  const chartData = data.map(item => ({
    name: item.category,
    positive: Math.round(item.score.positive * 100),
    negative: Math.round(item.score.negative * 100),
    neutral: Math.round(item.score.neutral * 100)
  }));

  const config = {
    positive: { color: '#10B981' }, // Green
    negative: { color: '#EF4444' }, // Red
    neutral: { color: '#6B7280' }   // Gray
  };

  return (
    <div className={cn("w-full", className)}>
      <ChartContainer 
        config={config} 
        className="w-full h-[200px] md:h-[250px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={(value) => `${value}%`} />
            <YAxis type="category" dataKey="name" width={100} />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <Bar 
              dataKey="positive" 
              stackId="stack" 
              name="Positive" 
              radius={[0, 0, 0, 0]}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-positive-${index}`} fill={config.positive.color} />
              ))}
            </Bar>
            <Bar 
              dataKey="neutral" 
              stackId="stack" 
              name="Neutral" 
              radius={[0, 0, 0, 0]}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-neutral-${index}`} fill={config.neutral.color} />
              ))}
            </Bar>
            <Bar 
              dataKey="negative" 
              stackId="stack" 
              name="Negative"
              radius={[0, 4, 4, 0]} 
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-negative-${index}`} fill={config.negative.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default SentimentChart;
