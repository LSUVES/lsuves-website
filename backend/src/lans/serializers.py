from rest_framework import serializers

from .models import *


class LanSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Lan
        fields = ("url", "id", "number", "theme")


class TicketRequestSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = TicketRequest
        fields = ("url", "id", "lan", "user")
        # Since we don't pass in the user and lan fields as part of the request, they
        # are not required during deserialisation
        extra_kwargs = {"lan": {"required": False}, "user": {"required": False}}


class TicketSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        mdoel = Ticket
        fields = (
            "url",
            "id",
            "lan",
            "user",
            "seat_booking_group",
            "is_activated",
            "seat",
        )
        # As with the TicketRequestSerializer, the view generates the value for the
        # lan field, however the user is passed in the request. The remaining fields
        # are simply not required.
        # TODO: See if there's a different way of handling such unrequired fields.
        extra_kwargs = {
            "lan": {"required": False},
            "seat_booking_group": {"required": False},
            "is_activated": {"required": False},
            "seat": {"required": False},
        }
