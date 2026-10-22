from django.contrib import admin
from .models import AnimeTitle, Availability, Character, ExternalIdentity

admin.site.register([AnimeTitle, Availability, Character, ExternalIdentity])
