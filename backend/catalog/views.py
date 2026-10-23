from datetime import datetime, timezone
import os

import httpx

from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from django.core import signing
from django.db import connections
from django.db.utils import OperationalError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .providers.anilist import ProviderUnavailable
from .models import LibraryEntry, Review
from .services import character_detail, discovery_home, search_characters, search_titles, title_detail

AUTH_COOKIE = "anime_session"
AUTH_COOKIE_SALT = "anime-index-account"
AUTH_MAX_AGE = 60 * 60 * 24 * 30


def current_season():
    month = datetime.now(timezone.utc).month
    return "WINTER" if month <= 3 else "SPRING" if month <= 6 else "SUMMER" if month <= 9 else "FALL"


def account_payload(user):
    return {"id": user.pk, "email": user.email, "displayName": user.first_name or user.email.split("@")[0]}


def signed_in_user(request):
    token = request.COOKIES.get(AUTH_COOKIE)
    if not token:
        return None
    try:
        user_id = signing.loads(token, salt=AUTH_COOKIE_SALT, max_age=AUTH_MAX_AGE)["user_id"]
        return get_user_model().objects.filter(pk=user_id, is_active=True).first()
    except (signing.BadSignature, KeyError, TypeError):
        return None


def set_account_cookie(response, user):
    token = signing.dumps({"user_id": user.pk}, salt=AUTH_COOKIE_SALT, compress=True)
    response.set_cookie(AUTH_COOKIE, token, max_age=AUTH_MAX_AGE, httponly=True, samesite="Lax", secure=settings.ACCOUNT_COOKIE_SECURE, path="/")
    return response


class HealthView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        try:
            connections["default"].cursor().execute("SELECT 1")
            database = "ok"
        except OperationalError:
            database = "unavailable"
        code = status.HTTP_200_OK if database == "ok" else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response({"status": "ok" if database == "ok" else "degraded", "database": database}, status=code)


class DiscoveryView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        try:
            return Response(discovery_home())
        except ProviderUnavailable as exc:
            return Response({"detail": str(exc), "code": "provider_unavailable"}, status=503)


class SearchView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        term = request.query_params.get("q", "").strip()
        if term and len(term) < 2:
            return Response({"detail": "Use at least two characters."}, status=400)
        try:
            page = max(1, int(request.query_params.get("page", "1")))
        except ValueError:
            return Response({"detail": "Page must be a number."}, status=400)
        choices = {
            "sort": ({"relevance": "SEARCH_MATCH", "trending": "TRENDING_DESC", "score": "SCORE_DESC", "popular": "POPULARITY_DESC", "newest": "START_DATE_DESC"}, "relevance"),
            "format": ({"tv": "TV", "movie": "MOVIE", "ova": "OVA", "ona": "ONA", "special": "SPECIAL"}, ""),
            "status": ({"airing": "RELEASING", "finished": "FINISHED", "upcoming": "NOT_YET_RELEASED"}, ""),
            "season": ({"current": current_season(), "winter": "WINTER", "spring": "SPRING", "summer": "SUMMER", "fall": "FALL"}, ""),
        }
        filters = {}
        for name, (allowed, default) in choices.items():
            value = request.query_params.get(name, default).lower()
            if value not in allowed and value != "":
                return Response({"detail": f"Unsupported {name}."}, status=400)
            filters[name] = allowed.get(value)
        filters["sort"] = filters["sort"] or "SEARCH_MATCH"
        filters["genre"] = request.query_params.get("genre", "").strip()[:40] or None
        if not term and filters["sort"] == "SEARCH_MATCH":
            filters["sort"] = "POPULARITY_DESC"
        try:
            return Response(search_titles(term, page, **filters))
        except ProviderUnavailable as exc:
            return Response({"detail": str(exc), "code": "provider_unavailable"}, status=503)


class DetailView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, media_id: int):
        try:
            return Response(title_detail(media_id))
        except ProviderUnavailable as exc:
            return Response({"detail": str(exc), "code": "provider_unavailable"}, status=503)


