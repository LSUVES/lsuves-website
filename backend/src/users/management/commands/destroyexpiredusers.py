from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone


class Command(BaseCommand):
    help = "Destroys all user accounts with a date of deletion in the past."

    def handle(self, *args, **options):
        start_time = timezone.now()
        expired_users = get_user_model().objects.filter(deletion_date__lte=start_time)
        self.stdout.write("Found {} expired user accounts.".format(len(expired_users)))
        for expired_user in expired_users:
            self.stdout.write("Destroying user: {}".format(expired_user.username))
            # FIXME: Catch issues from on_delete=PROTECT relations
            expired_user.delete()
            self.stdout.write("User destroyed.")
        duration = (timezone.now() - start_time).total_seconds()
        self.stdout.write("Finished in {} seconds.".format(duration))
