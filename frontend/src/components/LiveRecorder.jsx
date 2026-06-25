// src/components/LiveRecorder.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:8000';
const STEPS = ['Record', 'Uploading', 'Transcribe', 'Emotion', 'Threat', 'Done'];

// Pick supported mime type
function getSupportedMime() {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

export default function LiveRecorder({ onResult, onLog }) {
  const [recording, setRecording] = useState(false);
  const [seconds,   setSeconds]   = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [step,      setStep]      = useState(-1);
  const [error,     setError]     = useState(null);
  const [audioUrl,  setAudioUrl]  = useState(null);
  const [status,    setStatus]    = useState('idle'); // idle | recording | processing | done | error

  const mediaRef   = useRef(null);
  const chunksRef  = useRef([]);
  const streamRef  = useRef(null);
  const timerRef   = useRef(null);

  // Keep latest callbacks in refs to avoid stale closure
  const onResultRef = useRef(onResult);
  const onLogRef    = useRef(onLog);
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onLogRef.current = onLog; }, [onLog]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  // ── Analysis ──────────────────────────────────────────────────
  const analyse = useCallback(async (blob) => {
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    setStatus('processing');
    setLoading(true);
    setStep(1);

    // Determine extension from mime type
    const mime = blob.type || 'audio/webm';
    const ext  = mime.includes('ogg') ? 'ogg'
               : mime.includes('mp4') ? 'm4a'
               : 'webm';
    const filename = `live_recording_${Date.now()}.${ext}`;

    const form = new FormData();
    form.append('file', blob, filename);

    try {
      setStep(2); // Transcribing
      const res = await axios.post(`${API}/predict/full`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120_000,
        onUploadProgress: () => setStep(2),
      });
      setStep(5);
      setStatus('done');

      const data = res.data;
      onResultRef.current?.(data);
      onLogRef.current?.({
        filename:    'Live Recording',
        transcript:  data.transcript,
        emotion:     data.emotion.label,
        emotionConf: data.emotion.confidence,
        threat:      data.threat.label,
        threatConf:  data.threat.confidence,
        risk:        data.threat_level,
        time:        new Date().toLocaleTimeString(),
      });
    } catch (err) {
      const msg = err.response?.data?.detail
                || err.message
                || 'Analysis failed. Check backend is running.';
      setError(msg);
      setStatus('error');
      setStep(-1);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Start recording ────────────────────────────────────────────
  const startRecording = async () => {
    setError(null);
    setAudioUrl(null);
    setStatus('recording');
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000 },
      });
      streamRef.current = stream;

      const mime = getSupportedMime();
      const mr   = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
      mediaRef.current = mr;

      mr.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      // onstop: all data is collected by now
      mr.onstop = () => {
        // Stop microphone tracks AFTER data is collected
        streamRef.current?.getTracks().forEach(t => t.stop());

        const chunks = chunksRef.current;
        if (!chunks.length) {
          setError('No audio data captured. Please try again.');
          setStatus('error');
          return;
        }
        const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
        analyse(blob);
      };

      mr.start(100); // collect in 100ms chunks for smooth data
      setRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s >= 29) {
            stopRecording();
            return 30;
          }
          return s + 1;
        });
      }, 1000);

    } catch (err) {
      const msg = err.name === 'NotAllowedError'
        ? 'Microphone permission denied. Allow access and try again.'
        : `Microphone error: ${err.message}`;
      setError(msg);
      setStatus('error');
    }
  };

  // ── Stop recording ─────────────────────────────────────────────
  const stopRecording = () => {
    clearInterval(timerRef.current);
    setRecording(false);
    // MediaRecorder.stop() → fires final ondataavailable → then onstop
    if (mediaRef.current?.state === 'recording') {
      mediaRef.current.stop();
    }
  };

  const reset = () => {
    setStatus('idle');
    setStep(-1);
    setError(null);
    setAudioUrl(null);
    setSeconds(0);
  };

  const fmt = s =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="card">
      <div className="card-title">Live Recording</div>

      {/* Mic button */}
      <div className="mic-wrap">
        <div className={`mic-ring ${recording ? 'active' : ''}`}>
          <div
            className={`mic-btn ${recording ? 'recording' : ''}`}
            onClick={recording ? stopRecording : (status === 'idle' || status === 'done' || status === 'error') ? startRecording : undefined}
            style={{ cursor: (loading) ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? '⏳' : recording ? '⏹' : '🎙'}
          </div>
        </div>

        <div className="mic-label">
          {recording && (
            <><span className="rec-dot" /> Recording — {fmt(seconds)} / 0:30</>
          )}
          {status === 'idle' && 'Click to start recording'}
          {status === 'processing' && 'Analysing recording…'}
          {status === 'done' && '✅ Analysis complete'}
          {status === 'error' && '❌ Error — click mic to retry'}
        </div>
      </div>

      {/* Step indicator */}
      {(loading || status === 'done') && (
        <div className="steps" style={{ justifyContent: 'center', marginTop: 4, marginBottom: 12 }}>
          {STEPS.map((s, i) => (
            <span key={s} className={`step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
              {i < step ? '✓ ' : ''}{s}
            </span>
          ))}
        </div>
      )}

      {/* Error */}
      {error && <div className="error-box" style={{ marginBottom: 12 }}>{error}</div>}

      {/* Playback */}
      {audioUrl && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Recorded audio</div>
          <audio controls src={audioUrl}
            style={{ width: '100%', borderRadius: 8, outline: 'none' }} />
        </div>
      )}

      {/* Reset */}
      {(status === 'done' || status === 'error') && !recording && (
        <button onClick={reset} className="export-btn"
          style={{ width: '100%', marginTop: 4, padding: '8px', textAlign: 'center' }}>
          🔄 Record Again
        </button>
      )}

      <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
        Max 30 seconds · Mono 16 kHz · Chrome / Edge / Firefox
      </p>
    </div>
  );
}