class CharacterSearchView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        term = request.query_params.get("q", "").strip()[:80]
        try:
            page = max(1, int(request.query_params.get("page", "1")))
        except ValueError:
            return Response({"detail": "Page must be a number."}, status=400)
        try:
            return Response(search_characters(term, page))
        except ProviderUnavailable as exc:
            return Response({"detail": str(exc), "code": "provider_unavailable"}, status=503)


class CharacterDetailView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, character_id: int):
        try:
            return Response(character_detail(character_id))
        except ProviderUnavailable as exc:
            return Response({"detail": str(exc), "code": "provider_unavailable"}, status=503)


class RegisterView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        display_name = str(request.data.get("displayName", "")).strip()[:80]
        password = str(request.data.get("password", ""))
        if "@" not in email or len(email) > 254:
            return Response({"detail": "Enter a valid email address."}, status=400)
        if len(password) < 8:
            return Response({"detail": "Use at least eight characters for your password."}, status=400)
        User = get_user_model()
        if User.objects.filter(username=email).exists():
            return Response({"detail": "An account already exists for this email."}, status=409)
        user = User.objects.create_user(username=email, email=email, password=password, first_name=display_name)
        return set_account_cookie(Response({"user": account_payload(user)}, status=201), user)


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        password = str(request.data.get("password", ""))
        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response({"detail": "Email or password is incorrect."}, status=401)
        return set_account_cookie(Response({"user": account_payload(user)}), user)


class AccountView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        user = signed_in_user(request)
        if user is None:
            return Response({"detail": "Sign in required."}, status=401)
        return Response({"user": account_payload(user)})


class LogoutView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        response = Response(status=204)
        response.delete_cookie(AUTH_COOKIE, path="/", samesite="Lax")
        return response


class ReviewView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, media_id: int):
        user = signed_in_user(request)
        reviews = Review.objects.filter(media_id=media_id).select_related("user")[:50]
        return Response({"reviews": [{"id": item.pk, "displayName": item.user.first_name or "Anime fan", "rating": item.rating, "body": item.body, "containsSpoilers": item.contains_spoilers, "updatedAt": item.updated_at.isoformat(), "isOwner": bool(user and item.user_id == user.pk)} for item in reviews]})

    def post(self, request, media_id: int):
        user = signed_in_user(request)
        if user is None:
            return Response({"detail": "Sign in to publish a review."}, status=401)
        try:
            rating = int(request.data.get("rating", 0))
        except (TypeError, ValueError):
            rating = 0
        body = str(request.data.get("body", "")).strip()
        title = str(request.data.get("title", "Anime"))[:240]
        if rating < 1 or rating > 10:
            return Response({"detail": "Choose a rating from 1 to 10."}, status=400)
        if len(body) < 10:
            return Response({"detail": "Write at least 10 characters."}, status=400)
        review, _ = Review.objects.update_or_create(user=user, media_id=media_id, defaults={"title": title, "rating": rating, "body": body, "contains_spoilers": bool(request.data.get("containsSpoilers", False))})
        return Response({"review": {"id": review.pk}}, status=201)

    def delete(self, request, media_id: int):
        user = signed_in_user(request)
        if user is None:
            return Response({"detail": "Sign in required."}, status=401)
        deleted, _ = Review.objects.filter(user=user, media_id=media_id).delete()
        if not deleted:
            return Response({"detail": "Review not found."}, status=404)
        return Response(status=204)


