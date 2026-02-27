import httpx
from app.config import settings


async def extract_and_translate_title(cover_text: str, item_type: str) -> str:
    """
    Use Google Cloud Translation API to detect and translate cover text to English.
    Then returns the first line (most likely the title).
    """
    first_line = cover_text.split("\n")[0].strip()
    if not first_line:
        return first_line

    project_id = settings.google_cloud_project
    if not project_id:
        return first_line

    url = f"https://translation.googleapis.com/v3/projects/{project_id}:translateText"

    # Use Application Default Credentials via metadata server (works in Cloud Run)
    token = await _get_access_token()
    if not token:
        return first_line

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                url,
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json={
                    "contents": [first_line],
                    "targetLanguageCode": "en",
                    "mimeType": "text/plain",
                }
            )
            data = resp.json()
            translated = data["translations"][0]["translatedText"]
            return translated.strip()
    except Exception:
        return first_line


async def _get_access_token() -> str:
    """Get access token from GCP metadata server (works automatically in Cloud Run)."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(
                "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
                headers={"Metadata-Flavor": "Google"}
            )
            return resp.json().get("access_token", "")
    except Exception:
        return ""
