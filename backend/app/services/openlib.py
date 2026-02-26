import httpx
from app.models.item import CatalogItem, ItemType

OPENLIB_URL = "https://openlibrary.org"

async def search_by_barcode(barcode: str) -> CatalogItem | None:
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{OPENLIB_URL}/isbn/{barcode}.json")
        if resp.status_code != 200:
            return None
        data = resp.json()
        return CatalogItem(
            type=ItemType.cd_book,
            title=data.get("title", ""),
            barcode=barcode,
            cover_url=f"https://covers.openlibrary.org/b/isbn/{barcode}-M.jpg"
        )

async def search_by_title(title: str) -> CatalogItem | None:
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{OPENLIB_URL}/search.json", params={"title": title, "limit": 1})
        data = resp.json()
        docs = data.get("docs", [])
        if not docs:
            return None
        doc = docs[0]
        cover_id = doc.get("cover_i")
        return CatalogItem(
            type=ItemType.cd_book,
            title=doc.get("title", ""),
            year=doc.get("first_publish_year"),
            author=", ".join(doc.get("author_name", [])),
            cover_url=f"https://covers.openlibrary.org/b/id/{cover_id}-M.jpg" if cover_id else None,
        )