class AnimeQuestionView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, media_id: int):
        question = str(request.data.get("question", "")).strip()[:500]
        if len(question) < 3:
            return Response({"detail": "Ask a complete question."}, status=400)
        try:
            anime = title_detail(media_id)
        except ProviderUnavailable as exc:
            context = request.data.get("context") if isinstance(request.data.get("context"), dict) else {}
            if not context.get("title"):
                return Response({"detail": str(exc)}, status=503)
            anime = {key: context.get(key) for key in ("title", "nativeTitle", "description", "format", "status", "episodes", "season", "seasonYear", "genres", "averageScore", "watchLinks")}
            anime["sourceLabel"] = "page catalogue snapshot"
        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        if api_key:
            context = {key: anime.get(key) for key in ("title", "nativeTitle", "description", "format", "status", "episodes", "season", "seasonYear", "genres", "averageScore", "watchLinks")}
            try:
                response = httpx.post("https://api.openai.com/v1/responses", headers={"Authorization": f"Bearer {api_key}"}, json={"model": os.getenv("OPENAI_MODEL", "gpt-5-mini"), "input": f"Answer only from this anime catalogue record. If it does not contain the answer, say so. Record: {context}\nQuestion: {question}"}, timeout=15)
                response.raise_for_status()
                payload = response.json()
                answer = next((part.get("text") for item in payload.get("output", []) for part in item.get("content", []) if part.get("type") == "output_text"), "")
                if answer:
                    return Response({"answer": answer, "mode": "ai", "source": anime.get("sourceLabel", "AniList")})
            except (httpx.HTTPError, ValueError):
                pass
        lower = question.lower()
        if any(word in lower for word in ("watch", "stream", "available")):
            links = anime.get("watchLinks") or []
            answer = "Official viewing links in the catalogue: " + ", ".join(link["site"] for link in links) if links else "The catalogue does not currently list an official stream for this title. Availability can vary by region."
        elif any(word in lower for word in ("episode", "long", "length")):
            answer = f"{anime['title']} has {anime.get('episodes') or 'an unconfirmed number of'} episodes in the current catalogue record."
        elif any(word in lower for word in ("score", "rating", "rated")):
            answer = f"Its AniList community score is {anime.get('averageScore') / 10:.1f}/10." if anime.get("averageScore") else "The catalogue does not currently include a community score."
        elif any(word in lower for word in ("genre", "type", "kind")):
            answer = f"It is listed as {anime.get('format') or 'anime'} with these genres: {', '.join(anime.get('genres') or [])}."
        else:
            answer = anime.get("description") or "The catalogue does not contain enough information to answer that question yet."
        return Response({"answer": answer, "mode": "catalogue", "source": anime.get("sourceLabel", "AniList")})


class LibraryView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        user = signed_in_user(request)
        if user is None:
            return Response({"detail": "Sign in required."}, status=401)
        groups = {kind: [] for kind in ("visited", "liked", "watch_later")}
        for item in LibraryEntry.objects.filter(user=user)[:150]:
            groups[item.kind].append({"mediaId": item.media_id, "title": item.title, "slug": item.slug, "coverImage": item.cover_image, "updatedAt": item.updated_at.isoformat()})
        groups["reviewed"] = [{"mediaId": item.media_id, "title": item.title, "rating": item.rating, "updatedAt": item.updated_at.isoformat()} for item in Review.objects.filter(user=user)[:50]]
        return Response(groups)

    def post(self, request):
        user = signed_in_user(request)
        if user is None:
            return Response({"detail": "Sign in required."}, status=401)
        kind = str(request.data.get("kind", ""))
        if kind not in LibraryEntry.Kind.values:
            return Response({"detail": "Unknown library action."}, status=400)
        try:
            media_id = int(request.data.get("mediaId"))
        except (TypeError, ValueError):
            return Response({"detail": "Invalid anime ID."}, status=400)
        active = bool(request.data.get("active", True))
        lookup = {"user": user, "media_id": media_id, "kind": kind}
        if not active:
            LibraryEntry.objects.filter(**lookup).delete()
            return Response({"active": False})
        LibraryEntry.objects.update_or_create(**lookup, defaults={"title": str(request.data.get("title", "Anime"))[:240], "slug": str(request.data.get("slug", media_id))[:240], "cover_image": str(request.data.get("coverImage", ""))[:500]})
        return Response({"active": True})
