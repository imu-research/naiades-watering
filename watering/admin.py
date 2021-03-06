from django.contrib import admin

from watering.models import Event, Issue


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
