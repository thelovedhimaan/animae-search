from django.urls import path
from .views import CharacterDetailView, CharacterSearchView, DetailView, DiscoveryView, HealthView, SearchView

urlpatterns = [
    path("health", HealthView.as_view(), name="health"),
    path("discovery/home", DiscoveryView.as_view(), name="discovery"),
    path("search", SearchView.as_view(), name="search"),
    path("anime/<int:media_id>", DetailView.as_view(), name="anime-detail"),
    path("characters", CharacterSearchView.as_view(), name="character-search"),
    path("characters/<int:character_id>", CharacterDetailView.as_view(), name="character-detail"),
]
