from django.urls import path
from .views import AccountView, CharacterDetailView, CharacterSearchView, DetailView, DiscoveryView, HealthView, LibraryView, LoginView, LogoutView, RegisterView, ReviewView, SearchView

urlpatterns = [
    path("health", HealthView.as_view(), name="health"),
    path("discovery/home", DiscoveryView.as_view(), name="discovery"),
    path("search", SearchView.as_view(), name="search"),
    path("anime/<int:media_id>", DetailView.as_view(), name="anime-detail"),
    path("characters", CharacterSearchView.as_view(), name="character-search"),
    path("characters/<int:character_id>", CharacterDetailView.as_view(), name="character-detail"),
    path("account/register", RegisterView.as_view(), name="account-register"),
    path("account/login", LoginView.as_view(), name="account-login"),
    path("account/logout", LogoutView.as_view(), name="account-logout"),
    path("account/me", AccountView.as_view(), name="account-me"),
    path("reviews/<int:media_id>", ReviewView.as_view(), name="reviews"),
    path("library", LibraryView.as_view(), name="library"),
]
