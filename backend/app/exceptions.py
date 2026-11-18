class BackendServiceError(Exception):
    """Base exception for expected service failures."""


class AudioValidationError(BackendServiceError):
    """Raised when an uploaded audio file is invalid."""


class ModelServiceError(BackendServiceError):
    """Raised when speech transcription cannot be completed."""


class TranslationServiceError(BackendServiceError):
    """Raised when caption translation cannot be completed."""
