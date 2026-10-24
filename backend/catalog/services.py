import hashlib

from django.core.cache import cache
from django.db.models import Avg, Count

from .models import LibraryEntry, Review
from .providers.base import ProviderUnavailable
from .providers.wikimedia import WikimediaClient


def _cached(key: str, ttl: int, loader):
    result = cache.get(key)
    if result is None:
        result = loader()
        cache.set(key, result, ttl)
    return result


def discovery_home():
    client = WikimediaClient()
    items = _cached("discovery:home:wikimedia:v1", 1800, lambda: client.discovery(per_page=10))
    activity = {}
    for row in LibraryEntry.objects.values("media_id").annotate(count=Count("id")):
        activity[row["media_id"]] = activity.get(row["media_id"], 0) + row["count"]
    for row in Review.objects.values("media_id").annotate(count=Count("id")):
        activity[row["media_id"]] = activity.get(row["media_id"], 0) + row["count"] * 2
    activity_ids = [media_id for media_id, _ in sorted(activity.items(), key=lambda item: item[1], reverse=True)[:10]]
    trending = []
    for media_id in activity_ids:
        try:
            trending.append(title_detail(media_id))
        except ProviderUnavailable:
            continue
    if not trending:
        trending = items["popular"]
    top_ids = [row["media_id"] for row in Review.objects.values("media_id").annotate(score=Avg("rating"), count=Count("id")).order_by("-score", "-count")[:10]]
    top_rated = []
    for media_id in top_ids:
        try:
            top_rated.append(title_detail(media_id))
        except ProviderUnavailable:
            continue
    if not top_rated:
        top_rated = items["popular"]
    return {
        "shelves": [
            {"key": "trending", "title": "Trending on Anime Index", "subtitle": "Titles receiving the most saves and reviews here. Widely documented open-catalogue titles appear while community activity grows.", "items": trending},
            {"key": "current", "title": "Recently released", "subtitle": "Recent anime releases recorded in the open Wikimedia catalogue.", "items": items["recent"]},
            {"key": "top-rated", "title": "Community favourites", "subtitle": "Anime Index ratings only. Widely documented titles appear until enough reviews are available.", "items": top_rated},
            {"key": "upcoming", "title": "Coming next", "subtitle": "Anticipated anime that have not started airing yet.", "items": items["upcoming"]},
        ],
        "source": "Wikidata and Anime Index community activity",
        "updatedAt": "cached open data",
    }


def search_titles(term: str, page: int, **filters):
    signature = ":".join([term.casefold(), str(page), *(str(filters[key]) for key in sorted(filters))])
    digest = hashlib.sha256(signature.encode()).hexdigest()[:20]
    result = _cached(f"search:wikimedia:{digest}:v1", 900, lambda: WikimediaClient().search(term, page, **filters))
    items = _apply_community_scores(result["items"])
    if filters.get("sort") == "SCORE_DESC":
        items.sort(key=lambda item: (item.get("averageScore") or -1, item.get("ratingCount") or 0), reverse=True)
    elif filters.get("sort") == "TRENDING_DESC":
        items.sort(key=lambda item: item.get("trending") or 0, reverse=True)
    return {"results": items, "page": result["page"], "source": "Wikidata"}


def title_detail(media_id: int):
    item = _cached(f"title:wikimedia:{media_id}:v1", 21600, lambda: WikimediaClient().detail(media_id))
    return _apply_community_scores([item])[0]


def search_characters(term: str, page: int):
    digest = hashlib.sha256(f"{term.casefold()}:{page}".encode()).hexdigest()[:20]
    result = _cached(f"characters:wikimedia:{digest}:v1", 1800, lambda: WikimediaClient().characters(term, page))
    return {"results": result["items"], "page": result["page"], "source": "Wikidata"}


def character_detail(character_id: int):
    return _cached(f"character:wikimedia:{character_id}:v1", 21600, lambda: WikimediaClient().character_detail(character_id))


def _apply_community_scores(items: list[dict]) -> list[dict]:
    media_ids = [item.get("id") for item in items if item.get("id")]
    scores = {
        row["media_id"]: row
        for row in Review.objects.filter(media_id__in=media_ids).values("media_id").annotate(score=Avg("rating"), count=Count("id"))
    }
    saves = {
        row["media_id"]: row["count"]
        for row in LibraryEntry.objects.filter(media_id__in=media_ids).values("media_id").annotate(count=Count("id"))
    }
    for item in items:
        score = scores.get(item.get("id"))
        item["averageScore"] = round(float(score["score"]) * 10) if score else None
        item["ratingCount"] = score["count"] if score else 0
        item["trending"] = saves.get(item.get("id"), 0) + (score["count"] * 2 if score else 0)
    return items
