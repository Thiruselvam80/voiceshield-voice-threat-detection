import numpy as np
from sklearn.metrics import accuracy_score, f1_score


def compute_nlp_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    return {
        "accuracy": float(accuracy_score(labels, preds)),
        "f1":       float(f1_score(labels, preds, average="weighted")),
    }
