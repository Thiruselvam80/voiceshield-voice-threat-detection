import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, Square, Loader2, Activity } from 'lucide-react';

interface LiveRecorderProps {
  onResult: (result: any) => void;
  onLog: (log: any) => void;
}

export default function LiveRecorder({ onResult, onLog }: LiveRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeMs, setTimeMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = processAudio;

      mr.start();
      setRecording(true);
      setError(null);
      setTimeMs(0);
      timerRef.current = window.setInterval(() => setTimeMs(t => t + 100), 100);
    } catch (err: any) {
      setError(err.message || 'Failed to access microphone');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const processAudio = async () => {
    if (chunksRef.current.length === 0) return;
    setLoading(true);
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const file = new File([blob], `live_record_${Date.now()}.webm`, { type: 'audio/webm' });
    
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/predict/full', {
        method: 'POST',
        body: form
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      onResult(data);
      onLog({
        filename: file.name,
        transcript: data.transcript,
        emotion: data.emotion.label,
        emotionConf: data.emotion.confidence,
        threat: data.threat.label,
        threatConf: data.threat.confidence,
        risk: data.threat_level,
        time: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to process audio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Live Recording</span>
          {recording && (
            <Badge variant="destructive" className="animate-pulse">
              <Activity className="w-3 h-3 mr-1" /> Recording
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-8 bg-secondary/30 border border-border rounded-lg">
          <div className="text-4xl font-mono mb-8 font-light tracking-wider">
            {(timeMs / 1000).toFixed(1)}s
          </div>
          <div className="flex gap-4">
            {!recording ? (
              <Button size="lg" onClick={startRecording} disabled={loading} className="w-32">
                <Mic className="w-5 h-5 mr-2" /> Start
              </Button>
            ) : (
              <Button size="lg" variant="destructive" onClick={stopRecording} className="w-32">
                <Square className="w-5 h-5 mr-2" /> Stop
              </Button>
            )}
          </div>
          
          {loading && (
            <div className="mt-6 flex items-center text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing audio...
            </div>
          )}
          
          {error && (
            <div className="mt-6 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-md border border-destructive/20">
              {error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
