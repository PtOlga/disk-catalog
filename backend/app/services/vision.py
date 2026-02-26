import base64
from google.cloud import vision as gvision

client = gvision.ImageAnnotatorClient()

async def extract_text(image_base64: str) -> str:
    """Распознаёт текст на обложке диска через Google Vision API.
    Возвращает первую строку — обычно это название."""
    image_bytes = base64.b64decode(image_base64)
    image = gvision.Image(content=image_bytes)
    response = client.text_detection(image=image)

    if response.error.message:
        raise Exception(f"Vision API error: {response.error.message}")

    texts = response.text_annotations
    if not texts:
        return ""

    # Первый элемент — весь текст, берём первую строку (обычно название)
    full_text = texts[0].description
    first_line = full_text.split("\n")[0].strip()
    return first_line
