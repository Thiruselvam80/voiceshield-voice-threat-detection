import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquareText } from 'lucide-react';
import AlertBanner from '@/components/AlertBanner';
import RiskMeter from '@/components/RiskMeter';
import { EmotionBars, ThreatBars } from '@/components/ProbBars';
import ExplanationPanel from '@/components/ExplanationPanel';

export default function TextAnalysis() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyse = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await axios.post('http://localhost:8000/predict/text', { text });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Text Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <MessageSquareText className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
              <textarea 
                value={text} 
                onChange={e => setText(e.target.value)}
                placeholder="Paste transcript or text here for manual threat analysis..."
                className="w-full min-h-[200px] p-3 pl-10 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y"
              />
            </div>
            <Button className="w-full mt-4" onClick={analyse} disabled={!text.trim() || loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Analyse Text
            </Button>
            {error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis & Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <ExplanationPanel explanation={result.explanation} recommendation={result.recommendation} />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <CardTitle className="mb-6 w-full text-left">Risk Level</CardTitle>
          <RiskMeter level={result?.threat_level || 'SAFE'} />
        </Card>

        {result && (
          <>
            <AlertBanner level={result.threat_level} />
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-semibold">Emotion</CardTitle>
              </CardHeader>
              <CardContent>
                <EmotionBars scores={result.emotion.scores} predicted={result.emotion.label} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-semibold">Threat</CardTitle>
              </CardHeader>
              <CardContent>
                <ThreatBars scores={result.threat.scores} predicted={result.threat.label} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
