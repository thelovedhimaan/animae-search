from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient


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

    def test_invalid_filter_is_rejected(self):
        response = self.client.get("/api/v1/search?format=game")
        self.assertEqual(response.status_code, 400)
