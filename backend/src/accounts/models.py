from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    deletion_date = models.DateField(blank=False, null=True)

    def __str__(self):
        return self.username
