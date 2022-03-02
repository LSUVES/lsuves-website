from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


# class CustomUserAdmin(admin.ModelAdmin):
#     list_display = [
#         "username",
#         "email",
#         "deletion_date",
#     ]
#     list_filter = ["is_staff"]
#     search_fields = ["username", "email"]

admin.site.register(User, UserAdmin)
