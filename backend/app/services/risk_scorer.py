"""
risk_scorer.py
--------------
Assembles the final structured JSON risk report from:
  - STT result (transcript, language)
  - Emotion result (label, confidence, scores)
  - Threat result (label, confidence, scores)
  - Fused risk level

Also builds the human-readable explanation and recommendation.
"""

import re

# ──────────────────────────────────────────────────────────────────────────────
# Keyword trigger lists (for explainability)
# ──────────────────────────────────────────────────────────────────────────────

TRIGGER_KEYWORDS = {
    "scam": [
        "otp", "transfer", "account blocked", "your bank", "bank account",
        "kyc", "loan", "processing fee", "lucky draw", "won a prize",
        "income tax", "cbi", "pan card", "aadhaar", "disconnect", "urgent",
        "immediate", "arrest", "refund", "customs", "work from home",
    ],
    "violence": [
        "kill", "dead", "hurt", "destroy", "suffer", "weapon", "gun", "knife",
        "hunt", "burn", "threat", "die", "end you", "coming for you",
        "nowhere to hide", "last warning",
    ],
    "harassment": [
        "regret", "know where you live", "watch out", "back off",
        "leave me alone", "stop or else", "follow you",
    ],
    "emergency": [
        "help", "police", "ambulance", "gun", "knife", "fire", "accident",
        "kidnapped", "trapped", "unconscious", "bleeding", "drowning",
        "heart attack", "stabbed", "attacked",
    ],
}

# ──────────────────────────────────────────────────────────────────────────────
# Recommendations per risk level + threat type
# ──────────────────────────────────────────────────────────────────────────────

RECOMMENDATIONS = {
    ("CRITICAL", "violence"):   "Immediately contact emergency services (112). Preserve call recording as evidence.",
    ("CRITICAL", "emergency"):  "Contact emergency services immediately (112). Trace call location if possible.",
    ("CRITICAL", "scam"):       "Terminate call. Alert cybercrime cell (1930). Block the number immediately.",
    ("HIGH",     "scam"):       "Flag for immediate supervisor review. Possible financial scam. Do not share any details.",
    ("HIGH",     "violence"):   "Escalate to security team. Document and preserve the call recording.",
    ("HIGH",     "harassment"): "Escalate to supervisor. Log the incident and advise the recipient to block the caller.",
    ("HIGH",     "emergency"):  "Contact local emergency services. Keep caller on line if safe to do so.",
    ("MEDIUM",   "scam"):       "Monitor closely. Advise caller that personal details should never be shared over phone.",
    ("MEDIUM",   "harassment"): "Log incident. Advise recipient to block the number if repeated.",
    ("MEDIUM",   "violence"):   "Flag for review. Evaluate if immediate escalation is required.",
    ("MEDIUM",   "safe"):       "No immediate action required. Monitor if pattern repeats.",
    ("LOW",      "*"):          "No action required. Conversation appears non-threatening.",
    ("SAFE",     "*"):          "Safe conversation. No threats detected.",
}


def _get_recommendation(risk_level: str, threat_label: str) -> str:
    key = (risk_level, threat_label)
    if key in RECOMMENDATIONS:
        return RECOMMENDATIONS[key]
    wildcard = (risk_level, "*")
    if wildcard in RECOMMENDATIONS:
        return RECOMMENDATIONS[wildcard]
    return "Review call recording for further assessment."


def _find_triggers(text: str, threat_label: str) -> list[str]:
    """Find known trigger phrases in the transcript."""
    text_lower = text.lower()
    found = []
    keywords = TRIGGER_KEYWORDS.get(threat_label, [])
    for kw in keywords:
        if kw in text_lower:
            found.append(f'"{kw}"')
    return found[:5]   # cap at 5


def _build_explanation(
    emotion: str,
    emotion_conf: float,
    threat: str,
    threat_conf: float,
    risk_level: str,
    transcript: str,
) -> list[str]:
    explanation = []

    # Emotion signal
    explanation.append(
        f"{emotion.capitalize()} vocal tone detected ({emotion_conf*100:.1f}% confidence)"
    )

    # NLP threat signal
    if threat != "safe":
        explanation.append(
            f"{threat.capitalize()} language pattern detected ({threat_conf*100:.1f}% confidence)"
        )

    # Keyword triggers
    triggers = _find_triggers(transcript, threat)
    if triggers:
        explanation.append(f"Trigger phrases found: {', '.join(triggers)}")

    # Risk escalation reason
    if risk_level == "CRITICAL":
        explanation.append("Risk escalated to CRITICAL: high-confidence dangerous content")
    elif risk_level == "HIGH":
        explanation.append("Risk escalated to HIGH: combination of emotion and threat signals")
    elif risk_level == "MEDIUM":
        explanation.append("Moderate risk: emotion elevated but text content unclear")

    return explanation


# ──────────────────────────────────────────────────────────────────────────────
# Main builder
# ──────────────────────────────────────────────────────────────────────────────

def build_risk_report(
    stt: dict,
    emotion: dict,
    threat: dict,
    risk_level: str,
    runtime_seconds: float,
) -> dict:
    """
    Assembles the final structured JSON response for /predict/full.

    Parameters
    ----------
    stt          : result from transcribe_audio()
    emotion      : result from predict_emotion()
    threat       : result from predict_threat()
    risk_level   : string from fuse()
    runtime_seconds : total wall-clock time

    Returns
    -------
    Full risk report dict (JSON-serializable)
    """
    transcript     = stt.get("transcript", "")
    emotion_label  = emotion["predicted_emotion"]
    emotion_conf   = emotion["confidence"]
    threat_label   = threat["predicted_threat"]
    threat_conf    = threat["confidence"]

    explanation    = _build_explanation(
        emotion_label, emotion_conf,
        threat_label,  threat_conf,
        risk_level, transcript,
    )

    recommendation = _get_recommendation(risk_level, threat_label)

    return {
        "threat_level":     risk_level,
        "emotion": {
            "label":      emotion_label,
            "confidence": emotion_conf,
            "scores":     emotion["scores"],
        },
        "threat": {
            "label":      threat_label,
            "confidence": threat_conf,
            "scores":     threat["scores"],
        },
        "transcript":     transcript,
        "language":       stt.get("language", "unknown"),
        "recommendation": recommendation,
        "explanation":    explanation,
        "runtime_seconds": round(runtime_seconds, 2),
    }
