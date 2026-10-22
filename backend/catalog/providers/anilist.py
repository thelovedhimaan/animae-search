import re
from dataclasses import dataclass

import httpx

ANILIST_URL = "https://graphql.anilist.co"

MEDIA_FIELDS = """
id title { romaji english native } description(asHtml: false)
format status episodes season seasonYear genres averageScore popularity
coverImage { extraLarge large color } bannerImage
"""


class ProviderUnavailable(RuntimeError):
    pass


def _plain_text(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"<[^>]+>", "", value).replace("&quot;", '"').replace("&#039;", "'")


def normalize_media(media: dict) -> dict:
    title = media.get("title") or {}
    cover = media.get("coverImage") or {}
    display_title = title.get("english") or title.get("romaji") or title.get("native") or "Untitled"
    return {
        "id": media["id"],
        "slug": re.sub(r"[^a-z0-9]+", "-", display_title.lower()).strip("-"),
        "title": display_title,
        "nativeTitle": title.get("native") or "",
        "description": _plain_text(media.get("description")),
        "format": media.get("format") or "",
        "status": media.get("status") or "",
        "episodes": media.get("episodes"),
        "season": media.get("season") or "",
        "seasonYear": media.get("seasonYear"),
        "genres": media.get("genres") or [],
        "averageScore": media.get("averageScore"),
        "popularity": media.get("popularity") or 0,
        "coverImage": cover.get("extraLarge") or cover.get("large") or "",
        "bannerImage": media.get("bannerImage") or "",
        "accent": cover.get("color") or "#7457ff",
        "sourceLabel": "AniList",
        "updatedAt": "live",
    }


class AniListClient:
    def __init__(self, timeout: float = 8.0):
        self.timeout = timeout

    def _request(self, query: str, variables: dict) -> dict:
        try:
            response = httpx.post(
                ANILIST_URL,
                json={"query": query, "variables": variables},
                timeout=self.timeout,
                headers={"User-Agent": "AnimeSearch/0.1"},
            )
            response.raise_for_status()
            payload = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise ProviderUnavailable("AniList is temporarily unavailable") from exc
        if payload.get("errors"):
            raise ProviderUnavailable(payload["errors"][0].get("message", "AniList request failed"))
        return payload["data"]

    def trending(self, page: int = 1, per_page: int = 12) -> list[dict]:
        query = f"""
        query ($page: Int, $perPage: Int) {{
          Page(page: $page, perPage: $perPage) {{
            media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {{ {MEDIA_FIELDS} }}
          }}
        }}
        """
        data = self._request(query, {"page": page, "perPage": min(per_page, 30)})
        return [normalize_media(item) for item in data["Page"]["media"]]

    def search(self, term: str, page: int = 1, per_page: int = 18) -> dict:
        query = f"""
        query ($search: String, $page: Int, $perPage: Int) {{
          Page(page: $page, perPage: $perPage) {{
            pageInfo {{ currentPage hasNextPage total }}
            media(type: ANIME, search: $search, sort: SEARCH_MATCH, isAdult: false) {{ {MEDIA_FIELDS} }}
          }}
        }}
        """
        data = self._request(query, {"search": term, "page": page, "perPage": min(per_page, 30)})["Page"]
        return {"items": [normalize_media(item) for item in data["media"]], "page": data["pageInfo"]}

    def detail(self, media_id: int) -> dict:
        query = f"query ($id: Int) {{ Media(id: $id, type: ANIME) {{ {MEDIA_FIELDS} }} }}"
        return normalize_media(self._request(query, {"id": media_id})["Media"])
