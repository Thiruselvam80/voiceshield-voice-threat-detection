import os
import shutil
import time
import traceback
from pathlib import Path

import numpy as np
import soundfile as sf

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.services.speech_to_text import transcribe_audio
from app.services.emotion import predict_emotion
from app.services.threat import predict_threat
from app.services.fusion import fuse
from app.services.risk_scorer import build_risk_report

router = APIRouter(prefix="/predict", tags=["predict"])

# Absolute path — works regardless of uvicorn launch directory
UPLOAD_DIR = Path(__file__).resolve().parents[3] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

SAMPLE_RATE = 16_000


# ──────────────────────────────────────────────────────────────────────────────
# Audio normaliser — converts ANY format to 16 kHz mono WAV
# Uses faster-whisper's bundled PyAV (av 17.x) which supports webm/ogg/mp4/mp3
# ──────────────────────────────────────────────────────────────────────────────

def to_wav(src: str) -> str:
    """
    Decode any audio format to 16 kHz mono WAV using faster-whisper's
    decode_audio() (backed by PyAV / bundled FFmpeg).
    Returns path to the WAV file.
    """
    wav_path = str(Path(src).with_suffix(".wav"))
    if src.lower().endswith(".wav"):
        return src  # already WAV — trust librosa to load it directly

    try:
        from faster_whisper.audio import decode_audio
        # decode_audio returns float32 numpy array, mono, at the requested sr
        audio = decode_audio(src, sampling_rate=SAMPLE_RATE)
        sf.write(wav_path, audio, SAMPLE_RATE, subtype="PCM_16")
        print(f"[to_wav] {Path(src).name} -> {Path(wav_path).name}  ({len(audio)/SAMPLE_RATE:.1f}s)")
        return wav_path
    except Exception as e:
        print(f"[to_wav] decode_audio failed: {e}  -- using original file")
        return src


# ──────────────────────────────────────────────────────────────────────────────
# /predict/text  — NLP threat only
# ──────────────────────────────────────────────────────────────────────────────

class TextRequest(BaseModel):
    text: str


@router.post("/text")
async def predict_text(request: TextRequest):
    """
    Run NLP threat classification on a plain text string.
    Body: { "text": "Transfer 50000 to my account immediately." }
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="text cannot be empty")

    result = predict_threat(request.text)
    return result


# ──────────────────────────────────────────────────────────────────────────────
# /predict/audio  — Emotion only
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/audio")
async def predict_audio(file: UploadFile = File(...)):
    """
    Run Speech Emotion Recognition on an uploaded audio file.
    Returns emotion label + probability scores.
    """
    raw_path = str(UPLOAD_DIR / file.filename)
    with open(raw_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    wav_path = to_wav(raw_path)
    result = predict_emotion(wav_path)
    return result


# ──────────────────────────────────────────────────────────────────────────────
# /predict/full  — Complete pipeline
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/full")
async def predict_full(file: UploadFile = File(...)):
    """
    Full CallShield pipeline:
      Audio -> Whisper STT -> Emotion (Wav2Vec2) -> Threat (DistilBERT) -> Fusion -> Risk Report
    Accepts: WAV, MP3, M4A, OGG, WEBM, FLAC
    """
    t0 = time.time()

    # Save uploaded file
    raw_path = str(UPLOAD_DIR / file.filename)
    with open(raw_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    print(f"[predict/full] Received: {file.filename}  ({Path(raw_path).stat().st_size} bytes)")

    try:
        # Normalise to 16 kHz WAV for librosa/emotion model
        wav_path = to_wav(raw_path)
        print(f"[predict/full] Using audio: {wav_path}")

        # Step 1 — Speech to Text (faster-whisper handles most formats natively)
        stt = transcribe_audio(raw_path)
        if "error" in stt:
            raise HTTPException(status_code=500, detail=f"STT error: {stt['error']}")

        transcript = stt.get("transcript", "").strip()
        print(f"[predict/full] Transcript: {transcript[:80]}")

        # Step 2 — Speech Emotion Recognition (uses wav_path, guaranteed 16kHz WAV)
        emotion = predict_emotion(wav_path)
        print(f"[predict/full] Emotion: {emotion['predicted_emotion']} ({emotion['confidence']:.2f})")

        # Step 3 — NLP Threat Detection
        if transcript:
            threat = predict_threat(transcript)
        else:
            threat = {
                "predicted_threat": "safe",
                "confidence": 1.0,
                "scores": {
                    "safe": 1.0, "scam": 0.0, "harassment": 0.0,
                    "violence": 0.0, "emergency": 0.0,
                },
            }
        print(f"[predict/full] Threat: {threat['predicted_threat']} ({threat['confidence']:.2f})")

        # Step 4 — Fusion
        risk_level = fuse(
            emotion=emotion["predicted_emotion"],
            emotion_confidence=emotion["confidence"],
            threat=threat["predicted_threat"],
            threat_confidence=threat["confidence"],
        )
        print(f"[predict/full] Risk: {risk_level}")

        # Step 5 — Build report
        elapsed = round(time.time() - t0, 2)
        report  = build_risk_report(stt, emotion, threat, risk_level, elapsed)
        return JSONResponse(content=report)

    except HTTPException:
        raise
    except Exception as exc:
        tb = traceback.format_exc()
        print(f"[predict/full ERROR]\n{tb}")
        raise HTTPException(status_code=500, detail=f"{type(exc).__name__}: {exc}")
