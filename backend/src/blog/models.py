from django.db import models
from events.models import Event

# from django.core.validators import MinLengthValidator


class Post(models.Model):
    # TODO: Add MinLengthValidator to prevent empty string being used, though this may.
    #       already be prevented by the serializer. Also note effects on frontend admin
    #       when trying to edit a post without a title.
    title = models.CharField(max_length=100)  # validators=[MinLengthValidator(1)]
    # TODO: Should a blank body really be allowed?
    body = models.TextField(blank=True, default="")
    image = models.ImageField(blank=True)
    # TODO: Make date default to current time at creation. If not here, then in the serializer.
    date = models.DateTimeField()
    events = models.ManyToManyField(Event, blank=True)
    # TODO: Add published BooleanField to allow for saving unpublished posts.
