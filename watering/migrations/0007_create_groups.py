from django.db import migrations

from naiades_watering.settings import DEFAULT_GROUPS


def create_default_groups(apps, schema_editor):
    # get models at this stage
    Group = apps.get_model("auth", "Group")

    # create default groups
    for group_name in DEFAULT_GROUPS:
        Group.objects.get_or_create(name=group_name)


class Migration(migrations.Migration):

    dependencies = [
        ('watering', '0006_create_superuser'),
    ]

    operations = [
        migrations.RunPython(create_default_groups, reverse_code=lambda _, __: None),
    ]
