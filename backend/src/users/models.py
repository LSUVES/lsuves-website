from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager


# An extension of Django's default user that adds the extra fields we need.
# See here for the default user's fields:
# https://docs.djangoproject.com/en/4.0/topics/auth/default/#user-objects-1
class User(AbstractUser):
    deletion_date = models.DateField("date of account deletion", blank=False, null=True)
    is_member = models.BooleanField("is member", default=False)
    # TODO: Add constraints to prevent this being true when is_member is
    is_requesting_membership = models.BooleanField(
        "is requesting membership", default=False
    )
    # FIXME: Technically this field should be unique and changes to this field should be logged
    #        to prevent potential abuse where two or more users may use the same credentials of
    #        a single ticket-owner.
    student_id = models.CharField("student id", max_length=20, blank=True)
    # emergency_contact_name = models.CharField("emergency contact name", max_length=100, blank=True)
    # emergency_contact_number = models.CharField("emergency contact number", max_length=31, blank=True)
    # Discord/game IGNs

    objects = UserManager()

    def __str__(self):
        return self.username
