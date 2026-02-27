import base64
from google.cloud import vision as gvision

client = gvision.ImageAnnotatorClient()


async def extract_text(image_base64: str) -> str:
    """
    Extract all text from disc cover image via Google Vision API.
    Returns full text (all lines) for better title extraction.
    """
    image_bytes = base64.b64decode(image_base64)
    image = gvision.Image(content=image_bytes)
    response = client.text_detection(image=image)

    if response.error.message:
        raise Exception(f"Vision API error: {response.error.message}")

    texts = response.text_annotations
    if not texts:
        return ""

    # Return full text — let Claude pick the title
    return texts[0].description.strip()
