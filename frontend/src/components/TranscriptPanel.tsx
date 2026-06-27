import React from 'react';
import { Languages } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TranscriptPanelProps {
  transcript: string;
  language: string;
}

export default function TranscriptPanel({ transcript, language }: TranscriptPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Languages className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Detected Language:</span>
        <Badge variant="secondary">{language}</Badge>
      </div>
      <div className="p-4 bg-secondary/50 rounded-md border border-border/50 text-foreground leading-relaxed text-sm whitespace-pre-wrap">
        {transcript || <span className="text-muted-foreground italic">No speech detected.</span>}
      </div>
    </div>
  );
}
