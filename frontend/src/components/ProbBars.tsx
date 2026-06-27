import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProbBarsProps {
  scores: Record<string, number>;
  predicted: string;
}

export function EmotionBars({ scores, predicted }: ProbBarsProps) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return (
    <div className="space-y-4">
      {sorted.map(([label, score]) => (
        <div key={label} className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className={label === predicted ? 'font-semibold text-primary' : 'text-muted-foreground'}>
              {label}
            </span>
            <span className={label === predicted ? 'font-semibold text-primary' : 'text-muted-foreground'}>
              {(score * 100).toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={score * 100} 
            indicatorClassName={label === predicted ? 'bg-primary' : 'bg-secondary-foreground/20'} 
            className="h-2" 
          />
        </div>
      ))}
    </div>
  );
}

export function ThreatBars({ scores, predicted }: ProbBarsProps) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return (
    <div className="space-y-4">
      {sorted.map(([label, score]) => {
        let barColor = 'bg-secondary-foreground/20';
        let textColor = 'text-muted-foreground';
        
        if (label === predicted) {
          if (label === 'high_threat' || label === 'threat') {
            barColor = 'bg-destructive';
            textColor = 'font-semibold text-destructive';
          } else {
            barColor = 'bg-primary';
            textColor = 'font-semibold text-primary';
          }
        }

        return (
          <div key={label} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className={textColor}>{label}</span>
              <span className={textColor}>{(score * 100).toFixed(1)}%</span>
            </div>
            <Progress 
              value={score * 100} 
              indicatorClassName={barColor}
              className="h-2" 
            />
          </div>
        );
      })}
    </div>
  );
}
