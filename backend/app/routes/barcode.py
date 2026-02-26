from fastapi import APIRouter, HTTPException
from app.models.item import BarcodeRequest, CatalogItem, ItemType
from app.services import omdb, openlib

router = APIRouter()

@router.post("/barcode", response_model=CatalogItem)
async def scan_barcode(request: BarcodeRequest):
    """Поиск по штрихкоду — OMDb для фильмов, Open Library для книг"""
    if request.item_type == ItemType.dvd:
        result = await omdb.search_by_title(request.barcode)
    else:
        result = await openlib.search_by_barcode(request.barcode)

    if not result:
        raise HTTPException(status_code=404, detail="Диск не найден по штрихкоду")
    return result
