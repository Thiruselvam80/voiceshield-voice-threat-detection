from training.trainer.emotion_trainer import EmotionTrainer


def main():

    trainer = EmotionTrainer()

    trainer.train()

    trainer.evaluate()

    trainer.save()


if __name__ == "__main__":
    main()