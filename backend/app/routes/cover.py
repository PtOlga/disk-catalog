from fastapi import APIRouter, HTTPException
from app.models.item import CoverRequest, CatalogItem
from app.services import vision, omdb, openlib

router = APIRouter()

@router.post("/cover", response_model=CatalogItem)
async def scan_cover(request: CoverRequest):
    """OCR обложки через Vision API → поиск по названию"""
    text = await vision.extract_text(request.image_base64)
    if not text:
        raise HTTPException(status_code=400, detail="Не удалось распознать текст на обложке")

    # Пробуем найти как фильм, потом как книгу
    result = await omdb.search_by_title(text) or await openlib.search_by_title(text)
    if not result:
        raise HTTPException(status_code=404, detail=f"Не найдено по тексту: {text}")
    return result
