import torch
import librosa
import random
import time
from pathlib import Path
from transformers import (
    AutoFeatureExtractor,
    Wav2Vec2ForSequenceClassification,
)

# --------------------------------------------------
# Model path — trained checkpoint
# --------------------------------------------------

MODEL_DIR = (
    Path(__file__).resolve().parents[3]
    / "training"
    / "models"
    / "emotion_model"
)

SAMPLE_RATE = 16_000
MAX_LENGTH  = 80_000   # 5 seconds @ 16 kHz

# --------------------------------------------------
# Load once at startup
# --------------------------------------------------

print("Loading Emotion Recognition model...")

device = "cuda" if torch.cuda.is_available() else "cpu"

if MODEL_DIR.exists():
    feature_extractor = AutoFeatureExtractor.from_pretrained(str(MODEL_DIR))
    model = Wav2Vec2ForSequenceClassification.from_pretrained(str(MODEL_DIR))
    model.eval()
    model.to(device)
    id2label = model.config.id2label   # {0: 'neutral', 1: 'happy', ...}
    print(f"Emotion model loaded on {device}  |  Labels: {list(id2label.values())}")
else:
    print(f"WARNING: Emotion model not found at {MODEL_DIR}. Using mock mode.")
    feature_extractor = None
    model = None
    id2label = {0: 'neutral', 1: 'happy', 2: 'sad', 3: 'angry', 4: 'fear', 5: 'disgust'}


# --------------------------------------------------
# Inference
# --------------------------------------------------

def predict_emotion(audio_path: str) -> dict:
    """
    Run Speech Emotion Recognition on a WAV/MP3/etc. file.

    Returns
    -------
    {
        "predicted_emotion" : str,
        "confidence"        : float,        # 0–1
        "scores"            : {label: prob} # all 6 classes
    }
    """

    if model is None:
        time.sleep(1) # Simulate processing time
        emotions = list(id2label.values())
        pred = random.choice(emotions)
        scores = {e: (0.95 if e == pred else 0.01) for e in emotions}
        return {
            "predicted_emotion": pred,
            "confidence": 0.95,
            "scores": scores,
        }

    # Load & resample
    speech, _ = librosa.load(audio_path, sr=SAMPLE_RATE, mono=True)

    # Truncate to max length
    if len(speech) > MAX_LENGTH:
        speech = speech[:MAX_LENGTH]

    # Feature extraction
    inputs = feature_extractor(
        speech,
        sampling_rate=SAMPLE_RATE,
        return_tensors="pt",
        padding=True,
    )

    input_values = inputs.input_values.to(device)

    # Forward pass
    with torch.no_grad():
        logits = model(input_values).logits        # (1, num_labels)

    probs = torch.softmax(logits, dim=-1)[0]       # (num_labels,)

    predicted_id    = int(probs.argmax())
    predicted_label = id2label[predicted_id]
    confidence      = float(probs[predicted_id])

    scores = {
        id2label[i]: round(float(probs[i]), 4)
        for i in range(len(id2label))
    }

    return {
        "predicted_emotion": predicted_label,
        "confidence":        round(confidence, 4),
        "scores":            scores,
    }