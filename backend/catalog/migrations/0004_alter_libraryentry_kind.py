from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("catalog", "0003_libraryentry")]
    operations = [migrations.AlterField(model_name="libraryentry", name="kind", field=models.CharField(choices=[("visited", "Visited"), ("liked", "Liked"), ("watch_later", "Watch later"), ("watching", "Watching"), ("completed", "Completed"), ("paused", "Paused"), ("dropped", "Dropped")], max_length=20))]
