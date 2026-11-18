from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    whisper_model: str = os.getenv("WHISPER_MODEL", "tiny")
    whisper_device: str = os.getenv("WHISPER_DEVICE", "cpu")
    whisper_compute_type: str = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
    translation_provider: str = os.getenv("TRANSLATION_PROVIDER", "libretranslate")
    translation_api_url: str = os.getenv(
        "TRANSLATION_API_URL", "http://host.docker.internal:5000/translate"
    )
    translation_api_key: str | None = os.getenv("TRANSLATION_API_KEY")
    max_audio_size_bytes: int = int(
        os.getenv("MAX_AUDIO_SIZE_BYTES", str(25 * 1024 * 1024))
    )


settings = Settings()
