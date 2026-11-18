from collections.abc import Awaitable, Callable
from contextlib import asynccontextmanager
from pathlib import Path
import tempfile

from fastapi import UploadFile

from app.exceptions import AudioValidationError


ALLOWED_AUDIO_EXTENSIONS = {".m4a", ".mp3", ".wav", ".webm", ".mp4", ".mpeg", ".mpga"}


def validate_audio_filename(filename: str | None) -> str:
    if not filename:
        raise AudioValidationError("An audio filename is required.")

    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_AUDIO_EXTENSIONS:
        allowed = ", ".join(sorted(ALLOWED_AUDIO_EXTENSIONS))
        raise AudioValidationError(f"Unsupported audio format. Allowed formats: {allowed}.")
    return extension


@asynccontextmanager
async def temporary_audio_file(
    upload: UploadFile,
    max_size_bytes: int,
    chunk_size: int = 1024 * 1024,
):
    extension = validate_audio_filename(upload.filename)
    total_size = 0

    with tempfile.NamedTemporaryFile(suffix=extension, delete=True) as temporary_file:
        while chunk := await upload.read(chunk_size):
            total_size += len(chunk)
            if total_size > max_size_bytes:
                raise AudioValidationError(
                    f"Audio file exceeds the {max_size_bytes // (1024 * 1024)} MB limit."
                )
            temporary_file.write(chunk)

        if total_size == 0:
            raise AudioValidationError("The uploaded audio file is empty.")

        temporary_file.flush()
        yield temporary_file.name
