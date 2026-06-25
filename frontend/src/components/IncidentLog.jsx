// src/components/IncidentLog.jsx
import { useState } from 'react';

export default function IncidentLog({ logs }) {
  const [expanded, setExpanded] = useState(null);

  if (!logs.length) return (
    <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>
      No incidents logged yet. Analyse an audio file to start.
    </p>
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="log-table">
        <thead>
          <tr>
            <th>#</th>
            <th>File</th>
            <th>Transcript</th>
            <th>Emotion</th>
            <th>Threat</th>
            <th>Risk</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i} onClick={() => setExpanded(expanded === i ? null : i)}
              style={{ cursor: 'pointer' }}>
              <td style={{ color: 'var(--text-muted)' }}>{logs.length - i}</td>
              <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {log.filename}
              </td>
              <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: 'var(--text-secondary)' }}>
                {log.transcript || '—'}
              </td>
              <td style={{ textTransform: 'capitalize', fontSize: 13 }}>
                {log.emotion} <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  ({(log.emotionConf * 100).toFixed(0)}%)
                </span>
              </td>
              <td style={{ textTransform: 'capitalize', fontSize: 13 }}>
                {log.threat} <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  ({(log.threatConf * 100).toFixed(0)}%)
                </span>
              </td>
              <td><span className={`badge badge-${log.risk}`}>{log.risk}</span></td>
              <td style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{log.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
