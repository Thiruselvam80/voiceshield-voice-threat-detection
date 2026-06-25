from pathlib import Path

import torch
import torch.nn.functional as F
from transformers import (
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    EarlyStoppingCallback,
)

from training.nlp.configs.nlp_config import (
    MODEL_NAME, OUTPUT_DIR, NUM_LABELS,
    BATCH_SIZE, EPOCHS, LEARNING_RATE,
    WEIGHT_DECAY, WARMUP_RATIO,
    LABEL2ID, ID2LABEL, NLP_DATA_DIR,
)
from training.nlp.datasets.nlp_dataset import load_nlp_dataset
from training.nlp.utils.metrics import compute_nlp_metrics
from training.nlp.utils.class_weights import compute_nlp_class_weights


# ─────────────────────────────────────────────────────────────
# Weighted Trainer (handles class imbalance)
# ─────────────────────────────────────────────────────────────

class WeightedNLPTrainer(Trainer):

    def __init__(self, *args, class_weights: torch.Tensor, **kwargs):
        super().__init__(*args, **kwargs)
        self.class_weights = class_weights

    def compute_loss(self, model, inputs, return_outputs=False, **kwargs):
        labels  = inputs.pop("labels")
        outputs = model(**inputs)
        logits  = outputs.logits
        weights = self.class_weights.to(logits.device)
        loss    = F.cross_entropy(logits, labels, weight=weights)
        return (loss, outputs) if return_outputs else loss


# ─────────────────────────────────────────────────────────────
# Trainer class
# ─────────────────────────────────────────────────────────────

class NLPThreatTrainer:

    def __init__(self):
        print("=" * 60)
        print("Initializing NLP Threat Detection Trainer")
        print("=" * 60)

        # ── Datasets ──────────────────────────────────────────
        print("\nLoading datasets...")

        self.train_ds = load_nlp_dataset(NLP_DATA_DIR / "train_nlp.csv")
        self.val_ds   = load_nlp_dataset(NLP_DATA_DIR / "val_nlp.csv")
        self.test_ds  = load_nlp_dataset(NLP_DATA_DIR / "test_nlp.csv")

        print(f"Train : {len(self.train_ds)}")
        print(f"Val   : {len(self.val_ds)}")
        print(f"Test  : {len(self.test_ds)}")

        # ── Model ─────────────────────────────────────────────
        print("\nLoading DistilBERT...")

        self.model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_NAME,
            num_labels=NUM_LABELS,
            id2label=ID2LABEL,
            label2id=LABEL2ID,
        )

        # ── Training Arguments ────────────────────────────────
        self.training_args = TrainingArguments(

            output_dir=str(OUTPUT_DIR),
            overwrite_output_dir=True,

            learning_rate=LEARNING_RATE,
            warmup_ratio=WARMUP_RATIO,
            weight_decay=WEIGHT_DECAY,
            max_grad_norm=1.0,
            lr_scheduler_type="cosine",

            per_device_train_batch_size=BATCH_SIZE,
            per_device_eval_batch_size=BATCH_SIZE,
            num_train_epochs=EPOCHS,

            eval_strategy="epoch",
            save_strategy="epoch",
            logging_strategy="steps",
            logging_steps=50,

            load_best_model_at_end=True,
            metric_for_best_model="f1",
            greater_is_better=True,
            save_total_limit=2,

            fp16=True,
            tf32=True,
            optim="adamw_torch_fused",

            dataloader_num_workers=0,
            dataloader_pin_memory=True,
            remove_unused_columns=False,

            logging_dir=str(OUTPUT_DIR / "logs"),
            report_to="tensorboard",
        )

        # ── Class Weights ─────────────────────────────────────
        print("\nComputing class weights...")
        class_weights = compute_nlp_class_weights(NLP_DATA_DIR / "train_nlp.csv")
        print(f"Weights: {class_weights.tolist()}")

        # ── Trainer ───────────────────────────────────────────
        self.trainer = WeightedNLPTrainer(
            model=self.model,
            args=self.training_args,
            train_dataset=self.train_ds,
            eval_dataset=self.val_ds,
            compute_metrics=compute_nlp_metrics,
            class_weights=class_weights,
            callbacks=[EarlyStoppingCallback(early_stopping_patience=3)],
        )

    def train(self):
        print("\n" + "=" * 60)
        print("Starting Training...")
        print("=" * 60)
        self.trainer.train()

    def evaluate(self):
        print("\nEvaluating on test set...")
        metrics = self.trainer.evaluate(self.test_ds)
        print(metrics)
        return metrics

    def save(self):
        print("\nSaving model...")
        self.trainer.save_model(OUTPUT_DIR)
        # Also save the tokenizer so the service can load it
        from transformers import AutoTokenizer
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        tokenizer.save_pretrained(str(OUTPUT_DIR))
        print("=" * 60)
        print("Threat Model Saved!")
        print(OUTPUT_DIR)
        print("=" * 60)
