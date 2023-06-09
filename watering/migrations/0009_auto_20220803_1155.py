# Generated by Django 2.0 on 2022-08-03 08:55

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('watering', '0008_locationevent'),
    ]

    operations = [
        migrations.CreateModel(
            name='WeatherForecast',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('hour', models.SmallIntegerField()),
                ('data', django.contrib.postgres.fields.jsonb.JSONField()),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='weatherforecast',
            unique_together={('date', 'hour')},
        ),
    ]
