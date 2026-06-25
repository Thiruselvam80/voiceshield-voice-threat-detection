"""
threat.py
---------
NLP Threat Detection service using the fine-tuned DistilBERT model.
Loaded once at startup; provides predict_threat(text) -> dict.
"""

import torch
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# --------------------------------------------------
# Model path
# --------------------------------------------------

MODEL_DIR = (
    Path(__file__).resolve().parents[3]
    / "training"
    / "models"
    / "threat_model"
)

MAX_LENGTH = 128

# --------------------------------------------------
# Load once
# --------------------------------------------------

print("Loading NLP Threat Detection model...")

device    = "cuda" if torch.cuda.is_available() else "cpu"
tokenizer = AutoTokenizer.from_pretrained(str(MODEL_DIR))
model     = AutoModelForSequenceClassification.from_pretrained(str(MODEL_DIR))
model.eval()
model.to(device)

id2label = model.config.id2label   # {0: 'safe', 1: 'scam', ...}

print(f"Threat model loaded on {device}  |  Labels: {list(id2label.values())}")


# --------------------------------------------------
# Inference
# --------------------------------------------------

def predict_threat(text: str) -> dict:
    """
    Classify a text string into one of 5 threat categories.

    Returns
    -------
    {
        "predicted_threat" : str,       # e.g. "scam"
        "confidence"       : float,
        "scores"           : {label: prob}
    }
    """
    inputs = tokenizer(
        text,
        max_length=MAX_LENGTH,
        truncation=True,
        padding="max_length",
        return_tensors="pt",
    )
    input_ids      = inputs["input_ids"].to(device)
    attention_mask = inputs["attention_mask"].to(device)

    with torch.no_grad():
        logits = model(input_ids=input_ids, attention_mask=attention_mask).logits

    probs = torch.softmax(logits, dim=-1)[0]

    predicted_id    = int(probs.argmax())
    predicted_label = id2label[predicted_id]
    confidence      = float(probs[predicted_id])

    scores = {
        id2label[i]: round(float(probs[i]), 4)
        for i in range(len(id2label))
    }

    return {
        "predicted_threat": predicted_label,
        "confidence":       round(confidence, 4),
        "scores":           scores,
    }
