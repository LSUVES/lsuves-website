from rest_framework import serializers

# from rest_framework.fields import CurrentUserDefault
from users.models import User

# TODO: Does this override the above User import?
from .models import *

# TODO: Decide whether to change HyperlinkedModelSerializers to ModelSerializers

# TODO: Change this to a regular serializer
class UserNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name")


class CommitteeShiftSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = CommitteeShift
        fields = ("url", "id", "lan", "start_time", "end_time", "committee")
        extra_kwargs = {"lan": {"required": False}}


class TicketRequestSerializer(serializers.HyperlinkedModelSerializer):
    """
    Serializes ticket requests with fields for the LAN ID and user ID.
    """

    class Meta:
        model = TicketRequest
        fields = ("url", "id", "lan", "user")
        # Since we don't pass in the user and lan fields as part of the request, they
        # are not required during deserialisation
        extra_kwargs = {"lan": {"required": False}, "user": {"required": False}}


class TicketRequestUserSerializer(serializers.HyperlinkedModelSerializer):
    """
    Same as above but repleaces user ID with a nested serialized representation of the user's
    username, first name, and last name.
    """

    user = UserNameSerializer()

    class Meta:
        model = TicketRequest
        fields = ("url", "id", "lan", "user")
        # Since we don't pass in the user and lan fields as part of the request, they
        # are not required during deserialisation
        extra_kwargs = {"lan": {"required": False}, "user": {"required": False}}


class TicketSerializer(serializers.HyperlinkedModelSerializer):
    """
    Serializes tickets with fields for LAN ID, user ID, seat booking group ID, whether
    the ticket has been activated, and the seat number.
    """

    class Meta:
        model = Ticket
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


class TicketUserSerializer(serializers.HyperlinkedModelSerializer):
    """
    Same as above but repleaces user ID with a nested serialized representation of the user's
    username, first name, and last name.
    """

    user = UserNameSerializer()

    class Meta:
        model = Ticket
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


class TicketIdSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ("id", "user")


class SeatBookingGroupSerializer(serializers.HyperlinkedModelSerializer):
    owner = TicketIdSerializer(required=False)

    class Meta:
        model = SeatBookingGroup
        fields = ("url", "id", "lan", "owner", "name", "preference")
        extra_kwargs = {"lan": {"required": False}, "owner": {"required": False}}


# TODO: Use a better name.
#       Use serializer for owner.
# class UserSeatBookingGroupSerializer(serializers.HyperlinkedModelSerializer):
#     isOwner = serializers.SerializerMethodField()
#
#     def get_isOwner(self, obj):
#         print(obj.owner)
#         # FIXME: Void without passing context={"request", request}, then
#         #        it gives TypeError: 'set' object is not subscriptable
#         print(CurrentUserDefault())
#         return obj.owner == CurrentUserDefault()
#
#     class Meta:
#         model = SeatBookingGroup
#         fields = ("url", "id", "lan", "owner", "name", "preference", "isOwner")
#         extra_kwargs = {"lan": {"required": False}, "owner": {"required": False}}


class VanBookingSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = VanBooking
        fields = (
            "url",
            "id",
            "lan",
            "requester",
            "contact_phone_number",
            "address",
            "postcode",
            "collection_required",
            "dropoff_required",
            "availability",
        )
        extra_kwargs = {"lan": {"required": False}, "requester": {"required": False}}


class FoodOrderShopSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = FoodOrderShop
        fields = ("url", "id", "name", "order_by", "arrives_at", "is_open")


class FoodOrderMenuItemSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = FoodOrderMenuItem
        fields = ("url", "id", "shop", "name", "info", "price")


class FoodOrderSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = FoodOrder
        fields = ("url", "id", "lan", "orderer", "option", "paid")
        extra_kwargs = {
            "lan": {"required": False},
            "orderer": {"required": False},
            "paid": {"required": False},
        }
