from faster_whisper import WhisperModel
import os

print("Loading Whisper model...")

# Load model only once
model = WhisperModel(
    "base",
    device="cpu",          # Change to "cuda" if GPU is available
    compute_type="float32" # Better compatibility on Windows
)

print("Whisper model loaded successfully!")


def transcribe_audio(audio_path: str):
    try:
        # Check if file exists
        if not os.path.exists(audio_path):
            return {
                "error": f"File not found: {audio_path}"
            }

        print(f"\nProcessing file: {audio_path}")

        # Transcribe audio
        segments, info = model.transcribe(
            audio_path,
            beam_size=5,
            vad_filter=False
        )

        # Convert generator to list
        segments = list(segments)

        print(f"Language: {info.language}")
        print(f"Language Probability: {info.language_probability}")
        print(f"Number of Segments: {len(segments)}")

        transcript = ""

        for i, segment in enumerate(segments):
            print(
                f"Segment {i+1}: "
                f"[{segment.start:.2f}s - {segment.end:.2f}s] "
                f"{segment.text}"
            )
            transcript += segment.text + " "

        transcript = transcript.strip()

        if transcript == "":
            print("⚠ No speech detected in the audio.")

        return {
            "language": info.language,
            "language_probability": info.language_probability,
            "transcript": transcript
        }

    except Exception as e:
        print(f"Transcription Error: {e}")

        return {
            "error": str(e)
        }