from datetime import date, datetime

from django.contrib.auth.base_user import BaseUserManager
from django.utils import timezone


class UserManager(BaseUserManager):
    def _create_user(self, username, email, deletion_date, password, **extra_fields):
        if not username:
            raise ValueError("A valid username must be provided.")
        if not email:
            raise ValueError("A valid email must be provided.")
        if not password:
            raise ValueError("A valid password must be provided.")
        username = self.model.normalize_username(username)
        email = self.normalize_email(email)
        user = self.model(
            username=username, email=email, deletion_date=deletion_date, **extra_fields
        )
        user.set_password(password)
        user.save()
        return user

    def create_user(self, username, email, deletion_date, password):
        current_date = timezone.now().date()
        if (
            not isinstance(deletion_date, date)
            or deletion_date
            < current_date.replace(
                year=current_date.year + int(current_date.month / 12),
                month=((current_date.month % 12) + 1),
                day=1,
            )
            or deletion_date
            > current_date.replace(
                year=current_date.year + 5,
                month=8,
                day=1,
            )
        ):
            raise ValueError("A valid deletion date must be provided.")
        return self._create_user(username, email, deletion_date, password)

    def create_superuser(self, username, email, password):
        return self._create_user(
            username, email, None, password, is_staff=True, is_superuser=True
        )
