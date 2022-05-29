from django.db import models


# TODO: Add manager to ensure start_date comes before end_date.
class Event(models.Model):
    """
    Event model, provides fields for the name of the event, the type of the event
    (e.g., games, social, tournament), whether the event is members only, where the
    event will be located (can be a physical address or url), the start and end times
    of the event, and any parent event that this event is a child to (e.g., a LAN
    tournament would have the LAN event as its parent).
    """

    # TODO: Add "food" event type
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
    # TODO: Add description and image fields.
    #       Beware using type as a variable name.
    type = models.CharField(max_length=100, choices=EVENT_TYPES, default=GAMES)
    is_members_only = models.BooleanField(default=False)
    location = models.CharField(max_length=100)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    parent = models.ForeignKey(
        "self", related_name="children", on_delete=models.CASCADE, blank=True, null=True
    )

    def __str__(self):
        return self.name
