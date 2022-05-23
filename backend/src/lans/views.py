from avgs_website.permissions import IsAdminUserOrReadOnly, IsOwner
from django.shortcuts import get_list_or_404, get_object_or_404
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import *
from .permissions import HasLanTicket, LanTicketIsOwner
from .serializers import *
from .utils import get_current_lan

# TODO: Instead of manually passing in requesting user to serializers, consider
#       using default values on serializers with context:
#       https://www.django-rest-framework.org/api-guide/fields/#default


class CommitteeShiftViewSet(viewsets.ModelViewSet):
    queryset = CommitteeShift.objects.all()
    serializer_class = CommitteeShiftSerializer


# TODO: Might just be better to inherit from ViewSet and override
#       update and partial_update at this point.
#       That said, if destroy is handled by the Ticket create/a custom TicketRequest
#       rejection method, that mixin might not be needed either.
class TicketRequestViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for ticket creating, requesting, destroying and approving LAN ticket requests.
    """

    queryset = TicketRequest.objects.all()

    def get_queryset(self):
        current = "current" in self.request.query_params

        if current:
            self.queryset = self.queryset.filter(lan=get_current_lan())

        return super().get_queryset()

    def get_serializer_class(self):
        if self.action == "create":
            self.serializer_class = TicketRequestSerializer
        else:
            self.serializer_class = TicketRequestUserSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        # All authenticated users must be able to create a LAN ticket; an individual
        # ticket must only be retrieved by its owner; listing and destroying tickets
        # must only be available to admins.
        if self.action == "retrieve" or self.action == "my_lan_ticket_request":
            self.permission_classes = [IsOwner]  # |IsAdminUser]
        elif self.action == "create":
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()

    def get_object(self):
        # In order to filter on two lookup fields, it is necessary to override the
        # base implementation.
        # See: https://github.com/encode/django-rest-framework/blob/df92e57ad6c8394ca54654dfc7a2722f822ed8c8/rest_framework/generics.py#L75
        if self.action == "my_lan_ticket_request":
            queryset = self.filter_queryset(self.get_queryset())
            filter_kwargs = {"user": self.kwargs["user"], "lan": self.kwargs["lan"]}
            obj = get_object_or_404(queryset, **filter_kwargs)
            self.check_object_permissions(self.request, obj)
            return obj
        return super().get_object()

    # TODO: Although this will override any values for user/lan in the request,
    #       is there a way to prevent these values from ever being accepted?
    #       Consider overriding .create() instead.
    def perform_create(self, serializer):
        """
        Overrides CreateModelMixin.perform_create() to ensure that a ticket request is created
        for only the current LAN and for the requesting user.
        """
        serializer.save(lan=get_current_lan(), user=self.request.user)
        print(serializer.errors)

    # Return the LAN ticket request for the requesting user.
    # FIXME: Should return negative if get_current_lan() throws Event.DoesNotExist
    @action(detail=False)  # url_path="my-lan-ticket-request"
    def my_lan_ticket_request(self, request):
        """
        Custom action for getting a user's own ticket request, if it exists.
        """
        # Normally self.kwargs is populated by parameters provided in the url. E.g.,
        # /api/lan-ticket-requests/<pk>/ will give self.kwargs["pk"] = <pk>. Here,
        # they are set manually.
        # These are then used by the overriden get_object method to get the matching
        # ticket request which is then serialized and returned in a Response.
        self.kwargs["user"] = request.user
        self.kwargs["lan"] = get_current_lan()
        ticket_request = self.get_object()
        serializer = self.get_serializer(ticket_request)
        return Response(serializer.data)

    @action(methods=["POST"], detail=False)
    def approve_ticket_request(self, request):
        """
        Custom action for approving a user's ticket request and creating a ticket for them for the
        current LAN.
        """
        user = User.objects.get(id=request.data["userId"])
        # FIXME: Validate the below and include any errors in response.
        Ticket.objects.create(lan=get_current_lan(), user=user)
        if Ticket.objects.get(lan=get_current_lan(), user=user):
            # Delete old TicketRequest.
            # Note that get_queryset() won't already be filtered to current LAN.
            self.get_queryset().get(lan=get_current_lan(), user=user).delete()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet for creating, requesting, updating, and destroying LAN tickets. Note that tickets are
    typically created by admins using the .approve_ticket_request() custom action of
    TicketRequestViewSet.
    """

    queryset = Ticket.objects.all()

    def get_queryset(self):
        current = "current" in self.request.query_params

        if current:
            self.queryset = self.queryset.filter(lan=get_current_lan())

        return super().get_queryset()

    def get_serializer_class(self):
        if self.action == "list":
            self.serializer_class = TicketUserSerializer
        else:
            self.serializer_class = TicketSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        # Tickets may be retrieved by their owners, all other operations are only
        # permitted to admins.
        if self.action == "retrieve" or self.action == "my_lan_ticket":
            self.permission_classes = [IsOwner | IsAdminUser]
        else:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()

    def get_object(self):
        if self.action == "my_lan_ticket":
            queryset = self.filter_queryset(self.get_queryset())
            filter_kwargs = {"user": self.kwargs["user"], "lan": self.kwargs["lan"]}
            obj = get_object_or_404(queryset, **filter_kwargs)
            print("get_object: {}".format(obj))
            self.check_object_permissions(self.request, obj)
            return obj
        return super().get_object()

    def perform_create(self, serializer):
        serializer.save(lan=get_current_lan())

    @action(detail=False)
    def my_lan_ticket(self, request):
        """
        Returns the LAN ticket for the requesting user, if they have one, otherwise raises Http404.
        """
        # Same logic as TicketRequestViewSet.my_lan_ticket_request() above.
        # FIXME: Instead of returning a 404, return negative if get_current_lan() raises Http404 (or change get_current_lan)
        #        Likewise with tickets, see https://github.com/django/django/blob/main/django/shortcuts.py#L64
        self.kwargs["user"] = request.user
        self.kwargs["lan"] = get_current_lan()
        ticket_request = self.get_object()
        serializer = self.get_serializer(ticket_request)
        return Response(serializer.data)


