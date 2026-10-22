import hashlib

from django.core.cache import cache

from .providers.anilist import AniListClient


def _cached(key: str, ttl: int, loader):
    result = cache.get(key)
    if result is None:
        result = loader()
        cache.set(key, result, ttl)
    return result


def discovery_home():
    client = AniListClient()
    items = _cached("discovery:trending:v1", 900, lambda: client.trending(per_page=12))
    return {
        "shelves": [{
            "key": "trending",
            "title": "Trending now",
            "subtitle": "What the anime community is watching and discussing.",
            "items": items,
        }],
        "source": "AniList",
        "updatedAt": "live",
    }


def search_titles(term: str, page: int):
    digest = hashlib.sha256(term.casefold().encode()).hexdigest()[:16]
    result = _cached(f"search:{digest}:{page}:v1", 300, lambda: AniListClient().search(term, page))
    return {"results": result["items"], "page": result["page"]}


def title_detail(media_id: int):
    return _cached(f"title:{media_id}:v1", 3600, lambda: AniListClient().detail(media_id))
