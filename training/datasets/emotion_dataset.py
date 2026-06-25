import random

import librosa
import numpy as np
import pandas as pd

from datasets import Dataset
from transformers import AutoFeatureExtractor

from training.configs.config import MODEL_NAME, SAMPLE_RATE


# ---------------------------------------------------
# Feature Extractor
# ---------------------------------------------------

feature_extractor = AutoFeatureExtractor.from_pretrained(MODEL_NAME)


# ---------------------------------------------------
# Audio Augmentations
# ---------------------------------------------------

def add_noise(audio):

    noise = np.random.randn(len(audio))

    return audio + 0.0015 * noise


def time_shift(audio):

    shift = np.random.randint(
        -int(0.05 * len(audio)),
        int(0.05 * len(audio))
    )

    return np.roll(audio, shift)



def volume_scale(audio):

    gain = random.uniform(0.9, 1.1)

    return audio * gain


# ---------------------------------------------------
# Random Augmentation
# ---------------------------------------------------

def augment_audio(audio):

    # pitch_shift and time_stretch removed — too slow for training speed
    augmentations = [
        add_noise,
        time_shift,
        volume_scale,
    ]

    # Apply only ONE random augmentation
    augmentation = random.choice(augmentations)

    return augmentation(audio)


# ---------------------------------------------------
# Dataset Loader
# ---------------------------------------------------

def load_dataset(csv_path):

    df = pd.read_csv(csv_path)

    dataset = Dataset.from_pandas(df)

    def preprocess(batch):

        speech, _ = librosa.load(
            batch["filepath"],
            sr=SAMPLE_RATE,
            mono=True,
        )

        # ------------------------------------------------
        # Apply augmentation ONLY on 30% of training data
        # ------------------------------------------------

        if (
            "train" in str(csv_path).lower()
            and random.random() < 0.30
        ):
            speech = augment_audio(speech)

        # ------------------------------------------------
        # Feature Extraction
        # ------------------------------------------------

        # 5 s cap (80 000 samples) covers >95% of SER utterances
        # and halves padding overhead vs the previous 10 s cap
        inputs = feature_extractor(
            speech,
            sampling_rate=SAMPLE_RATE,
            max_length=80000,
            truncation=True,
        )

        batch["input_values"] = inputs.input_values[0]

        batch["labels"] = int(batch["label"])

        return batch

    dataset = dataset.map(preprocess)

    keep_columns = [
        "input_values",
        "labels",
    ]

    remove_columns = [
        col
        for col in dataset.column_names
        if col not in keep_columns
    ]

    dataset = dataset.remove_columns(remove_columns)

    return dataset