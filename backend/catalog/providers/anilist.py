import re
from datetime import UTC, datetime

import httpx

ANILIST_URL = "https://graphql.anilist.co"

MEDIA_FIELDS = """
id title { romaji english native } description(asHtml: false)
format status episodes season seasonYear genres averageScore popularity
coverImage { extraLarge large color } bannerImage
externalLinks { site url type icon color isDisabled }
"""

CHARACTER_FIELDS = """
id name { full native alternative } image { large medium } description(asHtml: false)
gender age favourites siteUrl
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
    known_streaming = ("crunchyroll", "netflix", "hulu", "hidive", "youtube", "amazon", "bilibili", "disney", "tubi")
    watch_links = []
    for link in media.get("externalLinks") or []:
        site = (link.get("site") or "").lower()
        if not link.get("isDisabled") and link.get("url") and (link.get("type") == "STREAMING" or any(provider in site for provider in known_streaming)):
            watch_links.append({"site": link.get("site") or "Official stream", "url": link["url"], "icon": link.get("icon") or "", "color": link.get("color") or ""})
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
        "watchLinks": watch_links,
    }


def normalize_character(character: dict) -> dict:
    name = character.get("name") or {}
    display_name = name.get("full") or name.get("native") or "Unknown character"
    image = character.get("image") or {}
    media = character.get("media") or {}
    appearances = []
    voice_actors = {}
    for edge in media.get("edges") or []:
        node = edge.get("node") or {}
        title = node.get("title") or {}
        appearances.append({
            "id": node.get("id"),
            "slug": re.sub(r"[^a-z0-9]+", "-", (title.get("english") or title.get("romaji") or "anime").lower()).strip("-"),
            "title": title.get("english") or title.get("romaji") or title.get("native") or "Untitled",
            "coverImage": (node.get("coverImage") or {}).get("large") or "",
            "role": edge.get("characterRole") or "",
        })
        for actor in edge.get("voiceActors") or []:
            voice_actors[actor["id"]] = actor
    return {
        "id": character["id"],
        "slug": re.sub(r"[^a-z0-9]+", "-", display_name.lower()).strip("-"),
        "name": display_name,
        "nativeName": name.get("native") or "",
        "alternativeNames": name.get("alternative") or [],
        "image": image.get("large") or image.get("medium") or "",
        "description": _plain_text(character.get("description")),
        "gender": character.get("gender") or "",
        "age": character.get("age") or "",
        "favourites": character.get("favourites") or 0,
        "sourceUrl": character.get("siteUrl") or "",
        "appearances": appearances,
        "voiceActors": list(voice_actors.values()),
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
            payload = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise ProviderUnavailable("AniList is temporarily unavailable") from exc
        if payload.get("errors"):
            raise ProviderUnavailable(payload["errors"][0].get("message", "AniList request failed"))
        try:
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise ProviderUnavailable("AniList is temporarily unavailable") from exc
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

    def discovery(self, per_page: int = 10) -> dict[str, list[dict]]:
        now = datetime.now(UTC)
        season = "WINTER" if now.month <= 3 else "SPRING" if now.month <= 6 else "SUMMER" if now.month <= 9 else "FALL"
        query = f"""
        query ($perPage: Int, $season: MediaSeason, $seasonYear: Int) {{
          trending: Page(page: 1, perPage: $perPage) {{
            media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {{ {MEDIA_FIELDS} }}
          }}
          current: Page(page: 1, perPage: $perPage) {{
            media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC, isAdult: false) {{ {MEDIA_FIELDS} }}
          }}
          topRated: Page(page: 1, perPage: $perPage) {{
            media(type: ANIME, sort: SCORE_DESC, isAdult: false) {{ {MEDIA_FIELDS} }}
          }}
          upcoming: Page(page: 1, perPage: $perPage) {{
            media(type: ANIME, status: NOT_YET_RELEASED, sort: POPULARITY_DESC, isAdult: false) {{ {MEDIA_FIELDS} }}
          }}
        }}
        """
        data = self._request(query, {"perPage": min(per_page, 20), "season": season, "seasonYear": now.year})
        return {
            "trending": [normalize_media(item) for item in data["trending"]["media"]],
            "current": [normalize_media(item) for item in data["current"]["media"]],
            "top-rated": [normalize_media(item) for item in data["topRated"]["media"]],
            "upcoming": [normalize_media(item) for item in data["upcoming"]["media"]],
        }

    def search(self, term: str, page: int = 1, per_page: int = 20, *, sort: str = "SEARCH_MATCH", format: str | None = None, status: str | None = None, season: str | None = None, genre: str | None = None) -> dict:
        declarations = ["$page: Int", "$perPage: Int", "$sort: [MediaSort]"]
        arguments = ["type: ANIME", "sort: $sort", "isAdult: false"]
        variables = {"page": page, "perPage": min(per_page, 30), "sort": sort}
        optional_filters = {
            "search": ("String", term or None),
            "format": ("MediaFormat", format),
            "status": ("MediaStatus", status),
            "season": ("MediaSeason", season),
            "genre": ("String", genre),
        }
        for name, (graphql_type, value) in optional_filters.items():
            if value is not None:
                declarations.append(f"${name}: {graphql_type}")
                arguments.append(f"{name}: ${name}")
                variables[name] = value
        query = f"""
        query ({", ".join(declarations)}) {{
          Page(page: $page, perPage: $perPage) {{
            pageInfo {{ currentPage lastPage hasNextPage total perPage }}
            media({", ".join(arguments)}) {{ {MEDIA_FIELDS} }}
          }}
        }}
        """
        data = self._request(query, variables)["Page"]
        return {"items": [normalize_media(item) for item in data["media"]], "page": data["pageInfo"]}

    def detail(self, media_id: int) -> dict:
        query = f"query ($id: Int) {{ Media(id: $id, type: ANIME) {{ {MEDIA_FIELDS} }} }}"
        return normalize_media(self._request(query, {"id": media_id})["Media"])

    def characters(self, term: str = "", page: int = 1, per_page: int = 20) -> dict:
        search_declaration = ", $search: String" if term else ""
        search_argument = "search: $search, " if term else ""
        query = f"""
        query ($page: Int, $perPage: Int{search_declaration}) {{
          Page(page: $page, perPage: $perPage) {{
            pageInfo {{ currentPage lastPage hasNextPage total perPage }}
            characters({search_argument}sort: FAVOURITES_DESC) {{ {CHARACTER_FIELDS} }}
          }}
        }}
        """
        variables = {"page": page, "perPage": min(per_page, 30)}
        if term:
            variables["search"] = term
        data = self._request(query, variables)["Page"]
        return {"items": [normalize_character(item) for item in data["characters"]], "page": data["pageInfo"]}

    def character_detail(self, character_id: int) -> dict:
        query = f"""
        query ($id: Int) {{
          Character(id: $id) {{
            {CHARACTER_FIELDS}
            media(perPage: 8, type: ANIME, sort: POPULARITY_DESC) {{
              edges {{
                characterRole
                voiceActors(language: JAPANESE, sort: RELEVANCE) {{
                  id name {{ full native }} image {{ large }} languageV2 siteUrl
                }}
                node {{ id title {{ romaji english native }} coverImage {{ large }} }}
              }}
            }}
          }}
        }}
        """
        return normalize_character(self._request(query, {"id": character_id})["Character"])
