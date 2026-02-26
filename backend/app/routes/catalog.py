from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.models.item import CatalogItem
from app.services import firestore

router = APIRouter()

@router.get("/", response_model=List[CatalogItem])
async def get_catalog(search: Optional[str] = None, item_type: Optional[str] = None):
    """Получить каталог с опциональным поиском и фильтром по типу"""
    return await firestore.get_items(search=search, item_type=item_type)

@router.post("/", response_model=CatalogItem)
async def add_item(item: CatalogItem):
    """Добавить диск в каталог"""
    return await firestore.add_item(item)

@router.delete("/{item_id}")
async def delete_item(item_id: str):
    """Удалить диск из каталога"""
    await firestore.delete_item(item_id)
    return {"status": "deleted"}
