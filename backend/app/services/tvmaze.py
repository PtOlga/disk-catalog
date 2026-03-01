import httpx
from app.models.item import CatalogItem, ItemType

TVMAZE_URL = "https://api.tvmaze.com"


async def search_by_title(title: str) -> CatalogItem | None:
    """Search for a TV show by title using TVmaze API (free, no key required)."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{TVMAZE_URL}/singlesearch/shows",
                params={"q": title}
            )
            if resp.status_code != 200:
                return None
            data = resp.json()

            # Get poster image
            cover_url = None
            if data.get("image"):
                cover_url = data["image"].get("original") or data["image"].get("medium")

            # Get genre
            genres = data.get("genres", [])
            genre = genres[0] if genres else None

            # Get year from premiere date
            year = None
            premiered = data.get("premiered", "")
            if premiered:
                try:
                    year = int(premiered[:4])
                except ValueError:
                    pass

            return CatalogItem(
                type=ItemType.series if data.get("type") in ("Scripted", "Animation", "Reality", "Documentary") else ItemType.dvd,
                title=data.get("name", title),
                year=year,
                genre=genre,
                author=None,
                language=data.get("language"),
                cover_url=cover_url,
            )
    except Exception:
        return None


async def search_multiple(title: str) -> list[CatalogItem]:
    """Search for multiple TV shows by title using TVmaze API."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{TVMAZE_URL}/search/shows",
                params={"q": title}
            )
            if resp.status_code != 200:
                return []

            results = []
            for entry in resp.json()[:5]:
                show = entry.get("show", {})
                cover_url = None
                if show.get("image"):
                    cover_url = show["image"].get("original") or show["image"].get("medium")
                genres = show.get("genres", [])
                year = None
                premiered = show.get("premiered", "")
                if premiered:
                    try:
                        year = int(premiered[:4])
                    except ValueError:
                        pass
                results.append(CatalogItem(
                    type=ItemType.series,
                    title=show.get("name", ""),
                    year=year,
                    genre=genres[0] if genres else None,
                    language=show.get("language"),
                    cover_url=cover_url,
                ))
            return results
    except Exception:
        return []
