from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status

from app.config import settings
from app.dependencies import get_translation_service, get_transcription_service
from app.exceptions import AudioValidationError, ModelServiceError, TranslationServiceError
from app.schemas import HealthResponse, TranslationResponse
from app.services.translation import TranslationService
from app.services.whisper import WhisperTranscriber
from app.utils.audio import temporary_audio_file


app = FastAPI(title="VoxLingo API", version="1.0.0")


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post(
    "/api/v1/translations",
    response_model=TranslationResponse,
    status_code=status.HTTP_200_OK,
)
async def translate_audio(
    audio: UploadFile = File(...),
    target_language: str = Form(..., min_length=2, max_length=5),
    source_language: str = Form("auto", min_length=2, max_length=5),
    transcriber: WhisperTranscriber = Depends(get_transcription_service),
    translator: TranslationService = Depends(get_translation_service),
) -> TranslationResponse:
    target_language = target_language.lower()
    source_language = source_language.lower()

    try:
        async with temporary_audio_file(audio, settings.max_audio_size_bytes) as audio_path:
            detected_language, transcript = transcriber.transcribe(
                audio_path, source_language
            )
        translated_caption = await translator.translate(
            transcript, detected_language, target_language
        )
    except AudioValidationError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except ModelServiceError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except TranslationServiceError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error

    return TranslationResponse(
        detected_language=detected_language,
        transcript=transcript,
        translated_caption=translated_caption,
        target_language=target_language,
    )
