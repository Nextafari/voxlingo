from typing import Any

import httpx

from app.exceptions import TranslationServiceError


class TranslationService:
    def __init__(
        self,
        provider: str,
        api_url: str,
        api_key: str | None = None,
    ) -> None:
        self.provider = provider
        self.api_url = api_url
        self.api_key = api_key

    async def translate(
        self,
        text: str,
        source_language: str,
        target_language: str,
    ) -> str:
        if source_language == target_language:
            return text

        if self.provider != "libretranslate":
            raise TranslationServiceError(
                f"Unsupported translation provider: {self.provider}."
            )

        payload: dict[str, Any] = {
            "q": text,
            "source": source_language,
            "target": target_language,
            "format": "text",
        }
        headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(self.api_url, json=payload, headers=headers)
                response.raise_for_status()
                translated_text = response.json().get("translatedText")
        except (httpx.HTTPError, ValueError) as error:
            raise TranslationServiceError(
                "The translation provider could not process the transcript."
            ) from error

        if not isinstance(translated_text, str) or not translated_text.strip():
            raise TranslationServiceError("The translation provider returned no caption.")
        return translated_text.strip()
