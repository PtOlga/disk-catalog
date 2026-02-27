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
    results = await search_multiple(title)
    return results[0] if results else None


async def search_multiple(query: str) -> list[CatalogItem]:
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{OPENLIB_URL}/search.json", params={"title": query, "limit": 5})
        data = resp.json()
        docs = data.get("docs", [])
        results = []
        for doc in docs:
            cover_id = doc.get("cover_i")
            results.append(CatalogItem(
                type=ItemType.cd_book,
                title=doc.get("title", ""),
                year=doc.get("first_publish_year"),
                author=", ".join(doc.get("author_name", [])),
                cover_url=f"https://covers.openlibrary.org/b/id/{cover_id}-M.jpg" if cover_id else None,
            ))
        return results
