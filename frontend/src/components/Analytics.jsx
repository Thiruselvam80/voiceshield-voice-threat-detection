// src/components/Analytics.jsx
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const RISK_COLORS = {
  SAFE: '#10b981', LOW: '#22c55e', MEDIUM: '#f59e0b',
  HIGH: '#f97316', CRITICAL: '#ef4444',
};
const EMOTION_COLORS = {
  neutral: '#94a3b8', happy: '#facc15', sad: '#60a5fa',
  angry: '#f87171', fear: '#c084fc', disgust: '#4ade80',
};
const THREAT_COLORS = {
  safe: '#10b981', scam: '#f59e0b', harassment: '#f97316',
  violence: '#ef4444', emergency: '#8b5cf6',
};

function countBy(logs, key) {
  const counts = {};
  logs.forEach(l => {
    const v = l[key];
    counts[v] = (counts[v] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

const CUSTOM_TOOLTIP = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ background: '#1a2235', border: '1px solid #2a3550', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
      <strong style={{ color: d.payload.fill || '#e2e8f0' }}>{d.name}</strong>: {d.value}
    </div>
  );
};

export default function Analytics({ logs }) {
  if (!logs.length) return (
    <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
      <div style={{ color: 'var(--text-muted)' }}>Analyse some audio files to see analytics here.</div>
    </div>
  );

  const riskData    = countBy(logs, 'risk');
  const emotionData = countBy(logs, 'emotion');
  const threatData  = countBy(logs, 'threat');

  // Last 10 incidents for bar chart
  const barData = logs.slice(0, 10).reverse().map((l, i) => ({
    name: `#${logs.length - i}`,
    emotionConf: Math.round(l.emotionConf * 100),
    threatConf:  Math.round(l.threatConf * 100),
    risk: l.risk,
  }));

  const total    = logs.length;
  const critical = logs.filter(l => l.risk === 'CRITICAL').length;
  const high     = logs.filter(l => l.risk === 'HIGH').length;
  const avgTime  = 'N/A';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary Stats */}
      <div className="grid-3">
        {[
          { label: 'Total Analysed', value: total, color: 'var(--accent-blue)' },
          { label: 'CRITICAL Alerts', value: critical, color: 'var(--risk-critical)' },
          { label: 'HIGH Risk', value: high, color: 'var(--risk-high)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div className="card-title">{s.label}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Pie charts row */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Risk Level Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {riskData.map(d => <Cell key={d.name} fill={RISK_COLORS[d.name] || '#64748b'} />)}
              </Pie>
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Threat Type Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={threatData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {threatData.map(d => <Cell key={d.name} fill={THREAT_COLORS[d.name] || '#64748b'} />)}
              </Pie>
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar chart */}
      <div className="card">
        <div className="card-title">Confidence Scores — Last 10 Incidents</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3550" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} unit="%" />
            <Tooltip content={<CUSTOM_TOOLTIP />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="emotionConf" name="Emotion Conf" fill="#60a5fa" radius={[4,4,0,0]} />
            <Bar dataKey="threatConf"  name="Threat Conf"  fill="#f87171" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Emotion distribution */}
      <div className="card">
        <div className="card-title">Emotion Distribution</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={emotionData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3550" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={70} />
            <Tooltip content={<CUSTOM_TOOLTIP />} />
            <Bar dataKey="value" name="Count" radius={[0,4,4,0]}>
              {emotionData.map(d => <Cell key={d.name} fill={EMOTION_COLORS[d.name] || '#64748b'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
