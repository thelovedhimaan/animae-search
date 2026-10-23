from django.db import models
from django.conf import settings


class AnimeTitle(models.Model):
    class Format(models.TextChoices):
        TV = "TV", "TV"
        MOVIE = "MOVIE", "Movie"
        OVA = "OVA", "OVA"
        ONA = "ONA", "ONA"
        SPECIAL = "SPECIAL", "Special"

    slug = models.SlugField(max_length=240, unique=True)
    title_english = models.CharField(max_length=240)
    title_romaji = models.CharField(max_length=240, blank=True)
    title_native = models.CharField(max_length=240, blank=True)
    synopsis = models.TextField(blank=True)
    format = models.CharField(max_length=20, choices=Format.choices, blank=True)
    status = models.CharField(max_length=32, blank=True)
    episodes = models.PositiveIntegerField(null=True, blank=True)
    season = models.CharField(max_length=16, blank=True)
    season_year = models.PositiveSmallIntegerField(null=True, blank=True)
    cover_image = models.URLField(max_length=500, blank=True)
    banner_image = models.URLField(max_length=500, blank=True)
    genres = models.JSONField(default=list)
    average_score = models.PositiveSmallIntegerField(null=True, blank=True)
    popularity = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title_english


class ExternalIdentity(models.Model):
    anime = models.ForeignKey(AnimeTitle, related_name="external_ids", on_delete=models.CASCADE)
    provider = models.CharField(max_length=32)
    external_id = models.CharField(max_length=100)
    url = models.URLField(max_length=500, blank=True)
    payload = models.JSONField(default=dict)
    fetched_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["provider", "external_id"], name="unique_provider_title")]


class Availability(models.Model):
    anime = models.ForeignKey(AnimeTitle, related_name="availability", on_delete=models.CASCADE)
    provider_name = models.CharField(max_length=80)
    url = models.URLField(max_length=500)
    region = models.CharField(max_length=8, default="GLOBAL")
    access_type = models.CharField(max_length=20, default="subscription")
    is_official = models.BooleanField(default=True)
    checked_at = models.DateTimeField(auto_now=True)


class Character(models.Model):
    external_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=240)
    image = models.URLField(max_length=500, blank=True)
    description = models.TextField(blank=True)
    anime = models.ManyToManyField(AnimeTitle, related_name="characters", blank=True)


class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="anime_reviews", on_delete=models.CASCADE)
    media_id = models.PositiveIntegerField(db_index=True)
    title = models.CharField(max_length=240)
    rating = models.PositiveSmallIntegerField()
    body = models.TextField(max_length=2000)
    contains_spoilers = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        constraints = [models.UniqueConstraint(fields=["user", "media_id"], name="one_review_per_user_title")]
