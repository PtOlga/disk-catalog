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
    author: Optional[str] = None
    language: Optional[str] = None
    barcode: Optional[str] = None
    cover_url: Optional[str] = None
    notes: Optional[str] = None
    series_name: Optional[str] = None
    season: Optional[int] = None
    episodes: Optional[str] = None

class BarcodeRequest(BaseModel):
    barcode: str
    item_type: ItemType = ItemType.dvd

class CoverRequest(BaseModel):
    image_base64: str
    item_type: ItemType = ItemType.dvd
    auto_translate: bool = False  # if True, use Claude to translate title to English
