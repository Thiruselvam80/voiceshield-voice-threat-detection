import numpy as np
import pandas as pd
import torch

from sklearn.utils.class_weight import compute_class_weight


# ---------------------------------------------------
# Class Weight Computation
# ---------------------------------------------------

def compute_class_weights(train_csv_path, num_labels: int) -> torch.Tensor:
    """
    Compute balanced class weights from the training CSV.

    Uses sklearn's 'balanced' strategy:
        weight[i] = n_samples / (n_classes * count[i])

    Returns a float32 torch.Tensor of shape (num_labels,),
    ordered by label index 0 … num_labels-1.
    """

    df = pd.read_csv(train_csv_path)

    labels = df["label"].values

    classes = np.arange(num_labels)

    weights = compute_class_weight(
        class_weight="balanced",
        classes=classes,
        y=labels,
    )

    return torch.tensor(weights, dtype=torch.float32)
