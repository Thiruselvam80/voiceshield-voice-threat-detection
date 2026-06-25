// src/components/TextAnalysis.jsx
import { useState } from 'react';
import axios from 'axios';
import { ThreatBars } from './ProbBars';

const API = 'http://localhost:8000';

const THREAT_COLOR = {
  safe: '#10b981', scam: '#f59e0b', harassment: '#f97316',
  violence: '#ef4444', emergency: '#8b5cf6',
};

const EXAMPLES = [
  "Transfer 50,000 rupees to this account immediately.",
  "I will kill you if you don't comply. This is your last warning.",
  "Help! Someone is attacking me. Call the police now!",
  "Hello, I'd like to check on my order status please.",
  "Your bank account will be blocked. Share OTP to prevent this.",
];

export default function TextAnalysis() {
  const [text, setText]     = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const analyse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/predict/text`, { text });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const useExample = ex => { setText(ex); setResult(null); };

  return (
    <div className="card">
      <div className="card-title">Text Threat Analysis</div>

      {/* Examples */}
      <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {EXAMPLES.map((ex, i) => (
          <button key={i} onClick={() => useExample(ex)}
            style={{ padding: '4px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 20, fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer' }}>
            Example {i + 1}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type or paste a transcript excerpt to analyse for threats..."
        rows={4}
        style={{
          width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '12px', color: 'var(--text-primary)', fontSize: 14,
          resize: 'vertical', outline: 'none', fontFamily: 'var(--font)',
          boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
        onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) analyse(); }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
        <button className="upload-btn" onClick={analyse} disabled={!text.trim() || loading}
          style={{ flex: 1 }}>
          {loading ? 'Analysing...' : 'Analyse Text  (Ctrl+Enter)'}
        </button>
        {text && (
          <button onClick={() => { setText(''); setResult(null); }}
            style={{ padding: '10px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>
            Clear
          </button>
        )}
      </div>

      {error && <div className="error-box" style={{ marginTop: 10 }}>{error}</div>}

      {/* Result */}
      {result && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              padding: '8px 20px', borderRadius: 20, fontWeight: 700, fontSize: 16,
              background: `${THREAT_COLOR[result.predicted_threat]}22`,
              color: THREAT_COLOR[result.predicted_threat],
              border: `1px solid ${THREAT_COLOR[result.predicted_threat]}`,
              textTransform: 'uppercase',
            }}>
              {result.predicted_threat}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: THREAT_COLOR[result.predicted_threat] }}>
              {(result.confidence * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
              NLP only · No audio
            </div>
          </div>
          <ThreatBars scores={result.scores} predicted={result.predicted_threat} />
        </div>
      )}
    </div>
  );
}
