import numpy as np
import pandas as pd
import torch
from sklearn.utils.class_weight import compute_class_weight

from training.nlp.configs.nlp_config import NUM_LABELS


def compute_nlp_class_weights(train_csv) -> torch.Tensor:
    df = pd.read_csv(train_csv)
    labels = df["label"].values
    classes = np.arange(NUM_LABELS)

    weights = compute_class_weight(
        class_weight="balanced",
        classes=classes,
        y=labels,
    )
    return torch.tensor(weights, dtype=torch.float)
