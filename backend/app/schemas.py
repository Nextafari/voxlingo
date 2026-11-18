from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str


class TranslationResponse(BaseModel):
    detected_language: str = Field(..., description="ISO 639-1 code detected by Whisper")
    transcript: str
    translated_caption: str
    target_language: str = Field(..., description="ISO 639-1 target language code")
