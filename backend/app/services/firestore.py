from google.cloud import firestore
from typing import List, Optional
from app.models.item import CatalogItem

db = firestore.Client()
COLLECTION = "disks"

async def get_items(search: Optional[str] = None, item_type: Optional[str] = None) -> List[CatalogItem]:
    ref = db.collection(COLLECTION)
    docs = ref.stream()
    items = [CatalogItem(id=doc.id, **doc.to_dict()) for doc in docs]

    if item_type:
        items = [i for i in items if i.type == item_type]
    if search:
        s = search.lower()
        items = [i for i in items if s in i.title.lower()]
    return items

async def add_item(item: CatalogItem) -> CatalogItem:
    data = item.model_dump(exclude={"id"})
    _time, ref = db.collection(COLLECTION).add(data)
    item.id = ref.id
    return item

async def delete_item(item_id: str):
    db.collection(COLLECTION).document(item_id).delete()
