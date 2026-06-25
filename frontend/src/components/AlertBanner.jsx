// src/components/AlertBanner.jsx
const ICONS = {
  SAFE: '✅', LOW: '🟢', MEDIUM: '🟡', HIGH: '🟠', CRITICAL: '🚨'
};
const MSGS = {
  SAFE: 'Safe Conversation — No threats detected',
  LOW: 'Low Risk — Monitor if pattern repeats',
  MEDIUM: 'Suspicious Language Detected — Review recommended',
  HIGH: 'Possible Scam / Threat — Immediate action required',
  CRITICAL: 'CRITICAL THREAT — Contact emergency services now!',
};

export default function AlertBanner({ level }) {
  return (
    <div className={`alert-banner alert-${level}`}>
      <span className="alert-icon">{ICONS[level]}</span>
      <div>
        <span>{MSGS[level]}</span>
        <span className="alert-label">Threat Level: {level}</span>
      </div>
    </div>
  );
}
