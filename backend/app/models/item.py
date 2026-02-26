from pydantic import BaseModel
from typing import Optional
from enum import Enum

class ItemType(str, Enum):
    dvd = "dvd"
    cd_book = "cd_book"

class CatalogItem(BaseModel):
    id: Optional[str] = None
    type: ItemType
    title: str
    year: Optional[int] = None
    genre: Optional[str] = None
    author: Optional[str] = None      # режиссёр или автор книги
    language: Optional[str] = None
    barcode: Optional[str] = None
    cover_url: Optional[str] = None
    notes: Optional[str] = None

class BarcodeRequest(BaseModel):
    barcode: str
    item_type: ItemType = ItemType.dvd

class CoverRequest(BaseModel):
    image_base64: str                  # фото обложки в base64
    item_type: ItemType = ItemType.dvd
