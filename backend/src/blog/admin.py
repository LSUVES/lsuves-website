from django.contrib import admin

from .models import Post


class PostAdmin(admin.ModelAdmin):
    # Date should be set automatically
    list_display = ("title", "body", "image", "date")


admin.site.register(Post, PostAdmin)
