import React from 'react';
import { Info, CheckCircle2 } from 'lucide-react';

interface ExplanationPanelProps {
  explanation: string;
  recommendation: string;
}

export default function ExplanationPanel({ explanation, recommendation }: ExplanationPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex space-x-3">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-1">Reasoning</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {explanation || 'No explanation provided.'}
          </p>
        </div>
      </div>
      <div className="flex space-x-3">
        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-1">Actionable Recommendation</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {recommendation || 'No recommendation provided.'}
          </p>
        </div>
      </div>
    </div>
  );
}
