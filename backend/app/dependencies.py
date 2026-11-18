from functools import lru_cache

from app.config import settings
from app.services.translation import TranslationService
from app.services.whisper import WhisperTranscriber, get_transcriber


@lru_cache(maxsize=1)
def get_transcription_service() -> WhisperTranscriber:
    return get_transcriber(
        settings.whisper_model,
        settings.whisper_device,
        settings.whisper_compute_type,
    )


@lru_cache(maxsize=1)
def get_translation_service() -> TranslationService:
    return TranslationService(
        settings.translation_provider,
        settings.translation_api_url,
        settings.translation_api_key,
    )
