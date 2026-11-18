from io import BytesIO

from app.dependencies import get_translation_service, get_transcription_service


class FakeTranscriber:
    def transcribe(self, audio_path: str, source_language: str) -> tuple[str, str]:
        assert source_language == "auto"
        with open(audio_path, "rb") as audio_file:
            assert audio_file.read() == b"audio"
        return "es", "Hola mundo"


class FakeTranslator:
    async def translate(
        self,
        text: str,
        source_language: str,
        target_language: str,
    ) -> str:
        assert (text, source_language, target_language) == ("Hola mundo", "es", "en")
        return "Hello world"


def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_translate_audio_returns_caption(client):
    app = client.app
    app.dependency_overrides[get_transcription_service] = lambda: FakeTranscriber()
    app.dependency_overrides[get_translation_service] = lambda: FakeTranslator()

    try:
        response = client.post(
            "/api/v1/translations",
            files={"audio": ("sample.m4a", BytesIO(b"audio"), "audio/mp4")},
            data={"source_language": "auto", "target_language": "en"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == {
        "detected_language": "es",
        "transcript": "Hola mundo",
        "translated_caption": "Hello world",
        "target_language": "en",
    }


def test_translate_audio_rejects_unsupported_format(client):
    response = client.post(
        "/api/v1/translations",
        files={"audio": ("sample.txt", BytesIO(b"audio"), "text/plain")},
        data={"target_language": "en"},
    )

    assert response.status_code == 400
    assert "Unsupported audio format" in response.json()["detail"]


def test_translate_audio_requires_target_language(client):
    response = client.post(
        "/api/v1/translations",
        files={"audio": ("sample.m4a", BytesIO(b"audio"), "audio/mp4")},
    )

    assert response.status_code == 422
