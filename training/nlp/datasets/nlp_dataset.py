import pandas as pd
import torch
from torch.utils.data import Dataset
from transformers import AutoTokenizer

from training.nlp.configs.nlp_config import MODEL_NAME, MAX_LENGTH

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)


class ThreatDataset(Dataset):

    def __init__(self, csv_path):
        df = pd.read_csv(csv_path)
        self.texts  = df["text"].tolist()
        self.labels = df["label"].tolist()

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        encoding = tokenizer(
            self.texts[idx],
            max_length=MAX_LENGTH,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )
        return {
            "input_ids":      encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0),
            "labels":         torch.tensor(self.labels[idx], dtype=torch.long),
        }


def load_nlp_dataset(csv_path):
    return ThreatDataset(csv_path)
