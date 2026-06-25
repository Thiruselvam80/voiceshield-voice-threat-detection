from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

MODEL_NAME = "facebook/wav2vec2-base"

CSV_PATH = ROOT / "training" / "data" / "merged.csv"

OUTPUT_DIR = ROOT / "training" / "models" / "emotion_model"

SAMPLE_RATE = 16000

NUM_LABELS = 6

LABELS = [
    "neutral",
    "happy",
    "sad",
    "angry",
    "fear",
    "disgust",
]

BATCH_SIZE = 8

EPOCHS = 12

LEARNING_RATE = 1e-5

LABEL_COLUMN = "label"