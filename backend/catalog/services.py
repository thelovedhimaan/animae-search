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
    items = _cached("discovery:home:v2", 900, lambda: AniListClient().discovery(per_page=10))
    return {
        "shelves": [
            {"key": "trending", "title": "Trending now", "subtitle": "What the anime community is watching and discussing.", "items": items["trending"]},
            {"key": "current", "title": "This season", "subtitle": "The most popular anime in the current broadcast season.", "items": items["current"]},
            {"key": "top-rated", "title": "Top rated", "subtitle": "The highest-scoring anime in the AniList catalogue.", "items": items["top-rated"]},
            {"key": "upcoming", "title": "Coming next", "subtitle": "Anticipated anime that have not started airing yet.", "items": items["upcoming"]},
        ],
        "source": "AniList",
        "updatedAt": "live",
    }


def search_titles(term: str, page: int, **filters):
    signature = ":".join([term.casefold(), str(page), *(str(filters[key]) for key in sorted(filters))])
    digest = hashlib.sha256(signature.encode()).hexdigest()[:20]
    result = _cached(f"search:{digest}:v3", 300, lambda: AniListClient().search(term, page, **filters))
    return {"results": result["items"], "page": result["page"]}


def title_detail(media_id: int):
    return _cached(f"title:{media_id}:v1", 3600, lambda: AniListClient().detail(media_id))