class SeatBookingViewSet(viewsets.ModelViewSet):
    queryset = SeatBookingGroup.objects.all()
    serializer_class = SeatBookingGroupSerializer
    owner_field = "owner"

    def get_queryset(self):
        current = "current" in self.request.query_params

        if current:
            self.queryset = self.queryset.filter(lan=get_current_lan())

        return super().get_queryset()

    # def get_serializer_class(self):
    #     if self.action == "my_seat_booking":
    #         self.serializer_class = UserSeatBookingGroupSerializer
    #     else:
    #         self.serializer_class = SeatBookingGroupSerializer
    #     return super().get_serializer_class()

    def get_permissions(self):
        if self.action in (
            "create",
            "retrieve",
            "my_seat_booking",
            "join_seat_booking",
            "leave_seat_booking",
        ):
            self.permission_classes = [IsAuthenticated, HasLanTicket]
        elif self.action in ("update", "partial_update"):
            self.permission_classes = [IsAuthenticated, HasLanTicket, LanTicketIsOwner]
        else:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()

    def perform_create(self, serializer):
        # As this is only called by the create action, which uses the
        # HasLanTicket permission, the same reasoning regarding the
        # possibility of errors as with .my_seat_booking() below applies.
        # TODO: As with the other overriden .perfom_create's in this file,
        #       especially given this modifies the user object, consider
        #       moving this logic to an overriden .create() method.
        # FIXME:Indeed, here it is too late to catch whether a seat booking
        #       group with the same name already exists.
        ticket = Ticket.objects.all().get(lan=get_current_lan(), user=self.request.user)
        seat_booking_group = serializer.save(lan=get_current_lan(), owner=ticket)
        # Set the user's ticket's group seat booking to this.
        ticket.seat_booking_group = seat_booking_group
        ticket.save()

    @action(detail=False)
    def my_seat_booking(self, request):
        """
        Returns the seat booking linked to a user's ticket for the current LAN,
        if such a seat booking exists.
        """
        # The HasLanTicket permission combined with model constraints ensure
        # that a single ticket exists and this won't error.
        ticket = Ticket.objects.all().get(lan=get_current_lan(), user=request.user)
        if not ticket.seat_booking_group:
            return Response(
                {"detail": "Not in a seat booking group."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(ticket.seat_booking_group)
        # Add isOwner boolean field to serialized data that's true if the
        # requesting user is the owner of the seat booking group.
        return Response(
            dict(isOwner=serializer.data["owner"]["id"] == ticket.id, **serializer.data)
        )

    @action(methods=["POST"], detail=False)
    def join_seat_booking(self, request):
        """
        Given the name of a seat booking group, finds the matching group for the
        current LAN and assigns it to the requesting user's ticket.
        """
        ticket = Ticket.objects.all().get(lan=get_current_lan(), user=request.user)
        # TODO: Consider forcing user to leave existing group with a separate action
        # if ticket.seat_booking_group:
        #   return Response({"detail": "You are already in a seat booking group"}, status=status.HTTP_400_BAD_REQUEST)
        seat_booking_group = get_object_or_404(
            self.get_queryset(),
            **{"lan": get_current_lan(), "name": request.data["name"]}
        )
        ticket.seat_booking_group = seat_booking_group
        ticket.save()
        serializer = self.get_serializer(seat_booking_group)
        return Response(serializer.data)

    @action(methods=["POST"], detail=False)
    def leave_seat_booking(self, request):
        """
        Removes the seat booking group from the requesting user's ticket.
        """
        ticket = Ticket.objects.all().get(lan=get_current_lan(), user=request.user)
        # FIXME: Allow group owner to leave group by assigning ownership to another
        #        user/deleting group OR allow group owner to kick other users.
        if ticket.id in self.get_queryset().values_list("owner", flat=True):
            return Response(
                {"detail": "Cannot leave your own group."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ticket.seat_booking_group = None
        ticket.save()
        return Response()


class VanBookingViewSet(viewsets.ModelViewSet):
    queryset = VanBooking.objects.all()
    serializer_class = VanBookingSerializer
    owner_field = "requester"

    def get_queryset(self):
        current = "current" in self.request.query_params

        if current:
            self.queryset = self.queryset.filter(lan=get_current_lan())

        return super().get_queryset()

    def get_permissions(self):
        if self.action in ("create", "my_van_booking"):
            self.permission_classes = [IsAuthenticated, HasLanTicket]
        elif self.action in ("update", "partial_update", "destroy"):
            self.permission_classes = [IsAuthenticated, HasLanTicket, LanTicketIsOwner]
        else:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()

    def perform_create(self, serializer):
        # As with SeatBookingViewSet.my_seat_booking, this shouldn't error.
        ticket = Ticket.objects.all().get(lan=get_current_lan(), user=self.request.user)
        serializer.save(lan=get_current_lan(), requester=ticket)

    @action(detail=False)
    def my_van_booking(self, request):
        """
        Returns the van booking linked to a user's ticket for the current LAN,
        if such a van booking exists.
        """
        # As with SeatBookingViewSet.my_seat_booking, this shouldn't error.
        ticket = Ticket.objects.all().get(lan=get_current_lan(), user=request.user)
        van_booking = get_object_or_404(self.get_queryset(), **{"requester": ticket})
        serializer = self.get_serializer(van_booking)
        return Response(serializer.data)


class FoodOrderShopViewSet(viewsets.ModelViewSet):
    queryset = FoodOrderShop.objects.all()
    serializer_class = FoodOrderShopSerializer
    permission_classes = [IsAdminUserOrReadOnly]


class FoodOrderMenuItemViewSet(viewsets.ModelViewSet):
    queryset = FoodOrderMenuItem.objects.all()
    serializer_class = FoodOrderMenuItemSerializer
    permission_classes = [IsAdminUserOrReadOnly]


class FoodOrderViewSet(viewsets.ModelViewSet):
    # FIXME: Ensure orders cannot be placed for shops with is_open=False
    queryset = FoodOrder.objects.all()
    owner_field = "orderer"

    def get_queryset(self):
        current = "current" in self.request.query_params

        if current:
            self.queryset = self.queryset.filter(lan=get_current_lan())

        return super().get_queryset()

    def get_serializer_class(self):
        if self.action in ("list", "my_food_orders"):
            self.serializer_class = FoodOrderDetailSerializer
        else:
            self.serializer_class = FoodOrderSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        if self.action in ("create", "my_food_orders"):
            self.permission_classes = [IsAuthenticated, HasLanTicket]
        elif self.action == "destroy":
            self.permission_classes = [IsAuthenticated, HasLanTicket, LanTicketIsOwner]
        else:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()

    def perform_create(self, serializer):
        ticket = Ticket.objects.all().get(lan=get_current_lan(), user=self.request.user)
        serializer.save(lan=get_current_lan(), orderer=ticket)

    def perform_destroy(self, instance):
        print(instance)
        if instance.paid and not self.request.user.is_staff:
            # TODO: Response is of the form ["Only admins can delete paid orders."].
            #       Consider whether it should instead be of the form {"detail": "Only admins can delete paid orders."}
            #       as with other responses.
            raise ValidationError("Only admins can delete paid orders.")
        return super().perform_destroy(instance)

    @action(detail=False)
    def my_food_orders(self, request):
        """
        Returns the food orders linked to a user's ticket for the current LAN,
        if any.
        """
        # As with SeatBookingViewSet.my_seat_booking, this shouldn't error.
        ticket = Ticket.objects.all().get(lan=get_current_lan(), user=request.user)
        food_orders = get_list_or_404(self.get_queryset(), **{"orderer": ticket})
        serializer = self.get_serializer(food_orders, many=True)
        return Response(serializer.data)
