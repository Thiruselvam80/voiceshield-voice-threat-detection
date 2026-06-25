"""
fusion.py
---------
Combines Emotion score + NLP Threat score into a single Risk Level.

Risk levels: SAFE, LOW, MEDIUM, HIGH, CRITICAL
"""

# ──────────────────────────────────────────────────────────────────────────────
# Fusion table
# emotion x threat -> base risk
# ──────────────────────────────────────────────────────────────────────────────

_FUSION_TABLE = {
    # (emotion, threat) -> risk_level
    ("angry",   "violence"):   "CRITICAL",
    ("angry",   "scam"):       "HIGH",
    ("angry",   "harassment"): "HIGH",
    ("angry",   "emergency"):  "CRITICAL",
    ("angry",   "safe"):       "MEDIUM",

    ("fear",    "violence"):   "CRITICAL",
    ("fear",    "scam"):       "HIGH",
    ("fear",    "harassment"): "HIGH",
    ("fear",    "emergency"):  "CRITICAL",
    ("fear",    "safe"):       "MEDIUM",

    ("disgust", "violence"):   "HIGH",
    ("disgust", "scam"):       "HIGH",
    ("disgust", "harassment"): "MEDIUM",
    ("disgust", "emergency"):  "CRITICAL",
    ("disgust", "safe"):       "LOW",

    ("sad",     "violence"):   "HIGH",
    ("sad",     "scam"):       "MEDIUM",
    ("sad",     "harassment"): "MEDIUM",
    ("sad",     "emergency"):  "HIGH",
    ("sad",     "safe"):       "LOW",

    ("neutral", "violence"):   "HIGH",
    ("neutral", "scam"):       "HIGH",
    ("neutral", "harassment"): "MEDIUM",
    ("neutral", "emergency"):  "HIGH",
    ("neutral", "safe"):       "LOW",

    ("happy",   "violence"):   "HIGH",
    ("happy",   "scam"):       "HIGH",
    ("happy",   "harassment"): "MEDIUM",
    ("happy",   "emergency"):  "HIGH",
    ("happy",   "safe"):       "SAFE",
}

_RISK_ORDER = ["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"]


def fuse(
    emotion: str,
    emotion_confidence: float,
    threat: str,
    threat_confidence: float,
) -> str:
    """
    Returns a risk level string: SAFE | LOW | MEDIUM | HIGH | CRITICAL

    Confidence modulation:
      - If either model is low confidence (<0.55), cap at one level below.
    """
    base_risk = _FUSION_TABLE.get((emotion, threat), "MEDIUM")

    # Confidence penalty: if both models are unsure, soften the risk
    min_conf = min(emotion_confidence, threat_confidence)
    if min_conf < 0.55:
        idx = _RISK_ORDER.index(base_risk)
        base_risk = _RISK_ORDER[max(0, idx - 1)]

    return base_risk
