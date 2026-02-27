from fastapi import APIRouter, HTTPException
from app.models.item import CoverRequest, CatalogItem
from app.services import vision, omdb, openlib, google_translate

router = APIRouter()


@router.post("/cover", response_model=CatalogItem)
async def scan_cover(request: CoverRequest):
    """OCR cover image → optionally translate → search in OMDb/OpenLibrary"""
    full_text = await vision.extract_text(request.image_base64)
    if not full_text:
        raise HTTPException(status_code=400, detail="Could not read text from cover")

    if request.auto_translate:
        # Use Claude to extract title and translate to English
        search_title = await google_translate.extract_and_translate_title(
            full_text, request.item_type.value
        )
    else:
        # Just use the first line as before
        search_title = full_text.split("\n")[0].strip()

    if not search_title:
        raise HTTPException(status_code=400, detail="Could not extract title from cover")

    # Search by item type
    if request.item_type.value == "cd_book":
        result = await openlib.search_by_title(search_title)
    else:
        result = await omdb.search_by_title(search_title)
        if not result:
            result = await omdb.search_multiple(search_title)
            result = result[0] if result else None

    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Not found: '{search_title}'"
        )
    return result
