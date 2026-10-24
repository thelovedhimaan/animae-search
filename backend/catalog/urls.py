from django.urls import path
from .views import AccountDataView, AccountView, AnimeQuestionView, CharacterDetailView, CharacterSearchView, DetailView, DiscoveryView, GoogleCallbackView, GoogleStartView, HealthView, LibraryView, LoginView, LogoutView, RegisterView, ReviewView, SearchView, SuggestView

urlpatterns = [
    path("health", HealthView.as_view(), name="health"),
    path("discovery/home", DiscoveryView.as_view(), name="discovery"),
    path("search", SearchView.as_view(), name="search"),
    path("search/suggest", SuggestView.as_view(), name="search-suggest"),
    path("anime/<int:media_id>", DetailView.as_view(), name="anime-detail"),
    path("characters", CharacterSearchView.as_view(), name="character-search"),
    path("characters/<int:character_id>", CharacterDetailView.as_view(), name="character-detail"),
    path("account/register", RegisterView.as_view(), name="account-register"),
    path("account/login", LoginView.as_view(), name="account-login"),
    path("account/google/start", GoogleStartView.as_view(), name="account-google-start"),
    path("account/google/callback", GoogleCallbackView.as_view(), name="account-google-callback"),
    path("account/logout", LogoutView.as_view(), name="account-logout"),
    path("account/me", AccountView.as_view(), name="account-me"),
    path("account/data", AccountDataView.as_view(), name="account-data"),
    path("reviews/<int:media_id>", ReviewView.as_view(), name="reviews"),
    path("library", LibraryView.as_view(), name="library"),
    path("anime/<int:media_id>/ask", AnimeQuestionView.as_view(), name="anime-ask"),
]
