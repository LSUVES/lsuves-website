from django.contrib import admin

from .models import Event


class EventAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "location",
        "start_time",
        "end_time",
        "parent",
    )  # , "blog_post")  list_display can't have many to many field


admin.site.register(Event, EventAdmin)
