# voiceshield-voice-threat-detection

**Real-time audio threat detection using Speech Emotion Recognition + NLP.**

[![Python](https://img.shields.io/badge/Python-3.10-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://reactjs.org)

---

## 🧠 What It Does

voiceshield-voice-threat-detection analyses audio calls (live or uploaded) and detects threats in real-time by combining two AI models:

| Model | Task | Architecture | Performance |
|---|---|---|---|
| **Speech Emotion Recognition** | Detect emotion from voice | Wav2Vec2-base | F1 = 0.87 |
| **NLP Threat Detection** | Classify text threat type | DistilBERT | F1 = 0.929 |

**Pipeline:**
```
Audio Call
    │
    ├──► Whisper (STT) ──────────────► Transcript
    │
    ├──► Wav2Vec2 (SER) ─────────────► Emotion Score
    │
    └──► (Transcript) ──► DistilBERT ► Threat Score
                                    │
                              Fusion Engine
                                    │
                              Risk Level + Explanation
                                    │
                         React Dashboard + Incident Log
```

---

## 🔥 Features

- 🎙️ **Live Recording** — Record from browser mic, auto-analyse on stop
- 📁 **File Upload** — Drag & drop WAV/MP3/M4A/OGG/WEBM
- 🔤 **Text Analysis** — Type/paste transcript for instant NLP threat scoring
- 📊 **Analytics** — Donut charts, confidence bar charts, emotion distribution
- 📋 **Incident Log** — Filter by risk level, export CSV/JSON
- 🔴 **Critical Alerts** — Flashing banner + navbar badge for CRITICAL threats
- 🎵 **Audio Playback** — Replay uploaded/recorded audio inline

**Threat Classes:**
- ✅ SAFE  
- 💰 SCAM  
- 😤 HARASSMENT  
- ⚔️ VIOLENCE  
- 🚨 EMERGENCY

**Risk Levels:** SAFE → LOW → MEDIUM → HIGH → CRITICAL

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- CUDA GPU (optional, falls back to CPU)

### Backend
```bash
cd voiceshield-voice-threat-detection
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r backend/requirements.txt

cd backend
python -m uvicorn app.main:app --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## 🗂️ Project Structure

```
voiceshield-voice-threat-detection/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── transcribe.py    # POST /transcribe
│   │   │   ├── emotion.py       # POST /emotion
│   │   │   └── predict.py       # POST /predict/text|audio|full
│   │   ├── services/
│   │   │   ├── speech_to_text.py  # faster-whisper STT
│   │   │   ├── emotion.py         # Wav2Vec2 SER
│   │   │   ├── threat.py          # DistilBERT NLP
│   │   │   ├── fusion.py          # Emotion × Threat → Risk
│   │   │   └── risk_scorer.py     # Explanation + Recommendation
│   │   └── main.py
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── AlertBanner.jsx
│       │   ├── RiskMeter.jsx
│       │   ├── ProbBars.jsx
│       │   ├── TranscriptPanel.jsx
│       │   ├── ExplanationPanel.jsx
│       │   ├── IncidentLog.jsx
│       │   ├── LiveRecorder.jsx
│       │   ├── TextAnalysis.jsx
│       │   └── Analytics.jsx
│       ├── App.jsx
│       └── index.css
│
└── training/
    ├── scripts/          # Dataset preparation (CREMA-D, TESS, RAVDESS)
    ├── datasets/         # PyTorch Dataset classes
    ├── trainer/          # Wav2Vec2 fine-tuning trainer
    ├── utils/            # Metrics, class weights, preprocessing
    ├── nlp/              # NLP threat detection training pipeline
    │   ├── scripts/      # Synthetic + hate speech dataset builders
    │   ├── trainer/      # DistilBERT trainer with weighted loss
    │   └── train_nlp.py
    └── train.py          # SER training entry point
```

---

## 📊 Model Details

### Speech Emotion Recognition
- Base: `facebook/wav2vec2-base`
- Fine-tuned on: CREMA-D + TESS + RAVDESS (merged)
- Classes: neutral, happy, sad, angry, fear, disgust
- Training: 30 epochs, cosine LR, weighted cross-entropy

### NLP Threat Detection
- Base: `distilbert-base-uncased`
- Training data: Synthetic templates + Davidson hate speech corpus
- Classes: safe, scam, harassment, violence, emergency
- Training: 6 epochs, weighted loss, FP16

### Fusion Engine
Emotion × NLP lookup table → Risk Level

| Emotion | Threat | Risk |
|---|---|---|
| angry | violence | CRITICAL |
| fear | emergency | CRITICAL |
| neutral | scam | HIGH |
| angry | scam | HIGH |
| happy | safe | SAFE |

---

## 🔌 API Reference

| Endpoint | Method | Body | Description |
|---|---|---|---|
| `/predict/text` | POST | `{"text": "..."}` | NLP threat only |
| `/predict/audio` | POST | `file` (audio) | Emotion only |
| `/predict/full` | POST | `file` (audio) | Full pipeline |
| `/transcribe` | POST | `file` (audio) | STT only |
| `/emotion` | POST | `file` (audio) | Emotion only |
| `/docs` | GET | — | Swagger UI |

---

## 🛠️ Tech Stack

**Backend:** FastAPI · faster-whisper · HuggingFace Transformers · PyTorch · librosa  
**Frontend:** React 18 · Vite · Recharts · Axios  
**Models:** Wav2Vec2 · DistilBERT · Whisper-base  

---

