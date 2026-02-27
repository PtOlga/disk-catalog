import httpx
from app.config import settings
from app.models.item import CatalogItem, ItemType

OMDB_URL = "http://www.omdbapi.com/"


async def search_by_barcode(barcode: str) -> CatalogItem | None:
    """Search by IMDb ID or exact barcode lookup."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(OMDB_URL, params={
            "apikey": settings.omdb_api_key,
            "i": barcode,
            "type": "movie"
        })
        data = resp.json()
        if data.get("Response") == "False":
            return None
        return _to_item(data)


async def search_by_title(title: str) -> CatalogItem | None:
    """Search by exact title, return first match."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(OMDB_URL, params={
            "apikey": settings.omdb_api_key,
            "t": title,
            "type": "movie"
        })
        data = resp.json()
        if data.get("Response") == "False":
            return None
        return _to_item(data)


async def search_multiple(query: str) -> list[CatalogItem]:
    """Search by title query, return up to 5 results."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(OMDB_URL, params={
            "apikey": settings.omdb_api_key,
            "s": query,
            "type": "movie"
        })
        data = resp.json()
        if data.get("Response") == "False":
            return []
        results = []
        for item in data.get("Search", [])[:5]:
            year_str = item.get("Year", "N/A")
            results.append(CatalogItem(
                type=ItemType.dvd,
                title=item.get("Title", ""),
                year=int(year_str[:4]) if year_str != "N/A" and year_str[:4].isdigit() else None,
                cover_url=item.get("Poster") if item.get("Poster") != "N/A" else None,
            ))
        return results


def _to_item(data: dict) -> CatalogItem:
    return CatalogItem(
        type=ItemType.dvd,
        title=data.get("Title", ""),
        year=int(data["Year"][:4]) if data.get("Year", "N/A") != "N/A" else None,
        genre=data.get("Genre", "").split(",")[0].strip(),
        author=data.get("Director", ""),
        cover_url=data.get("Poster") if data.get("Poster") != "N/A" else None,
    )
