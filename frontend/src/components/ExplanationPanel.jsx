// src/components/ExplanationPanel.jsx
export default function ExplanationPanel({ explanation, recommendation }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {explanation?.length > 0 && (
        <ul className="explanation-list">
          {explanation.map((item, i) => (
            <li key={i} className="explanation-item">
              <span className="explanation-bullet">→</span>
              {item}
            </li>
          ))}
        </ul>
      )}
      {recommendation && (
        <div className="recommendation">
          <strong style={{ display: 'block', marginBottom: 6, color: '#a78bfa' }}>
            Recommendation
          </strong>
          {recommendation}
        </div>
      )}
    </div>
  );
}
