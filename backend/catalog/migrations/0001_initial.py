from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(name="AnimeTitle", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("slug", models.SlugField(max_length=240, unique=True)),
            ("title_english", models.CharField(max_length=240)),
            ("title_romaji", models.CharField(blank=True, max_length=240)),
            ("title_native", models.CharField(blank=True, max_length=240)),
            ("synopsis", models.TextField(blank=True)),
            ("format", models.CharField(blank=True, choices=[("TV", "TV"), ("MOVIE", "Movie"), ("OVA", "OVA"), ("ONA", "ONA"), ("SPECIAL", "Special")], max_length=20)),
            ("status", models.CharField(blank=True, max_length=32)),
            ("episodes", models.PositiveIntegerField(blank=True, null=True)),
            ("season", models.CharField(blank=True, max_length=16)),
            ("season_year", models.PositiveSmallIntegerField(blank=True, null=True)),
            ("cover_image", models.URLField(blank=True, max_length=500)),
            ("banner_image", models.URLField(blank=True, max_length=500)),
            ("genres", models.JSONField(default=list)),
            ("average_score", models.PositiveSmallIntegerField(blank=True, null=True)),
            ("popularity", models.PositiveIntegerField(default=0)),
            ("updated_at", models.DateTimeField(auto_now=True)),
        ]),
        migrations.CreateModel(name="Character", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("external_id", models.CharField(max_length=100, unique=True)),
            ("name", models.CharField(max_length=240)),
            ("image", models.URLField(blank=True, max_length=500)),
            ("description", models.TextField(blank=True)),
            ("anime", models.ManyToManyField(blank=True, related_name="characters", to="catalog.animetitle")),
        ]),
        migrations.CreateModel(name="Availability", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("provider_name", models.CharField(max_length=80)), ("url", models.URLField(max_length=500)),
            ("region", models.CharField(default="GLOBAL", max_length=8)),
            ("access_type", models.CharField(default="subscription", max_length=20)),
            ("is_official", models.BooleanField(default=True)), ("checked_at", models.DateTimeField(auto_now=True)),
            ("anime", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="availability", to="catalog.animetitle")),
        ]),
        migrations.CreateModel(name="ExternalIdentity", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("provider", models.CharField(max_length=32)), ("external_id", models.CharField(max_length=100)),
            ("url", models.URLField(blank=True, max_length=500)), ("payload", models.JSONField(default=dict)),
            ("fetched_at", models.DateTimeField(auto_now=True)),
            ("anime", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="external_ids", to="catalog.animetitle")),
        ]),
        migrations.AddConstraint(model_name="externalidentity", constraint=models.UniqueConstraint(fields=("provider", "external_id"), name="unique_provider_title")),
    ]
