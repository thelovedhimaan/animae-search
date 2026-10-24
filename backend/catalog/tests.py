from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from .providers.wikimedia import WikimediaClient


class CatalogApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health(self):
        response = self.client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_short_search_is_rejected(self):
        response = self.client.get("/api/v1/search?q=x")
        self.assertEqual(response.status_code, 400)

    @patch("catalog.views.search_titles")
    def test_search_contract(self, search):
        search.return_value = {"results": [{"id": 1, "title": "Cowboy Bebop"}], "page": {"hasNextPage": False}}
        response = self.client.get("/api/v1/search?q=cowboy")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["results"][0]["title"], "Cowboy Bebop")

    @patch("catalog.views.search_titles")
    def test_filtered_browse_contract(self, search):
        search.return_value = {"results": [], "page": {"currentPage": 2, "hasNextPage": True}}
        response = self.client.get("/api/v1/search?format=movie&sort=score&page=2")
        self.assertEqual(response.status_code, 200)
        search.assert_called_once_with("", 2, sort="SCORE_DESC", format="MOVIE", status=None, season=None, genre=None)

    @patch("catalog.views.search_titles")
    def test_filter_only_browse_defaults_to_popularity(self, search):
        search.return_value = {"results": [], "page": {"currentPage": 1, "hasNextPage": False}}
        response = self.client.get("/api/v1/search?format=movie")
        self.assertEqual(response.status_code, 200)
        search.assert_called_once_with("", 1, sort="POPULARITY_DESC", format="MOVIE", status=None, season=None, genre=None)

    def test_invalid_filter_is_rejected(self):
        response = self.client.get("/api/v1/search?format=game")
        self.assertEqual(response.status_code, 400)

    @patch("catalog.views.search_titles")
    def test_current_season_is_supported(self, search):
        search.return_value = {"results": [], "page": {"hasNextPage": False}}
        response = self.client.get("/api/v1/search?season=current")
        self.assertEqual(response.status_code, 200)
        self.assertIn(search.call_args.kwargs["season"], {"WINTER", "SPRING", "SUMMER", "FALL"})

    def test_account_registration_session_and_logout(self):
        response = self.client.post("/api/v1/account/register", {"email": "fan@example.com", "displayName": "Anime Fan", "password": "strong-pass"}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["user"]["displayName"], "Anime Fan")
        self.assertIn("anime_session", response.cookies)
        self.assertEqual(self.client.get("/api/v1/account/me").status_code, 200)
        self.assertEqual(self.client.post("/api/v1/account/logout").status_code, 204)

    def test_account_login_rejects_bad_password(self):
        self.client.post("/api/v1/account/register", {"email": "fan@example.com", "password": "strong-pass"}, format="json")
        self.client.cookies.clear()
        response = self.client.post("/api/v1/account/login", {"email": "fan@example.com", "password": "wrong-pass"}, format="json")
        self.assertEqual(response.status_code, 401)

    def test_signed_in_user_can_publish_and_update_review(self):
        self.client.post("/api/v1/account/register", {"email": "reviewer@example.com", "displayName": "Reviewer", "password": "strong-pass"}, format="json")
        created = self.client.post("/api/v1/reviews/1", {"title": "Cowboy Bebop", "rating": 9, "body": "A timeless space western."}, format="json")
        self.assertEqual(created.status_code, 201)
        reviews = self.client.get("/api/v1/reviews/1").json()["reviews"]
        self.assertEqual(len(reviews), 1)
        self.assertEqual(reviews[0]["displayName"], "Reviewer")

    def test_review_requires_account(self):
        response = self.client.post("/api/v1/reviews/1", {"rating": 9, "body": "A timeless space western."}, format="json")
        self.assertEqual(response.status_code, 401)

    def test_user_can_delete_own_review(self):
        self.client.post("/api/v1/account/register", {"email": "delete@example.com", "password": "strong-pass"}, format="json")
        self.client.post("/api/v1/reviews/1", {"title": "Cowboy Bebop", "rating": 9, "body": "A timeless space western."}, format="json")
        reviews = self.client.get("/api/v1/reviews/1").json()["reviews"]
        self.assertTrue(reviews[0]["isOwner"])
        self.assertEqual(self.client.delete("/api/v1/reviews/1").status_code, 204)
        self.assertEqual(self.client.get("/api/v1/reviews/1").json()["reviews"], [])

    @patch.dict("os.environ", {"GEMINI_API_KEY": "", "OPENAI_API_KEY": ""})
    @patch("catalog.views.title_detail")
    def test_anime_question_uses_grounded_catalogue_answer(self, detail):
        detail.return_value = {"title": "Cowboy Bebop", "episodes": 26, "sourceLabel": "Wikidata", "watchLinks": []}
        response = self.client.post("/api/v1/anime/1/ask", {"question": "How many episodes are there?"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIn("26", response.json()["answer"])
        self.assertEqual(response.json()["mode"], "catalogue")

    def test_library_tracks_and_removes_title(self):
        self.client.post("/api/v1/account/register", {"email": "library@example.com", "password": "strong-pass"}, format="json")
        payload = {"mediaId": 1, "kind": "watch_later", "title": "Cowboy Bebop", "slug": "cowboy-bebop", "coverImage": "https://example.com/cover.jpg"}
        self.assertEqual(self.client.post("/api/v1/library", payload, format="json").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/library").json()["watch_later"][0]["title"], "Cowboy Bebop")
        payload["active"] = False
        self.client.post("/api/v1/library", payload, format="json")
        self.assertEqual(self.client.get("/api/v1/library").json()["watch_later"], [])

    def test_watch_statuses_are_mutually_exclusive(self):
        self.client.post("/api/v1/account/register", {"email": "status@example.com", "password": "strong-pass"}, format="json")
        base = {"mediaId": 1, "title": "Cowboy Bebop", "slug": "cowboy-bebop"}
        self.client.post("/api/v1/library", {**base, "kind": "watching"}, format="json")
        self.client.post("/api/v1/library", {**base, "kind": "completed"}, format="json")
        library = self.client.get("/api/v1/library").json()
        self.assertEqual(library["watching"], [])
        self.assertEqual(library["completed"][0]["title"], "Cowboy Bebop")

    def test_user_can_export_and_delete_account(self):
        self.client.post("/api/v1/account/register", {"email": "privacy@example.com", "displayName": "Private Fan", "password": "strong-pass"}, format="json")
        exported = self.client.get("/api/v1/account/data")
        self.assertEqual(exported.status_code, 200)
        self.assertEqual(exported.json()["profile"]["email"], "privacy@example.com")
        self.assertEqual(self.client.delete("/api/v1/account/data").status_code, 204)
        self.assertEqual(self.client.get("/api/v1/account/me").status_code, 401)

    @patch("catalog.views.search_titles")
    def test_search_suggestions_are_limited(self, search):
        search.return_value = {"results": [{"id": index, "title": f"Anime {index}"} for index in range(10)]}
        response = self.client.get("/api/v1/search/suggest?q=anime")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["results"]), 6)

    @patch("catalog.views.search_characters")
    def test_character_search_contract(self, search):
        search.return_value = {"results": [{"id": 1, "name": "Spike Spiegel"}], "page": {"currentPage": 1, "hasNextPage": False}, "source": "Wikidata"}
        response = self.client.get("/api/v1/characters?q=spike")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["results"][0]["name"], "Spike Spiegel")
        search.assert_called_once_with("spike", 1)

    @patch("catalog.views.character_detail")
    def test_character_detail_contract(self, detail):
        detail.return_value = {"id": 1, "name": "Spike Spiegel", "appearances": []}
        response = self.client.get("/api/v1/characters/1")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], 1)


