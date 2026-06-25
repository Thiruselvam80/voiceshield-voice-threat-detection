from dataclasses import dataclass
import torch


@dataclass
class DataCollatorCTCWithPadding:

    feature_extractor: object

    def __call__(self, features):

        batch = self.feature_extractor.pad(
            {
                "input_values": [
                    feature["input_values"]
                    for feature in features
                ]
            },
            padding=True,
            return_tensors="pt",
        )

        batch["labels"] = torch.tensor(
            [
                feature["labels"]
                for feature in features
            ],
            dtype=torch.long,
        )

        return batch