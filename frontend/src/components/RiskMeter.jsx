// src/components/RiskMeter.jsx
const RISK_LEVELS = ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const RISK_COLORS = {
  SAFE: '#10b981', LOW: '#22c55e', MEDIUM: '#f59e0b',
  HIGH: '#f97316', CRITICAL: '#ef4444',
};

function polarToCartesian(cx, cy, r, angle) {
  const rad = ((angle - 180) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export default function RiskMeter({ level = 'SAFE' }) {
  const idx   = RISK_LEVELS.indexOf(level);
  const color = RISK_COLORS[level];
  const total = 180;
  const step  = total / RISK_LEVELS.length;
  const fill  = (idx + 1) * step;

  return (
    <div className="risk-meter">
      <div className="risk-gauge-wrap">
        <svg width="200" height="120" viewBox="0 0 200 120">
          {/* Track */}
          <path d={arcPath(100, 110, 80, 0, 180)} fill="none" stroke="#1e2a40" strokeWidth="18" strokeLinecap="round" />
          {/* Fill */}
          <path d={arcPath(100, 110, 80, 0, fill)} fill="none" stroke={color} strokeWidth="18" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'all 0.7s cubic-bezier(.4,0,.2,1)' }} />
          {/* Needle */}
          {(() => {
            const needleAngle = fill - 90;
            const rad = (needleAngle * Math.PI) / 180;
            const nx = 100 + 62 * Math.cos(rad);
            const ny = 110 + 62 * Math.sin(rad);
            return <line x1="100" y1="110" x2={nx} y2={ny} stroke={color} strokeWidth="3" strokeLinecap="round"
              style={{ transition: 'all 0.7s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 4px ${color})` }} />;
          })()}
          <circle cx="100" cy="110" r="6" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        </svg>
        <div className="risk-level-text">
          <span className="risk-level-label" style={{ color }}>{level}</span>
          <span className="risk-level-sub">Risk Level</span>
        </div>
      </div>
      <div className="risk-dots">
        {RISK_LEVELS.map(l => (
          <span key={l} className={`risk-dot dot-${l} ${l === level ? 'active' : ''}`}>{l}</span>
        ))}
      </div>
    </div>
  );
}
