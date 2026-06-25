// src/components/TranscriptPanel.jsx
const TRIGGER_WORDS = [
  'kill','dead','hurt','destroy','suffer','weapon','gun','knife',
  'otp','transfer','account blocked','your bank','kyc','loan',
  'processing fee','lucky draw','arrest','help','police','ambulance',
  'kidnap','trapped','bleeding','shooting','attack',
];

function highlightTriggers(text) {
  if (!text) return [];
  const regex = new RegExp(`(${TRIGGER_WORDS.join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="trigger">{part}</mark>
      : part
  );
}

export default function TranscriptPanel({ transcript, language, langProb }) {
  return (
    <div>
      <div className="transcript-box">
        {transcript
          ? highlightTriggers(transcript)
          : <em>Upload an audio file to see the transcript here.</em>
        }
      </div>
      {language && (
        <div className="transcript-lang">
          Language: <strong>{language?.toUpperCase()}</strong>
          {langProb && ` (${(langProb * 100).toFixed(0)}% confidence)`}
        </div>
      )}
    </div>
  );
}
