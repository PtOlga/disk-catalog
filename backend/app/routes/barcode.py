from fastapi import APIRouter, HTTPException
from app.models.item import BarcodeRequest, CatalogItem, ItemType
from app.services import omdb, openlib, tvmaze
from typing import List

router = APIRouter()


@router.post("/barcode", response_model=CatalogItem)
async def scan_barcode(request: BarcodeRequest):
    """Search by barcode — OMDb for movies, Open Library for books"""
    if request.item_type == ItemType.cd_book:
        result = await openlib.search_by_barcode(request.barcode)
    else:
        result = await omdb.search_by_title(request.barcode)
        if not result:
            result = await tvmaze.search_by_title(request.barcode)

    if not result:
        raise HTTPException(status_code=404, detail="Disc not found by barcode")
    return result


@router.post("/search", response_model=List[CatalogItem])
async def search_disc(request: BarcodeRequest):
    """Search by title — returns multiple results from OMDb + TVmaze"""
    if request.item_type == ItemType.cd_book:
        results = await openlib.search_multiple(request.barcode)
        return results

    # Search OMDb
    omdb_results = await omdb.search_multiple(request.barcode)

    # Search TVmaze (good for series and non-English titles)
    tvmaze_results = await tvmaze.search_multiple(request.barcode)

    # Merge, deduplicate by title
    seen = set()
    merged = []
    for item in omdb_results + tvmaze_results:
        key = item.title.lower().strip()
        if key not in seen:
            seen.add(key)
            merged.append(item)

    return merged[:8]
