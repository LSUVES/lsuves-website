from rest_framework import serializers

# from rest_framework.fields import CurrentUserDefault
from users.models import User

# TODO: Does this override the above User import?
from .models import *

# TODO: Decide whether to change HyperlinkedModelSerializers to ModelSerializers

# TODO: Change this to a regular serializer
class UserNameSerializer(serializers.ModelSerializer):
    """
    Serializes the ID and name fields of the User model. Used with other
    serializers so that this information doesn't need to be fetched separately.
    """

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name")


class CommitteeShiftSerializer(serializers.HyperlinkedModelSerializer):
    """
    Serializes all the fields of the CommitteeShift model.
    """

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


# TODO: Rename to distinguish from TicketUserNameSerializer
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
    """
    Serializes the ticket ID and user ID fields of LAN tickets.
    """

    class Meta:
        model = Ticket
        fields = ("id", "user")


class TicketUsernameSerializer(serializers.ModelSerializer):
    """
    Serializes the ticket ID and user name fields of LAN tickets.
    """

    user = UserNameSerializer()

    class Meta:
        model = Ticket
        fields = ("id", "user")


class SeatBookingGroupSerializer(serializers.HyperlinkedModelSerializer):
    """
    Serializes all the fields of the SeatBookingGroup model, using the
    TicketIdSerializer to also provide the owner (which would otherwise be a ticket).
    """

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
    """
    Serializes all the fields of the VanBooking model.
    """

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
    """
    Serializes all the fields of the FoodOrderShop model.
    """

    class Meta:
        model = FoodOrderShop
        fields = ("url", "id", "name", "order_by", "arrives_at", "is_open")


# TODO: Change this to a regular serializer
# class FoodOrderShopIdSerializer(serializers.ModelSerializer):
#     """
#     Serializes the ID of the FoodOrderShop model.
#     """

#     # Wouldn't be necessary if FoodOrderMenuItemSerializer wasn't a
#     # HyperLinkedModelSerializer.

#     class Meta:
#         model = FoodOrderShop
#         fields = ("url", "id")


class FoodOrderMenuItemSerializer(serializers.ModelSerializer):
    """
    Serializes all the fields of the FoodOrderMenuItem model.
    """

    # """", using the
    # FoodOrderShopIdSerializer to provide the ID of the shop, in addition to
    # the URL (which probably isn't necessary).
    # """

    # shop = FoodOrderShopIdSerializer()

    class Meta:
        model = FoodOrderMenuItem
        fields = ("id", "shop", "name", "info", "price")


class FoodOrderSerializer(serializers.ModelSerializer):
    """
    Serializes all the fields of the FoodOrder model.
    """

    class Meta:
        model = FoodOrder
        fields = ("id", "lan", "orderer", "option", "paid")
        extra_kwargs = {
            "lan": {"required": False},
            "orderer": {"required": False},
            "paid": {"required": False},
        }


# TODO: Consider naming scheme.
class FoodOrderDetailSerializer(serializers.ModelSerializer):
    """
    Serializes all the fields of the FoodOrder model with option details.
    """

    option = FoodOrderMenuItemSerializer()
    orderer = TicketUsernameSerializer()

    class Meta:
        model = FoodOrder
        fields = ("id", "lan", "orderer", "option", "paid")
        extra_kwargs = {
            "lan": {"required": False},
            "orderer": {"required": False},
            "paid": {"required": False},
        }
