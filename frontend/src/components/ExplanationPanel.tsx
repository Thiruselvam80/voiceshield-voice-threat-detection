import React from 'react';

interface ExplanationPanelProps {
  explanation: string;
  recommendation: string;
}

const InfoIcon = () => (
  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

export default function ExplanationPanel({ explanation, recommendation }: ExplanationPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex space-x-3">
        <InfoIcon />
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-1">Reasoning</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {explanation || 'No explanation provided.'}
          </p>
        </div>
      </div>
      <div className="flex space-x-3">
        <CheckIcon />
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
