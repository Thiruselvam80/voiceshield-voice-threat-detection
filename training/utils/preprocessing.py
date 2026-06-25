import librosa


def load_audio(path):
    """
    Load an audio file and resample it to 16 kHz mono.
    """

    speech, _ = librosa.load(
        path,
        sr=16000,
        mono=True
    )

    return speech