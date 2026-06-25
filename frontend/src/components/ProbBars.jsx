// src/components/ProbBars.jsx
const EMOTION_COLORS = {
  neutral: '#94a3b8', happy: '#facc15', sad: '#60a5fa',
  angry: '#f87171', fear: '#c084fc', disgust: '#4ade80',
};
const THREAT_COLORS = {
  safe: '#10b981', scam: '#f59e0b', harassment: '#f97316',
  violence: '#ef4444', emergency: '#8b5cf6',
};

function Bar({ label, value, color, predicted }) {
  return (
    <div className="prob-row">
      <span className="prob-label" style={predicted ? { color, fontWeight: 700 } : {}}>{label}</span>
      <div className="prob-track">
        <div className="prob-fill" style={{ width: `${(value * 100).toFixed(1)}%`, background: color }} />
      </div>
      <span className="prob-value">{(value * 100).toFixed(1)}%</span>
    </div>
  );
}

export function EmotionBars({ scores, predicted }) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return (
    <div className="prob-bars">
      {sorted.map(([label, val]) => (
        <Bar key={label} label={label} value={val}
          color={EMOTION_COLORS[label] || '#64748b'} predicted={label === predicted} />
      ))}
    </div>
  );
}

export function ThreatBars({ scores, predicted }) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return (
    <div className="prob-bars">
      {sorted.map(([label, val]) => (
        <Bar key={label} label={label} value={val}
          color={THREAT_COLORS[label] || '#64748b'} predicted={label === predicted} />
      ))}
    </div>
  );
}
