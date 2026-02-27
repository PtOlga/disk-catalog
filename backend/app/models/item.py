from pydantic import BaseModel
from typing import Optional
from enum import Enum

class ItemType(str, Enum):
    dvd = "dvd"
    cd_book = "cd_book"
    series = "series"

class CatalogItem(BaseModel):
    id: Optional[str] = None
    type: ItemType
    title: str
    year: Optional[int] = None
    genre: Optional[str] = None
    author: Optional[str] = None      # director or book author
    language: Optional[str] = None
    barcode: Optional[str] = None
    cover_url: Optional[str] = None
    notes: Optional[str] = None
    # Series-specific fields
    series_name: Optional[str] = None  # name of the TV series
    season: Optional[int] = None       # season number
    episodes: Optional[str] = None     # e.g. "1-4" or "1,3,5"

class BarcodeRequest(BaseModel):
    barcode: str
    item_type: ItemType = ItemType.dvd

class CoverRequest(BaseModel):
    image_base64: str
    item_type: ItemType = ItemType.dvd
