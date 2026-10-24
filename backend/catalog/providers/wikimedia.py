import html
import os
import re
from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime
from urllib.parse import quote

import httpx

from .base import ProviderUnavailable


WIKIDATA_API = "https://www.wikidata.org/w/api.php"
WIKIDATA_SPARQL = "https://query.wikidata.org/sparql"
WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
KITSU_API = "https://kitsu.io/api/edge"

# Concrete work types avoid pulling manga, franchises, and the general anime concept.
ANIME_TYPES = {
    "Q63952888": "TV",
    "Q11086742": "SPECIAL",
    "Q20650540": "MOVIE",
    "Q220898": "OVA",
    "Q113687694": "OVA",
    "Q1047299": "ONA",
}

TYPE_VALUES = " ".join(f"wd:{item}" for item in ANIME_TYPES)

# Stable, well-documented records keep discovery useful when the public SPARQL
# service is busy. Facts still refresh through Wikidata's lighter Action API.
CURATED_DISCOVERY_IDS = ["Q155653", "Q101244908", "Q336012", "Q4006754", "Q5058811"]


def _slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-") or "anime"


def _plain(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", value))).strip()


def _qid_number(value: str | None) -> int | None:
    if not value:
        return None
    match = re.search(r"Q(\d+)$", value)
    return int(match.group(1)) if match else None


def _claim_values(entity: dict, prop: str) -> list:
    values = []
    for statement in (entity.get("claims") or {}).get(prop, []):
        datavalue = (statement.get("mainsnak") or {}).get("datavalue")
        if datavalue and "value" in datavalue:
            values.append(datavalue["value"])
    return values


def _item_ids(entity: dict, prop: str) -> list[str]:
    return [value["id"] for value in _claim_values(entity, prop) if isinstance(value, dict) and value.get("id")]


def _first_string(entity: dict, prop: str) -> str:
    for value in _claim_values(entity, prop):
        if isinstance(value, str):
            return value
    return ""


def _quantity(entity: dict, prop: str) -> int | None:
    for value in _claim_values(entity, prop):
        if isinstance(value, dict) and value.get("amount"):
            try:
                return max(0, int(float(value["amount"])))
            except (TypeError, ValueError):
                continue
    return None


def _date(entity: dict, *props: str) -> datetime | None:
    for prop in props:
        for value in _claim_values(entity, prop):
            raw = value.get("time") if isinstance(value, dict) else None
            if not raw:
                continue
            try:
                return datetime.fromisoformat(raw.lstrip("+").replace("Z", "+00:00"))
            except ValueError:
                continue
    return None


def _season(date: datetime | None) -> str:
    if not date:
        return ""
    return "WINTER" if date.month <= 3 else "SPRING" if date.month <= 6 else "SUMMER" if date.month <= 9 else "FALL"


class WikimediaClient:
    """Free catalogue adapter backed by CC0 Wikidata and attributed Wikimedia content."""

    def __init__(self, timeout: float = 14.0):
        self.timeout = timeout
        self.user_agent = os.getenv(
            "WIKIMEDIA_USER_AGENT",
            "AnimeIndex/0.2 (https://anime-index.65-0-27-27.sslip.io; contact via project website)",
        )

    def _get(self, url: str, params: dict) -> dict:
        try:
            response = httpx.get(
                url,
                params=params,
                timeout=self.timeout,
                headers={"User-Agent": self.user_agent, "Api-User-Agent": self.user_agent},
                follow_redirects=True,
            )
            response.raise_for_status()
            return response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise ProviderUnavailable("The open Wikimedia catalogue is temporarily unavailable.") from exc

    def _kitsu_get(self, path: str, params: dict | None = None) -> dict:
        """Optional no-key image enrichment; catalogue facts remain sourced from Wikidata."""
        try:
            response = httpx.get(
                f"{KITSU_API}/{path.lstrip('/')}",
                params=params or {},
                timeout=self.timeout,
                headers={"User-Agent": self.user_agent, "Accept": "application/vnd.api+json"},
                follow_redirects=True,
            )
            response.raise_for_status()
            return response.json()
        except (httpx.HTTPError, ValueError):
            return {}

    @staticmethod
    def _match_key(value: str) -> str:
        return re.sub(r"[^a-z0-9]", "", value.casefold())

    def _kitsu_anime(self, title: str) -> dict:
        payload = self._kitsu_get("anime", {"filter[text]": title, "page[limit]": 3})
        candidates = payload.get("data") or []
        target = self._match_key(title)
        item = next((candidate for candidate in candidates if target in {
            self._match_key(str((candidate.get("attributes") or {}).get(key) or ""))
            for key in ("canonicalTitle", "titles")
        }), None) or (candidates[0] if candidates else None)
        if not item:
            return {}
        attrs = item.get("attributes") or {}
        poster = attrs.get("posterImage") or {}
        cover = attrs.get("coverImage") or {}
        return {
            "id": str(item.get("id") or ""),
            "poster": poster.get("original") or poster.get("large") or poster.get("medium") or "",
            "banner": cover.get("original") or cover.get("large") or cover.get("small") or "",
            "url": f"https://kitsu.app/anime/{item.get('id')}",
        }

    def _kitsu_artwork(self, titles: list[str]) -> dict[str, dict]:
        unique = list(dict.fromkeys(title for title in titles if title))
        if not unique:
            return {}
        with ThreadPoolExecutor(max_workers=min(4, len(unique))) as executor:
            results = executor.map(self._kitsu_anime, unique)
        return {title: result for title, result in zip(unique, results) if result}

    def _kitsu_character(self, name: str) -> dict:
        payload = self._kitsu_get("characters", {"filter[name]": name, "page[limit]": 3})
        candidates = payload.get("data") or []
        target = self._match_key(name)
        item = next((candidate for candidate in candidates if self._match_key(str((candidate.get("attributes") or {}).get("canonicalName") or "")) == target), None) or (candidates[0] if candidates else None)
        if not item:
            return {}
        attrs = item.get("attributes") or {}
        return {
            "image": (attrs.get("image") or {}).get("original") or "",
            "url": f"https://kitsu.app/characters/{item.get('id')}",
        }

    def _kitsu_character_artwork(self, names: list[str]) -> dict[str, dict]:
        unique = list(dict.fromkeys(name for name in names if name))
        if not unique:
            return {}
        with ThreadPoolExecutor(max_workers=min(4, len(unique))) as executor:
            results = executor.map(self._kitsu_character, unique)
        return {name: result for name, result in zip(unique, results) if result.get("image")}

    def _sparql(self, query: str) -> list[dict]:
        try:
            response = httpx.post(
                WIKIDATA_SPARQL,
                data={"query": query},
                timeout=self.timeout,
                headers={"User-Agent": self.user_agent, "Accept": "application/sparql-results+json"},
            )
            response.raise_for_status()
            return response.json()["results"]["bindings"]
        except (httpx.HTTPError, ValueError, KeyError) as exc:
            raise ProviderUnavailable("The open Wikimedia catalogue is temporarily unavailable.") from exc

    def _entities(self, ids: list[str]) -> dict[str, dict]:
        unique = list(dict.fromkeys(item for item in ids if re.fullmatch(r"Q\d+", item)))
        if not unique:
            return {}
        entities: dict[str, dict] = {}
        for start in range(0, len(unique), 50):
            payload = self._get(WIKIDATA_API, {
                "action": "wbgetentities",
                "format": "json",
                "formatversion": 2,
                "ids": "|".join(unique[start:start + 50]),
                "props": "labels|descriptions|aliases|claims|sitelinks",
                "languages": "en|ja",
                "languagefallback": 1,
            })
            entities.update(payload.get("entities") or {})
        return entities

    def _labels(self, ids: list[str]) -> dict[str, str]:
        entities = self._entities(ids)
        return {
            item_id: ((entity.get("labels") or {}).get("en") or (entity.get("labels") or {}).get("ja") or {}).get("value", item_id)
            for item_id, entity in entities.items()
        }

    def _commons_metadata(self, filenames: list[str]) -> dict[str, dict]:
        unique = list(dict.fromkeys(name for name in filenames if name))
        if not unique:
            return {}
        metadata: dict[str, dict] = {}
        for start in range(0, len(unique), 40):
            batch = unique[start:start + 40]
            payload = self._get(COMMONS_API, {
                "action": "query",
                "format": "json",
                "formatversion": 2,
                "prop": "imageinfo|info",
                "inprop": "url",
                "iiprop": "url|extmetadata",
                "iiurlwidth": 1200,
                "titles": "|".join(f"File:{name}" for name in batch),
            })
            for page in (payload.get("query") or {}).get("pages", []):
                info = ((page.get("imageinfo") or [{}])[0])
                ext = info.get("extmetadata") or {}
                filename = page.get("title", "").removeprefix("File:")
                metadata[filename] = {
                    "url": info.get("thumburl") or info.get("url") or "",
                    "creator": _plain((ext.get("Artist") or {}).get("value")) or "Wikimedia Commons contributor",
                    "credit": _plain((ext.get("Credit") or {}).get("value")),
                    "license": _plain((ext.get("LicenseShortName") or {}).get("value")) or _plain((ext.get("UsageTerms") or {}).get("value")),
                    "licenseUrl": (ext.get("LicenseUrl") or {}).get("value", ""),
                    "sourceUrl": page.get("canonicalurl") or f"https://commons.wikimedia.org/wiki/File:{quote(filename)}",
                }
        return metadata

    def _wikipedia_summary(self, title: str) -> dict:
        if not title:
            return {}
        payload = self._get(WIKIPEDIA_API, {
            "action": "query",
            "format": "json",
            "formatversion": 2,
            "prop": "extracts|info",
            "inprop": "url",
            "exintro": 1,
            "explaintext": 1,
            "redirects": 1,
            "titles": title,
        })
        page = ((payload.get("query") or {}).get("pages") or [{}])[0]
        return {"text": _plain(page.get("extract")), "url": page.get("canonicalurl", "")}

    @staticmethod
    def _is_anime(entity: dict) -> bool:
        return any(item_id in ANIME_TYPES for item_id in _item_ids(entity, "P31"))

    def _normalize_many(self, entities: list[dict], *, include_detail: bool = False) -> list[dict]:
        related_ids: list[str] = []
        filenames: list[str] = []
        for entity in entities:
            related_ids += _item_ids(entity, "P136") + _item_ids(entity, "P272")
            if include_detail:
                related_ids += _item_ids(entity, "P674")
                related_ids += _item_ids(entity, "P179") + _item_ids(entity, "P527") + _item_ids(entity, "P4969")
            filename = _first_string(entity, "P18")
            if filename:
                filenames.append(filename)
        related = self._entities(related_ids)
        labels = {
            item_id: ((item.get("labels") or {}).get("en") or (item.get("labels") or {}).get("ja") or {}).get("value", item_id)
            for item_id, item in related.items()
        }
        filenames += [_first_string(item, "P18") for item in related.values()]
        media = self._commons_metadata(filenames)
        normalized = [self._normalize(entity, labels, related, media, include_detail=include_detail) for entity in entities]
        kitsu = self._kitsu_artwork([item["title"] for item in normalized if not item["coverImage"]])
        for item in normalized:
            enrichment = kitsu.get(item["title"])
            if not enrichment:
                continue
            item["coverImage"] = item["coverImage"] or enrichment["poster"]
            item["bannerImage"] = item["bannerImage"] or enrichment["banner"]
            item["imageAttribution"] = item["imageAttribution"] or {
                "creator": "Kitsu catalogue",
                "credit": "Public catalogue image",
                "license": "External artwork",
                "licenseUrl": "",
                "sourceUrl": enrichment["url"],
            }
            if include_detail and enrichment.get("id"):
                self._enrich_cast_from_kitsu(item, enrichment["id"])
        return normalized

    def _enrich_cast_from_kitsu(self, anime: dict, kitsu_id: str) -> None:
        payload = self._kitsu_get("castings", {
            "filter[mediaType]": "Anime", "filter[mediaId]": kitsu_id,
            "include": "character,person", "page[limit]": 20,
        })
        included = payload.get("included") or []
        characters = {str(item.get("id")): item for item in included if item.get("type") == "characters"}
        people = {str(item.get("id")): item for item in included if item.get("type") == "people"}
        existing = {self._match_key(item["name"]): item for item in anime.get("cast") or []}
        for casting in payload.get("data") or []:
            relationships = casting.get("relationships") or {}
            character_ref = ((relationships.get("character") or {}).get("data") or {})
            person_ref = ((relationships.get("person") or {}).get("data") or {})
            character = characters.get(str(character_ref.get("id") or ""))
            if not character:
                continue
            attrs = character.get("attributes") or {}
            name = str(attrs.get("canonicalName") or attrs.get("name") or "Unknown character")
            image = (attrs.get("image") or {}).get("original") or ""
            person = people.get(str(person_ref.get("id") or ""))
            person_attrs = (person or {}).get("attributes") or {}
            voice_actor = None
            if person:
                voice_actor = {
                    "id": int(person.get("id") or 0),
                    "name": str(person_attrs.get("name") or "Unknown performer"),
                    "image": (person_attrs.get("image") or {}).get("original") or "",
                }
            key = self._match_key(name)
            if key in existing:
                existing[key]["image"] = existing[key].get("image") or image
                existing[key]["voiceActor"] = existing[key].get("voiceActor") or voice_actor
                continue
            if len(existing) >= 16:
                break
            entry = {
                "id": int(character.get("id") or 0), "name": name, "nativeName": "",
                "image": image, "role": str((casting.get("attributes") or {}).get("role") or "CHARACTER").upper(),
                "voiceActor": voice_actor, "externalUrl": f"https://kitsu.app/characters/{character.get('id')}",
            }
            existing[key] = entry
            anime.setdefault("cast", []).append(entry)

    def _normalize(self, entity: dict, labels: dict[str, str], related: dict[str, dict], media: dict[str, dict], *, include_detail: bool) -> dict:
        item_id = entity.get("id", "")
        label_data = entity.get("labels") or {}
        title = (label_data.get("en") or label_data.get("ja") or {}).get("value", "Untitled")
        native_title = (label_data.get("ja") or {}).get("value", "")
        for value in _claim_values(entity, "P1476"):
            if isinstance(value, dict) and value.get("language") == "ja":
                native_title = value.get("text") or native_title
                break
        started = _date(entity, "P580")
        published = _date(entity, "P577")
        start = started or published
        end = _date(entity, "P582")
        now = datetime.now(UTC)
        types = _item_ids(entity, "P31")
        format_name = next((ANIME_TYPES[item] for item in types if item in ANIME_TYPES), "ANIME")
        status = "NOT_YET_RELEASED" if start and start > now else "FINISHED" if (end and end < now) or (published and not started and published <= now) else "RELEASING" if start else "UNKNOWN"
        filename = _first_string(entity, "P18")
        image = media.get(filename, {})
        description = ((entity.get("descriptions") or {}).get("en") or {}).get("value", "")
        result = {
            "id": _qid_number(item_id),
            "qid": item_id,
            "slug": _slug(title),
            "title": title,
            "nativeTitle": native_title,
            "description": description,
            "format": format_name,
            "status": status,
            "episodes": _quantity(entity, "P1113"),
            "season": _season(start),
            "seasonYear": start.year if start else None,
            "genres": [labels[item] for item in _item_ids(entity, "P136") if item in labels],
            "averageScore": None,
            "ratingCount": 0,
            "popularity": len(entity.get("sitelinks") or {}),
            "coverImage": image.get("url", ""),
            "bannerImage": "",
            "imageAttribution": ({key: image.get(key, "") for key in ("creator", "credit", "license", "licenseUrl", "sourceUrl")} if image else None),
            "accent": "#d6ff4b",
            "sourceLabel": "Wikidata",
            "sourceUrl": f"https://www.wikidata.org/wiki/{item_id}",
            "updatedAt": datetime.now(UTC).isoformat(),
            "watchLinks": [],
        }
        if not include_detail:
            return result

        result["mediaCredits"] = [
            {key: details.get(key, "") for key in ("creator", "credit", "license", "licenseUrl", "sourceUrl")}
            for details in {details.get("sourceUrl", filename): details for filename, details in media.items() if details.get("url")}.values()
        ]

        wiki_title = ((entity.get("sitelinks") or {}).get("enwiki") or {}).get("title", "")
        if wiki_title:
            try:
                summary = self._wikipedia_summary(wiki_title)
                if summary.get("text"):
                    result["description"] = summary["text"]
                result["textAttribution"] = {
                    "source": "Wikipedia",
                    "sourceUrl": summary.get("url", ""),
                    "license": "CC BY-SA 4.0",
                    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
                }
            except ProviderUnavailable:
                pass

        characters = [related[item] for item in _item_ids(entity, "P674") if item in related][:12]
        result["cast"] = [self._normalize_cast_character(character, media) for character in characters]
        result["studios"] = [
            {"id": _qid_number(studio_id), "name": labels.get(studio_id, studio_id), "url": _first_string(related.get(studio_id, {}), "P856")}
            for studio_id in _item_ids(entity, "P272") if studio_id in related
        ]
        relation_ids = list(dict.fromkeys(_item_ids(entity, "P179") + _item_ids(entity, "P527") + _item_ids(entity, "P4969")))[:12]
        result["relations"] = []
        for relation_id in relation_ids:
            relation = related.get(relation_id)
            if not relation or not self._is_anime(relation):
                continue
            relation_title = labels.get(relation_id, relation_id)
            relation_filename = _first_string(relation, "P18")
            result["relations"].append({
                "relation": "RELATED",
                "id": _qid_number(relation_id),
                "title": relation_title,
                "format": next((ANIME_TYPES[item] for item in _item_ids(relation, "P31") if item in ANIME_TYPES), "ANIME"),
                "coverImage": media.get(relation_filename, {}).get("url", ""),
            })
        result["trailer"] = None
        official_url = _first_string(entity, "P856")
        result["officialLinks"] = ([{"site": "Official website", "url": official_url}] if official_url else [])
        return result

    def _normalize_cast_character(self, entity: dict, media: dict[str, dict]) -> dict:
        label_data = entity.get("labels") or {}
        name = (label_data.get("en") or label_data.get("ja") or {}).get("value", "Unknown character")
        filename = _first_string(entity, "P18")
        return {
            "id": _qid_number(entity.get("id")),
            "name": name,
            "nativeName": (label_data.get("ja") or {}).get("value", ""),
            "image": media.get(filename, {}).get("url", ""),
            "role": "CHARACTER",
            "voiceActor": None,
        }

    def _popular_ids(self, limit: int = 30) -> list[str]:
        rows = self._sparql(f"""
        SELECT ?item (MAX(?count) AS ?sitelinks) WHERE {{
          VALUES ?type {{ {TYPE_VALUES} }}
          ?item wdt:P31 ?type; wikibase:sitelinks ?count.
        }} GROUP BY ?item ORDER BY DESC(?sitelinks) LIMIT {limit}
        """)
        return [f"Q{item}" for item in (_qid_number((row.get("item") or {}).get("value")) for row in rows) if item]

    def _dated_ids(self, *, upcoming: bool, limit: int = 20) -> list[str]:
        comparison = ">= NOW()" if upcoming else "<= NOW()"
        direction = "ASC" if upcoming else "DESC"
        rows = self._sparql(f"""
        SELECT ?item (MIN(?date) AS ?releaseDate) WHERE {{
          VALUES ?type {{ {TYPE_VALUES} }}
          ?item wdt:P31 ?type.
          {{ ?item wdt:P580 ?date. }} UNION {{ ?item wdt:P577 ?date. }}
          FILTER(?date {comparison})
        }} GROUP BY ?item ORDER BY {direction}(?releaseDate) LIMIT {limit}
        """)
        return [f"Q{item}" for item in (_qid_number((row.get("item") or {}).get("value")) for row in rows) if item]

    def discovery(self, per_page: int = 10) -> dict[str, list[dict]]:
        popular_ids = CURATED_DISCOVERY_IDS[:per_page]
        try:
            recent_ids = self._dated_ids(upcoming=False, limit=per_page)
        except ProviderUnavailable:
            recent_ids = []
        try:
            upcoming_ids = self._dated_ids(upcoming=True, limit=per_page)
        except ProviderUnavailable:
            upcoming_ids = []
        all_ids = list(dict.fromkeys(popular_ids + recent_ids + upcoming_ids))
        entities = self._entities(all_ids)
        normalized = {item["qid"]: item for item in self._normalize_many([entities[item] for item in all_ids if item in entities])}
        take = lambda ids: [normalized[item] for item in ids if item in normalized][:per_page]
        return {"popular": take(popular_ids), "recent": take(recent_ids), "upcoming": take(upcoming_ids)}

    def search(self, term: str, page: int = 1, per_page: int = 20, **filters) -> dict:
        if term:
            payload = self._get(WIKIDATA_API, {
                "action": "wbsearchentities",
                "format": "json",
                "language": "en",
                "uselang": "en",
                "type": "item",
                "limit": 50,
                "continue": max(0, (page - 1) * per_page),
                "search": term,
            })
            ids = [item["id"] for item in payload.get("search", [])]
            entities = self._entities(ids)
            candidates = [entities[item] for item in ids if item in entities and self._is_anime(entities[item])]
            has_next = "search-continue" in payload
        else:
            ids = self._browse_ids(page, per_page, **filters)
            entities = self._entities(ids)
            candidates = [entities[item] for item in ids if item in entities]
            has_next = len(ids) == per_page
        items = self._normalize_many(candidates)
        items = self._filter_normalized(items, **filters)
        return {"items": items[:per_page], "page": {"currentPage": page, "hasNextPage": has_next, "perPage": per_page}}

    def _browse_ids(self, page: int, per_page: int, **filters) -> list[str]:
        type_filter = filters.get("format")
        allowed = [item for item, name in ANIME_TYPES.items() if not type_filter or name == type_filter]
        type_values = " ".join(f"wd:{item}" for item in allowed)
        offset = (page - 1) * per_page
        order = "DESC(?date)" if filters.get("sort") == "START_DATE_DESC" else "DESC(?sitelinks)"
        rows = self._sparql(f"""
        SELECT ?item (MAX(?count) AS ?sitelinks) (MAX(?candidateDate) AS ?date) WHERE {{
          VALUES ?type {{ {type_values} }}
          ?item wdt:P31 ?type; wikibase:sitelinks ?count.
          OPTIONAL {{ {{ ?item wdt:P580 ?candidateDate. }} UNION {{ ?item wdt:P577 ?candidateDate. }} }}
        }} GROUP BY ?item ORDER BY {order} LIMIT {per_page} OFFSET {offset}
        """)
        return [f"Q{item}" for item in (_qid_number((row.get("item") or {}).get("value")) for row in rows) if item]

    @staticmethod
    def _filter_normalized(items: list[dict], **filters) -> list[dict]:
        format_name = filters.get("format")
        status = filters.get("status")
        season = filters.get("season")
        genre = (filters.get("genre") or "").casefold()
        filtered = [item for item in items if (not format_name or item["format"] == format_name)]
        filtered = [item for item in filtered if (not status or item["status"] == status)]
        filtered = [item for item in filtered if (not season or item["season"] == season)]
        filtered = [item for item in filtered if (not genre or any(genre in value.casefold() for value in item["genres"]))]
        return filtered

    def detail(self, media_id: int) -> dict:
        qid = f"Q{media_id}"
        entity = self._entities([qid]).get(qid)
        if not entity or not self._is_anime(entity):
            raise ProviderUnavailable("This title is not present in the open anime catalogue.")
        return self._normalize_many([entity], include_detail=True)[0]

    def characters(self, term: str = "", page: int = 1, per_page: int = 20) -> dict:
        if term:
            payload = self._get(WIKIDATA_API, {
                "action": "wbsearchentities", "format": "json", "language": "en", "uselang": "en",
                "type": "item", "limit": 50, "continue": max(0, (page - 1) * per_page), "search": term,
            })
            ids = [item["id"] for item in payload.get("search", [])]
            entities = self._entities(ids)
            characters = [entity for item_id, entity in entities.items() if "character" in (((entity.get("descriptions") or {}).get("en") or {}).get("value", "").casefold())]
            has_next = "search-continue" in payload
        else:
            anime_ids = self._popular_ids(12)
            anime = self._entities(anime_ids)
            ids = list(dict.fromkeys(item for entity in anime.values() for item in _item_ids(entity, "P674")))
            entities = self._entities(ids)
            characters = list(entities.values())[(page - 1) * per_page:page * per_page]
            has_next = len(ids) > page * per_page
        files = [_first_string(entity, "P18") for entity in characters]
        media = self._commons_metadata(files)
        items = [self._normalize_character(entity, media) for entity in characters[:per_page]]
        kitsu = self._kitsu_character_artwork([item["name"] for item in items if not item["image"]])
        for item in items:
            enrichment = kitsu.get(item["name"])
            if enrichment:
                item["image"] = enrichment["image"]
                item["imageAttribution"] = item["imageAttribution"] or {"creator": "Kitsu catalogue", "license": "External artwork", "licenseUrl": "", "sourceUrl": enrichment["url"]}
        return {"items": items, "page": {"currentPage": page, "hasNextPage": has_next, "perPage": per_page}}

    def _normalize_character(self, entity: dict, media: dict[str, dict], *, include_detail: bool = False) -> dict:
        item_id = entity.get("id", "")
        labels = entity.get("labels") or {}
        name = (labels.get("en") or labels.get("ja") or {}).get("value", "Unknown character")
        filename = _first_string(entity, "P18")
        image = media.get(filename, {})
        result = {
            "id": _qid_number(item_id), "qid": item_id, "slug": _slug(name), "name": name,
            "nativeName": (labels.get("ja") or {}).get("value", ""),
            "alternativeNames": [item.get("value", "") for item in (entity.get("aliases") or {}).get("en", [])],
            "image": image.get("url", ""),
            "imageAttribution": ({key: image.get(key, "") for key in ("creator", "license", "licenseUrl", "sourceUrl")} if image else None),
            "description": ((entity.get("descriptions") or {}).get("en") or {}).get("value", ""),
            "gender": "", "age": "", "favourites": 0,
            "sourceUrl": f"https://www.wikidata.org/wiki/{item_id}", "sourceLabel": "Wikidata",
            "appearances": [], "voiceActors": [],
        }
        if not include_detail:
            return result
        appearance_ids = _item_ids(entity, "P1441")
        voice_ids = _item_ids(entity, "P725")
        related = self._entities(appearance_ids + voice_ids)
        related_files = [_first_string(item, "P18") or _first_string(item, "P154") for item in related.values()]
        related_media = self._commons_metadata(related_files)
        result["mediaCredits"] = [
            {key: details.get(key, "") for key in ("creator", "credit", "license", "licenseUrl", "sourceUrl")}
            for details in {details.get("sourceUrl", filename): details for filename, details in ({**media, **related_media}).items() if details.get("url")}.values()
        ]
        for anime_id in appearance_ids:
            anime = related.get(anime_id)
            if not anime or not self._is_anime(anime):
                continue
            anime_labels = anime.get("labels") or {}
            anime_title = (anime_labels.get("en") or anime_labels.get("ja") or {}).get("value", "Untitled")
            anime_file = _first_string(anime, "P18")
            result["appearances"].append({"id": _qid_number(anime_id), "slug": _slug(anime_title), "title": anime_title, "coverImage": related_media.get(anime_file, {}).get("url", ""), "role": "CHARACTER"})
        for actor_id in voice_ids:
            actor = related.get(actor_id)
            if not actor:
                continue
            actor_labels = actor.get("labels") or {}
            actor_name = (actor_labels.get("en") or actor_labels.get("ja") or {}).get("value", "Unknown performer")
            actor_file = _first_string(actor, "P18")
            result["voiceActors"].append({"id": _qid_number(actor_id), "name": {"full": actor_name, "native": (actor_labels.get("ja") or {}).get("value", "")}, "image": {"large": related_media.get(actor_file, {}).get("url", "")}, "languageV2": "Listed voice actor", "siteUrl": f"https://www.wikidata.org/wiki/{actor_id}"})
        wiki_title = ((entity.get("sitelinks") or {}).get("enwiki") or {}).get("title", "")
        if wiki_title:
            try:
                summary = self._wikipedia_summary(wiki_title)
                result["description"] = summary.get("text") or result["description"]
            except ProviderUnavailable:
                pass
        return result

    def character_detail(self, character_id: int) -> dict:
        qid = f"Q{character_id}"
        entity = self._entities([qid]).get(qid)
        if not entity:
            raise ProviderUnavailable("This character is not present in the open catalogue.")
        filename = _first_string(entity, "P18")
        result = self._normalize_character(entity, self._commons_metadata([filename]), include_detail=True)
        if not result["image"]:
            enrichment = self._kitsu_character(result["name"])
            if enrichment.get("image"):
                result["image"] = enrichment["image"]
                result["imageAttribution"] = {"creator": "Kitsu catalogue", "license": "External artwork", "licenseUrl": "", "sourceUrl": enrichment["url"]}
        return result
