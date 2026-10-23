from django.db import connections
from django.db.utils import OperationalError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .providers.anilist import ProviderUnavailable
from .services import discovery_home, search_titles, title_detail


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
            "season": ({"winter": "WINTER", "spring": "SPRING", "summer": "SUMMER", "fall": "FALL"}, ""),
        }
        filters = {}
        for name, (allowed, default) in choices.items():
            value = request.query_params.get(name, default).lower()
            if value not in allowed and value != "":
                return Response({"detail": f"Unsupported {name}."}, status=400)
            filters[name] = allowed.get(value)
        filters["sort"] = filters["sort"] or "SEARCH_MATCH"
        filters["genre"] = request.query_params.get("genre", "").strip()[:40] or None
        if not term and not any(filters.get(key) for key in ("format", "status", "season", "genre")) and filters["sort"] == "SEARCH_MATCH":
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
