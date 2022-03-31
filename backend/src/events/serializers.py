from rest_framework import serializers

from .models import Event


class EventSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Event
        fields = (
            "url",
            "id",
            "name",
            "type",
            "is_members_only",
            "location",
            "start_time",
            "end_time",
            "parent",
        )
