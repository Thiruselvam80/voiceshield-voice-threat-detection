from training.nlp.trainer.nlp_trainer import NLPThreatTrainer


def main():
    trainer = NLPThreatTrainer()
    trainer.train()
    trainer.evaluate()
    trainer.save()


if __name__ == "__main__":
    main()
