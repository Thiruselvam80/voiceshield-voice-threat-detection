import { useState, useRef, useCallback } from 'react';
import axios from 'axios';

import AlertBanner      from './components/AlertBanner';
import RiskMeter        from './components/RiskMeter';
import { EmotionBars, ThreatBars } from './components/ProbBars';
import TranscriptPanel  from './components/TranscriptPanel';
import ExplanationPanel from './components/ExplanationPanel';
import IncidentLog      from './components/IncidentLog';
import LiveRecorder     from './components/LiveRecorder';
import TextAnalysis     from './components/TextAnalysis';
import Analytics        from './components/Analytics';
import './index.css';

const API = 'http://localhost:8000';
const TABS = ['📁 Upload', '🎙 Live', '🔤 Text', '📊 Analytics', '📋 Log'];

// ── Helpers ──────────────────────────────────────────────────────────────────
const RISK_RANK = { SAFE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

function exportJSON(logs) {
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `callshield_incidents_${Date.now()}.json`;
  a.click();
}

function exportCSV(logs) {
  const header = 'Time,Filename,Transcript,Emotion,EmotionConf,Threat,ThreatConf,Risk\n';
  const rows   = logs.map(l =>
    `"${l.time}","${l.filename}","${(l.transcript||'').replace(/"/g,'""')}",`+
    `"${l.emotion}",${(l.emotionConf*100).toFixed(1)},"${l.threat}",`+
    `${(l.threatConf*100).toFixed(1)},"${l.risk}"`
  ).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `callshield_incidents_${Date.now()}.csv`;
  a.click();
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]           = useState(0);
  const [file, setFile]         = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState(-1);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);
  const [logs, setLogs]         = useState([]);
  const [filter, setFilter]     = useState('ALL');
  const [threshold, setThreshold] = useState(50);

  const inputRef = useRef();
  const STEPS = ['Upload', 'Transcribe', 'Emotion', 'Threat', 'Fuse', 'Done'];

  // ── add to log ─────────────────────────────────────────────────────────────
  const addLog = useCallback(entry => {
    setLogs(prev => [entry, ...prev].slice(0, 100));
  }, []);

  // ── file upload ────────────────────────────────────────────────────────────
  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setAudioUrl(URL.createObjectURL(f)); }
  }, []);

  const onFileChange = e => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setAudioUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  // ── analyse ────────────────────────────────────────────────────────────────
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
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Request failed. Is the backend running?');
      setStep(-1);
    } finally {
      setLoading(false);
    }
  };

  // ── filtered logs ──────────────────────────────────────────────────────────
  const filteredLogs = filter === 'ALL' ? logs : logs.filter(l => l.risk === filter);
  const criticalCount = logs.filter(l => l.risk === 'CRITICAL').length;

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">CallShield AI</div>
        <div className="navbar-sub">Real-time Audio Threat Detection</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {criticalCount > 0 && (
            <div className="critical-badge">{criticalCount} CRITICAL</div>
          )}
          <div className="navbar-dot" />
        </div>
      </nav>

      {/* Tabs */}
      <div className="tab-bar">
        {TABS.map((t, i) => (
          <button key={t} className={`tab-btn ${tab === i ? 'active' : ''}`}
            onClick={() => setTab(i)}>
            {t}
            {i === 4 && logs.length > 0 && (
              <span className="tab-badge">{logs.length}</span>
            )}
          </button>
        ))}
      </div>

      <main className="main">

        {/* ── TAB 0: Upload ─────────────────────────────────────────── */}
        {tab === 0 && (
          <>
            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="card-title">Audio Analysis</div>

                {step >= 0 && (
                  <div className="steps" style={{ marginBottom: 16 }}>
                    {STEPS.map((s, i) => (
                      <span key={s} className={`step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                        {i < step ? '✓ ' : ''}{s}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  className={`upload-zone ${dragging ? 'dragging' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                >
                  <div className="upload-icon">🎙️</div>
                  <div className="upload-text">Drag & drop audio file here</div>
                  <div className="upload-hint">WAV · MP3 · M4A · OGG · FLAC · WEBM</div>
                  {file && <div className="upload-filename">📎 {file.name}</div>}
                  <input ref={inputRef} type="file" accept="audio/*"
                    style={{ display: 'none' }} onChange={onFileChange} />
                </div>

                {/* Audio player */}
                {audioUrl && (
                  <div style={{ marginTop: 12 }}>
                    <audio controls src={audioUrl}
                      style={{ width: '100%', borderRadius: 8, outline: 'none' }} />
                  </div>
                )}

                <button className="upload-btn" style={{ width: '100%', marginTop: 12 }}
                  onClick={analyse} disabled={!file || loading}>
                  {loading ? 'Analysing…' : '⚡ Analyse Audio'}
                </button>

                {error && <div className="error-box" style={{ marginTop: 10 }}>{error}</div>}
              </div>

              {/* Risk meter */}
              <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <div className="card-title" style={{ textAlign:'center', width:'100%' }}>Risk Level</div>
                <RiskMeter level={result?.threat_level || 'SAFE'} />
                {result && (
                  <div style={{ marginTop: 12, fontSize: 13, color:'var(--text-muted)', textAlign:'center' }}>
                    Analysed in {result.runtime_seconds}s
                  </div>
                )}
              </div>
            </div>

            {result && <AlertBanner level={result.threat_level} />}

            {loading && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="loading-spinner">
                  <div className="spinner" />
                  <div className="spinner-text">Processing audio pipeline…</div>
                </div>
              </div>
            )}

            {result && (
              <>
                <div className="card" style={{ marginBottom: 20 }}>
                  <div className="card-title">Transcript</div>
                  <TranscriptPanel transcript={result.transcript} language={result.language} />
                </div>

                <div className="grid-2" style={{ marginBottom: 20 }}>
                  <div className="card">
                    <div className="card-title">
                      Emotion — {result.emotion.label.toUpperCase()}
                      <span style={{ float:'right', color:'var(--text-primary)', fontWeight:700 }}>
                        {(result.emotion.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <EmotionBars scores={result.emotion.scores} predicted={result.emotion.label} />
                  </div>
                  <div className="card">
                    <div className="card-title">
                      Threat — {result.threat.label.toUpperCase()}
                      <span style={{ float:'right', color:'var(--text-primary)', fontWeight:700 }}>
                        {(result.threat.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <ThreatBars scores={result.threat.scores} predicted={result.threat.label} />
                  </div>
                </div>

                <div className="card" style={{ marginBottom: 20 }}>
                  <div className="card-title">Why this risk level?</div>
                  <ExplanationPanel explanation={result.explanation} recommendation={result.recommendation} />
                </div>
              </>
            )}
          </>
        )}

        {/* ── TAB 1: Live Recording ─────────────────────────────────── */}
        {tab === 1 && (
          <div className="grid-2">
            <LiveRecorder
              onResult={setResult}
              onLog={addLog}
            />
            <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <div className="card-title" style={{ textAlign:'center', width:'100%' }}>Risk Level</div>
              <RiskMeter level={result?.threat_level || 'SAFE'} />
              {result && (
                <>
                  <div style={{ marginTop: 16, width:'100%' }}>
                    <AlertBanner level={result.threat_level} />
                  </div>
                </>
              )}
            </div>
            {result && (
              <>
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                  <div className="card-title">Transcript</div>
                  <TranscriptPanel transcript={result.transcript} language={result.language} />
                </div>
                <div className="card">
                  <div className="card-title">Emotion — {result.emotion.label.toUpperCase()}</div>
                  <EmotionBars scores={result.emotion.scores} predicted={result.emotion.label} />
                </div>
                <div className="card">
                  <div className="card-title">Threat — {result.threat.label.toUpperCase()}</div>
                  <ThreatBars scores={result.threat.scores} predicted={result.threat.label} />
                </div>
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                  <div className="card-title">Explanation</div>
                  <ExplanationPanel explanation={result.explanation} recommendation={result.recommendation} />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB 2: Text Analysis ──────────────────────────────────── */}
        {tab === 2 && <TextAnalysis />}

        {/* ── TAB 3: Analytics ─────────────────────────────────────── */}
        {tab === 3 && <Analytics logs={logs} />}

        {/* ── TAB 4: Incident Log ───────────────────────────────────── */}
        {tab === 4 && (
          <div className="card">
            {/* Filter + Export bar */}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, flexWrap:'wrap' }}>
              <div className="card-title" style={{ marginBottom:0, flex:1 }}>
                Incident Log ({filteredLogs.length})
              </div>

              {/* Filter */}
              <div style={{ display:'flex', gap:6 }}>
                {['ALL','SAFE','LOW','MEDIUM','HIGH','CRITICAL'].map(r => (
                  <button key={r} onClick={() => setFilter(r)}
                    className={`filter-btn ${filter === r ? 'active' : ''} filter-${r}`}>
                    {r}
                  </button>
                ))}
              </div>

              {/* Export */}
              {logs.length > 0 && (
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => exportCSV(logs)} className="export-btn">
                    ↓ CSV
                  </button>
                  <button onClick={() => exportJSON(logs)} className="export-btn">
                    ↓ JSON
                  </button>
                  <button onClick={() => setLogs([])} className="export-btn"
                    style={{ color:'#f87171', borderColor:'#f87171' }}>
                    Clear
                  </button>
                </div>
              )}
            </div>

            <IncidentLog logs={filteredLogs} />
          </div>
        )}

      </main>
    </div>
  );
}
