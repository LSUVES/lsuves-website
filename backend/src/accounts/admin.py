from django.contrib import admin

from .models import User


class UserAdmin(admin.ModelAdmin):
    list_display = [
        "email",
        "username",
        "deletion_date",
    ]


admin.site.register(User, UserAdmin)