class WikimediaNormalizationTests(TestCase):
    def test_cc0_record_keeps_qid_numeric_route_and_media_provenance(self):
        entity = {
            "id": "Q101244908",
            "labels": {"en": {"value": "Cowboy Bebop"}, "ja": {"value": "カウボーイビバップ"}},
            "descriptions": {"en": {"value": "Japanese anime television series"}},
            "claims": {
                "P31": [{"mainsnak": {"datavalue": {"value": {"id": "Q63952888"}}}}],
                "P1113": [{"mainsnak": {"datavalue": {"value": {"amount": "+26", "unit": "1"}}}}],
                "P18": [{"mainsnak": {"datavalue": {"value": "Cowboy Bebop editorial.jpg"}}}],
            },
            "sitelinks": {"enwiki": {"title": "Cowboy Bebop"}},
        }
        media = {"Cowboy Bebop editorial.jpg": {"url": "https://upload.wikimedia.org/example.jpg", "creator": "Contributor", "license": "CC BY-SA 4.0", "sourceUrl": "https://commons.wikimedia.org/example"}}
        client = WikimediaClient()
        with patch.object(client, "_entities", return_value={}), patch.object(client, "_commons_metadata", return_value=media):
            result = client._normalize_many([entity])[0]
        self.assertEqual(result["id"], 101244908)
        self.assertEqual(result["format"], "TV")
        self.assertEqual(result["episodes"], 26)
        self.assertEqual(result["sourceLabel"], "Wikidata")
        self.assertEqual(result["imageAttribution"]["license"], "CC BY-SA 4.0")
