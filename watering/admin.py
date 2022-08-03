from django.contrib import admin

from watering.models import LocationEvent, Event, Issue, WeatherForecast


@admin.register(LocationEvent)
class LocationEventAdmin(admin.ModelAdmin):
    list_display = ("entered", "exited", "box_id", "user", )
    list_filter = ("user", )
    ordering = ("-entered", )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("box_id", "start_date", "end_date", "consumption", )
    list_filter = ("box_id", )
    ordering = ("-start_date", )


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ("box_id", "submitted_by", "issue_type", "created", "resolved", )
    list_filter = ("box_id", "issue_type", "resolved", )
    ordering = ("-created", )


@admin.register(WeatherForecast)
class WeatherForecastAdmin(admin.ModelAdmin):
    list_display = ("date", "hour", "updated_at", )
    ordering = ("-date", "-hour")
