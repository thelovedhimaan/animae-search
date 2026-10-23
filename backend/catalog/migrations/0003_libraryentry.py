from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("catalog", "0002_review"), migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(
            name="LibraryEntry",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("media_id", models.PositiveIntegerField(db_index=True)),
                ("kind", models.CharField(choices=[("visited", "Visited"), ("liked", "Liked"), ("watch_later", "Watch later")], max_length=20)),
                ("title", models.CharField(max_length=240)),
                ("slug", models.SlugField(max_length=240)),
                ("cover_image", models.URLField(blank=True, max_length=500)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="anime_library", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-updated_at"]},
        ),
        migrations.AddConstraint(model_name="libraryentry", constraint=models.UniqueConstraint(fields=("user", "media_id", "kind"), name="one_library_entry_per_kind")),
    ]
