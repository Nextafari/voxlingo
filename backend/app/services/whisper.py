from functools import lru_cache
from typing import Any

from app.exceptions import ModelServiceError


class WhisperTranscriber:
    def __init__(
        self,
        model_name: str,
        device: str,
        compute_type: str,
    ) -> None:
        self.model_name = model_name
        self.device = device
        self.compute_type = compute_type
        self._model: Any | None = None

    def _get_model(self) -> Any:
        if self._model is None:
            try:
                from faster_whisper import WhisperModel

                self._model = WhisperModel(
                    self.model_name,
                    device=self.device,
                    compute_type=self.compute_type,
                )
            except Exception as error:
                raise ModelServiceError(
                    "Whisper Tiny could not be loaded. Check model dependencies and configuration."
                ) from error
        return self._model

    def transcribe(self, audio_path: str, source_language: str) -> tuple[str, str]:
        try:
            language = None if source_language == "auto" else source_language
            segments, info = self._get_model().transcribe(
                audio_path,
                language=language,
                task="transcribe",
                vad_filter=True,
            )
            transcript = " ".join(segment.text.strip() for segment in segments).strip()
            detected_language = language or info.language
        except ModelServiceError:
            raise
        except Exception as error:
            raise ModelServiceError("Whisper could not transcribe the audio.") from error

        if not transcript:
            raise ModelServiceError("Whisper did not detect speech in the audio.")
        return detected_language, transcript


@lru_cache(maxsize=1)
def get_transcriber(model_name: str, device: str, compute_type: str) -> WhisperTranscriber:
    return WhisperTranscriber(model_name, device, compute_type)
