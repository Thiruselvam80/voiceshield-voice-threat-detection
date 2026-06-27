import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, Loader2 } from 'lucide-react';

// We will update these components to .tsx next
import AlertBanner      from '@/components/AlertBanner';
import RiskMeter        from '@/components/RiskMeter';
import { EmotionBars, ThreatBars } from '@/components/ProbBars';
import TranscriptPanel  from '@/components/TranscriptPanel';
import ExplanationPanel from '@/components/ExplanationPanel';
import IncidentLog      from '@/components/IncidentLog';
import LiveRecorder     from '@/components/LiveRecorder';
import TextAnalysis     from '@/components/TextAnalysis';
import Analytics        from '@/components/Analytics';

import '@/index.css';

const API = 'http://localhost:8000';

export default function App() {
  const [tab, setTab]           = useState(0);
  const [file, setFile]         = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState(-1);
  const [result, setResult]     = useState<any>(null);
  const [error, setError]       = useState<string | null>(null);
  const [logs, setLogs]         = useState<any[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const STEPS = ['Upload', 'Transcribe', 'Emotion', 'Threat', 'Fuse', 'Done'];

  const addLog = useCallback((entry: any) => {
    setLogs(prev => [entry, ...prev].slice(0, 100));
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); 
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setAudioUrl(URL.createObjectURL(f)); }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAudioUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const analyse = async () => {
    if (!file) return;
    setLoading(true); setError(null); setResult(null); setStep(1);

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await axios.post(`${API}/predict/full`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStep(5);
      const data = res.data;
      setResult(data);
      addLog({
        filename:    file.name,
        transcript:  data.transcript,
        emotion:     data.emotion.label,
        emotionConf: data.emotion.confidence,
        threat:      data.threat.label,
        threatConf:  data.threat.confidence,
        risk:        data.threat_level,
        time:        new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Request failed. Is the backend running?');
      setStep(-1);
    } finally {
      setLoading(false);
    }
  };

  const criticalCount = logs.filter(l => l.risk === 'CRITICAL').length;

  return (
    <AppLayout activeTab={tab} setActiveTab={setTab} criticalCount={criticalCount}>
      {/* ── TAB 0: Upload ─────────────────────────────────────────── */}
      {tab === 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Audio Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {step >= 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {STEPS.map((s, i) => (
                      <Badge 
                        key={s} 
                        variant={i < step ? 'default' : i === step ? 'secondary' : 'outline'}
                      >
                        {i < step ? '✓ ' : ''}{s}
                      </Badge>
                    ))}
                  </div>
                )}

                <div
                  className={`relative group overflow-hidden border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ease-out cursor-pointer ${
                    dragging ? 'border-primary bg-primary/10 scale-[0.99] backdrop-blur-md' : 'border-black/10 bg-white/40 hover:border-primary/40 hover:bg-white/60 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.04)]'
                  }`}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <UploadCloud className={`w-16 h-16 mx-auto mb-6 transition-colors duration-300 ${dragging ? 'text-primary' : 'text-slate-400 group-hover:text-primary/90'}`} />
                  <div className="text-2xl font-bold tracking-tight text-slate-800 mb-2">Drag & drop audio file here</div>
                  <div className="text-sm text-slate-500 mb-8 font-medium">WAV · MP3 · M4A · OGG · FLAC · WEBM</div>
                  {file && (
                    <div className="inline-flex items-center text-sm font-medium bg-white/60 backdrop-blur-xl px-5 py-2.5 rounded-full border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-slate-800">
                      <span className="mr-2">📎</span> {file.name}
                    </div>
                  )}
                  <input ref={inputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={onFileChange} />
                </div>

                {audioUrl && (
                  <div className="mt-4">
                    <audio controls src={audioUrl} className="w-full h-10 outline-none" />
                  </div>
                )}

                <Button className="w-full mt-4" onClick={analyse} disabled={!file || loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Analysing…' : 'Analyse Audio'}
                </Button>

                {error && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center justify-center p-6 text-center">
              <CardTitle className="mb-6 w-full text-left">Risk Level</CardTitle>
              <RiskMeter level={result?.threat_level || 'SAFE'} />
              {result && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Analysed in {result.runtime_seconds}s
                </div>
              )}
            </Card>
          </div>

          {result && <AlertBanner level={result.threat_level} />}

          {loading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Processing audio pipeline…</p>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <TranscriptPanel transcript={result.transcript} language={result.language} />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-base font-semibold">Emotion: {result.emotion.label.toUpperCase()}</CardTitle>
                    <span className="font-bold text-primary">
                      {(result.emotion.confidence * 100).toFixed(1)}%
                    </span>
                  </CardHeader>
                  <CardContent>
                    <EmotionBars scores={result.emotion.scores} predicted={result.emotion.label} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-base font-semibold">Threat: {result.threat.label.toUpperCase()}</CardTitle>
                    <span className="font-bold text-primary">
                      {(result.threat.confidence * 100).toFixed(1)}%
                    </span>
                  </CardHeader>
                  <CardContent>
                    <ThreatBars scores={result.threat.scores} predicted={result.threat.label} />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Analysis & Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ExplanationPanel explanation={result.explanation} recommendation={result.recommendation} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 1: Live Recording ─────────────────────────────────── */}
      {tab === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <LiveRecorder onResult={setResult} onLog={addLog} />
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle>Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <TranscriptPanel transcript={result.transcript} language={result.language} />
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="space-y-6">
            <Card className="flex flex-col items-center justify-center p-6 text-center">
              <CardTitle className="mb-6 w-full text-left">Current Risk</CardTitle>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Explanation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ExplanationPanel explanation={result.explanation} recommendation={result.recommendation} />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: Text Analysis ──────────────────────────────────── */}
      {tab === 2 && <TextAnalysis />}

      {/* ── TAB 3: Analytics ─────────────────────────────────────── */}
      {tab === 3 && <Analytics logs={logs} />}

      {/* ── TAB 4: Incident Log ───────────────────────────────────── */}
      {tab === 4 && <IncidentLog logs={logs} setLogs={setLogs} />}

    </AppLayout>
  );
}
