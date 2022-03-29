from django.db import models
from lans.models import Lan


class Event(models.Model):
    GAMES = "games"
    SOCIAL = "social"
    TOURNAMENT = "tournament"
    LAN = "lan"
    ORGANISATIONAL = "organisational"
    OTHER = "other"
    EVENT_TYPES = [
        (GAMES, "Games"),
        (SOCIAL, "Social"),
        (TOURNAMENT, "Tournament"),
        (LAN, "LAN"),
        (ORGANISATIONAL, "Organisational"),
        (OTHER, "Other"),
    ]

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=100, choices=EVENT_TYPES, default=GAMES)
    is_members_only = models.BooleanField(default=False)
    location = models.CharField(max_length=100)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    parent = models.ForeignKey(
        "self", related_name="children", on_delete=models.CASCADE, blank=True, null=True
    )
    lan = models.OneToOneField(Lan, on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self):
        return self.name
