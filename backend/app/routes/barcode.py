from fastapi import APIRouter, HTTPException
from typing import List
from app.models.item import BarcodeRequest, CatalogItem, ItemType
from app.services import omdb, openlib

router = APIRouter()


@router.post("/barcode", response_model=CatalogItem)
async def scan_barcode(request: BarcodeRequest):
    """Search by barcode (numeric) — OMDb for movies, Open Library for books."""
    if request.item_type == ItemType.dvd:
        result = await omdb.search_by_barcode(request.barcode)
        if not result:
            result = await omdb.search_by_title(request.barcode)
    else:
        result = await openlib.search_by_barcode(request.barcode)

    if not result:
        raise HTTPException(status_code=404, detail="Not found by barcode")
    return result


@router.post("/search", response_model=List[CatalogItem])
async def search_items(request: BarcodeRequest):
    """Search by title query — returns up to 5 results to choose from."""
    if request.item_type == ItemType.dvd:
        results = await omdb.search_multiple(request.barcode)
    else:
        results = await openlib.search_multiple(request.barcode)

    if not results:
        raise HTTPException(status_code=404, detail="Nothing found")
    return results
