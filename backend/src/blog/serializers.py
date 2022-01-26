from rest_framework import serializers

from .models import Post
from events.models import Event


class EventNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ("url", "id", "name")


class PostSerializer(serializers.HyperlinkedModelSerializer):
    events = EventNameSerializer(many=True, required=False)

    class Meta:
        model = Post
        fields = ("url", "id", "title", "body", "image", "date", "events")
