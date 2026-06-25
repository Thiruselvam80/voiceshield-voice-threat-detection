from fastapi import APIRouter, UploadFile, File
import os
import shutil

from app.services.emotion import predict_emotion

router = APIRouter()

UPLOAD_DIR = "app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/emotion")
async def emotion(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = predict_emotion(file_path)

    return result