import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ─────────────────────────────────────────────────────────────────────────────
# IMPORTANT: Import PyTorch-based models FIRST.
# This initializes the PyTorch CUDA context BEFORE ctranslate2 (faster-whisper)
# gets a chance to load its CUDA DLLs. After PyTorch has initialized, we set
# CUDA_VISIBLE_DEVICES=-1 so ctranslate2 sees "no GPU" and skips cudnn loading.
# This prevents the "Could not load symbol cudnnGetLibConfig error 127" Windows crash.
# ─────────────────────────────────────────────────────────────────────────────

# Step 1 — Initialize PyTorch CUDA (emotion + threat models)
from app.services.emotion import predict_emotion   # Wav2Vec2 on CUDA  (reads CUDA env here)
from app.services.threat  import predict_threat    # DistilBERT on CUDA

# Step 2 — Hide CUDA from ctranslate2 BEFORE importing faster_whisper
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"          # ctranslate2 will see no GPU

# Step 3 — Now import routers (speech_to_text / faster_whisper loads here)
from app.api.transcribe import router as transcribe_router   # loads faster_whisper
from app.api.emotion    import router as emotion_router      # already cached
from app.api.predict    import router as predict_router      # already cached

app = FastAPI(
    title="CallShield AI",
    version="2.0.0",
    description="Audio threat detection — SER + NLP + Fusion",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transcribe_router)
app.include_router(emotion_router)
app.include_router(predict_router)


@app.get("/")
def root():
    return {
        "service": "CallShield AI",
        "version": "2.0.0",
        "endpoints": [
            "POST /transcribe",
            "POST /emotion",
            "POST /predict/text",
            "POST /predict/audio",
            "POST /predict/full",
        ],
    }