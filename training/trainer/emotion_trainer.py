from pathlib import Path

import torch
import torch.nn.functional as F

from transformers import (
    AutoFeatureExtractor,
    Wav2Vec2ForSequenceClassification,
    TrainingArguments,
    Trainer,
    EarlyStoppingCallback,
)

from training.configs.config import (
    MODEL_NAME,
    OUTPUT_DIR,
    NUM_LABELS,
    LEARNING_RATE,
    BATCH_SIZE,
    EPOCHS,
)

from training.datasets.emotion_dataset import load_dataset
from training.utils.data_collator import DataCollatorCTCWithPadding
from training.utils.metrics import compute_metrics
from training.utils.class_weights import compute_class_weights


# ---------------------------------------------------
# Weighted Trainer
# ---------------------------------------------------

class WeightedTrainer(Trainer):
    """
    Trainer subclass that applies balanced class weights
    to the cross-entropy loss to handle label imbalance.
    """

    def __init__(self, *args, class_weights: torch.Tensor, **kwargs):

        super().__init__(*args, **kwargs)

        # Store weights; move to device lazily in compute_loss
        self.class_weights = class_weights

    def compute_loss(self, model, inputs, return_outputs=False, **kwargs):

        labels = inputs.pop("labels")

        outputs = model(**inputs)

        logits = outputs.logits

        # Move weights to the same device as logits
        weights = self.class_weights.to(logits.device)

        loss = F.cross_entropy(logits, labels, weight=weights)

        return (loss, outputs) if return_outputs else loss


class EmotionTrainer:

    def __init__(self):

        print("=" * 60)
        print("Initializing Emotion Recognition Trainer")
        print("=" * 60)

        # ----------------------------------------------------
        # Feature Extractor
        # ----------------------------------------------------

        print("\nLoading Feature Extractor...")

        self.feature_extractor = AutoFeatureExtractor.from_pretrained(
            MODEL_NAME
        )

        # ----------------------------------------------------
        # Dataset
        # ----------------------------------------------------

        root = Path(__file__).resolve().parents[2]

        train_csv = root / "training" / "data" / "train.csv"
        val_csv = root / "training" / "data" / "val.csv"
        test_csv = root / "training" / "data" / "test.csv"

        print("Loading datasets...")

        self.train_dataset = load_dataset(train_csv)
        self.val_dataset = load_dataset(val_csv)
        self.test_dataset = load_dataset(test_csv)

        print(f"Train Samples      : {len(self.train_dataset)}")
        print(f"Validation Samples : {len(self.val_dataset)}")
        print(f"Test Samples       : {len(self.test_dataset)}")

        # ----------------------------------------------------
        # Label Mapping
        # ----------------------------------------------------

        id2label = {
            0: "neutral",
            1: "happy",
            2: "sad",
            3: "angry",
            4: "fear",
            5: "disgust",
        }

        label2id = {v: k for k, v in id2label.items()}

        # ----------------------------------------------------
        # Model
        # ----------------------------------------------------

        print("\nLoading Wav2Vec2 Model...")

        self.model = Wav2Vec2ForSequenceClassification.from_pretrained(
            MODEL_NAME,
            num_labels=NUM_LABELS,
            id2label=id2label,
            label2id=label2id,
            ignore_mismatched_sizes=True,
        )

        # Reduce GPU memory usage
        self.model.gradient_checkpointing_enable()

        # Enable SpecAugment
        self.model.config.apply_spec_augment = True

        # ----------------------------------------------------
        # Data Collator
        # ----------------------------------------------------

        self.collator = DataCollatorCTCWithPadding(
            feature_extractor=self.feature_extractor
        )

        # ----------------------------------------------------
        # Training Arguments
        # ----------------------------------------------------

        self.training_args = TrainingArguments(

            output_dir=str(OUTPUT_DIR),

            overwrite_output_dir=True,

            learning_rate=LEARNING_RATE,

            warmup_ratio=0.1,

            weight_decay=0.01,

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

            # ---- Speed optimisations (RTX 3050 Ampere) ----

            # TF32: free ~20% throughput on Ampere, no accuracy loss
            tf32=True,

            # Group samples of similar length → less padding per batch
            group_by_length=True,

            # Fused CUDA kernels for the Adam optimizer step
            optim="adamw_torch_fused",

            # ------------------------------------------------

            dataloader_num_workers=0,

            dataloader_pin_memory=True,

            remove_unused_columns=False,

            logging_dir=str(OUTPUT_DIR / "logs"),

            report_to="tensorboard",
        )

        # ----------------------------------------------------
        # Class Weights
        # ----------------------------------------------------

        root = Path(__file__).resolve().parents[2]
        train_csv = root / "training" / "data" / "train.csv"

        print("\nComputing class weights from training data...")

        class_weights = compute_class_weights(train_csv, NUM_LABELS)

        print(f"Class weights : {class_weights.tolist()}")

        # ----------------------------------------------------
        # Trainer
        # ----------------------------------------------------

        self.trainer = WeightedTrainer(

            model=self.model,

            args=self.training_args,

            train_dataset=self.train_dataset,

            eval_dataset=self.val_dataset,

            processing_class=self.feature_extractor,

            data_collator=self.collator,

            compute_metrics=compute_metrics,

            class_weights=class_weights,

            callbacks=[
                EarlyStoppingCallback(
                    early_stopping_patience=3
                )
            ],
        )

    # ----------------------------------------------------
    # Train
    # ----------------------------------------------------

    def train(self):

        print("\n" + "=" * 60)
        print("Starting Training...")
        print("=" * 60)

        self.trainer.train()

    # ----------------------------------------------------
    # Evaluate
    # ----------------------------------------------------

    def evaluate(self):

        print("\nEvaluating...\n")

        metrics = self.trainer.evaluate(
            self.test_dataset
        )

        print(metrics)

        return metrics

    # ----------------------------------------------------
    # Save
    # ----------------------------------------------------

    def save(self):

        print("\nSaving model...\n")

        self.trainer.save_model(
            OUTPUT_DIR
        )

        self.feature_extractor.save_pretrained(
            OUTPUT_DIR
        )

        print("=" * 60)
        print("Model Saved Successfully!")
        print(OUTPUT_DIR)
        print("=" * 60)