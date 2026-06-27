from fastapi import APIRouter, UploadFile, File
import shutil
import os

from app.services.speech_to_text import transcribe_audio

router = APIRouter()

UPLOAD_DIR = "app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = transcribe_audio(file_path)

    return result