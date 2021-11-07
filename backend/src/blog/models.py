from django.db import models
from events.models import Event


class Post(models.Model):
    title = models.CharField(max_length=100)
    body = models.TextField(blank=True, default="")
    image = models.ImageField(blank=True)
    date = models.DateTimeField()
    events = models.ManyToManyField(Event, blank=True)
