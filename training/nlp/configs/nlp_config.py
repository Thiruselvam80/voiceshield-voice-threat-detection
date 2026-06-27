from pathlib import Path

# --------------------------------------------------
# Paths
# --------------------------------------------------

ROOT = Path(__file__).resolve().parents[3]   # callshield-ai/

NLP_DATA_DIR = ROOT / "training" / "nlp" / "data"

OUTPUT_DIR = ROOT / "training" / "models" / "threat_model"

# --------------------------------------------------
# Model
# --------------------------------------------------

MODEL_NAME = "distilbert-base-uncased"

MAX_LENGTH = 128      # token limit — covers 99% of call transcript sentences

# --------------------------------------------------
# Labels
# --------------------------------------------------

NUM_LABELS = 5

LABELS = ["safe", "scam", "harassment", "violence", "emergency"]

LABEL2ID = {label: i for i, label in enumerate(LABELS)}

ID2LABEL = {i: label for i, label in enumerate(LABELS)}

# --------------------------------------------------
# Training
# --------------------------------------------------

BATCH_SIZE = 32       # Text is tiny vs audio — can use much larger batch

EPOCHS = 6

LEARNING_RATE = 2e-5

WEIGHT_DECAY = 0.01

WARMUP_RATIO = 0.1
