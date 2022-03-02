from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager


class User(AbstractUser):
    deletion_date = models.DateField("date of account deletion", blank=False, null=True)
    student_id = models.CharField("student id", max_length=20, blank=True)

    objects = UserManager()

    def __str__(self):
        return self.username
