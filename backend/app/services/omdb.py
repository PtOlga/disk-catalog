import httpx
from app.config import settings
from app.models.item import CatalogItem, ItemType

OMDB_URL = "http://www.omdbapi.com/"

async def search_by_title(title: str) -> CatalogItem | None:
    async with httpx.AsyncClient() as client:
        resp = await client.get(OMDB_URL, params={
            "apikey": settings.omdb_api_key,
            "t": title,
            "type": "movie"
        })
        data = resp.json()
        if data.get("Response") == "False":
            return None
        return CatalogItem(
            type=ItemType.dvd,
            title=data.get("Title", ""),
            year=int(data["Year"][:4]) if data.get("Year", "N/A") != "N/A" else None,
            genre=data.get("Genre", "").split(",")[0].strip(),
            author=data.get("Director", ""),
            cover_url=data.get("Poster", "") if data.get("Poster") != "N/A" else None,
        )
