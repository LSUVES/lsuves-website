from avgs_website.permissions import IsOwner
from django.shortcuts import get_object_or_404
from django.utils import timezone
from events.models import Event
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import *
from .serializers import *


# TODO: move this into a different file
def get_current_lan():
    """
    Returns the LAN object with the soonest future end date or throws
    Event.DoesNotExist if there isn't one.
    """
    return Event.objects.filter(type=Event.LAN, end_time__gte=timezone.now()).earliest(
        "end_time"
    )


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
    def perform_create(self, serializer):
        serializer.save(lan=get_current_lan(), user=self.request.user)
        print(serializer.errors)

    # Return the LAN ticket request for the requesting user.
    # FIXME: Should return negative if get_current_lan() throws Event.DoesNotExist
    @action(detail=False)  # url_path="my-lan-ticket-request"
    def my_lan_ticket_request(self, request):
        # Normally self.kwargs is populated by parameters provided in the url. E.g.,
        # /api/lan-ticket-requests/<pk>/ will give self.kwargs["pk"] = <pk>. Here,
        # they are set manually.
        self.kwargs["user"] = request.user
        self.kwargs["lan"] = get_current_lan()
        ticket_request = self.get_object()
        serializer = self.get_serializer(ticket_request)
        return Response(serializer.data)

    @action(methods=["POST"], detail=False)
    def approve_ticket_request(self, request):
        user = User.objects.get(id=request.data["userId"])
        # FIXME: Validate the below and include any errors in response.
        Ticket.objects.create(lan=get_current_lan(), user=user)
        if Ticket.objects.get(lan=get_current_lan(), user=user):
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()

    def get_queryset(self):
        current = "current" in self.request.query_params

        if current:
            self.queryset = self.queryset.filter(lan=get_current_lan())

        return super().get_queryset()

    def get_serializer_class(self):
        if self.action == "list":
            self.serializer_class = TicketRequestUserSerializer
        else:
            self.serializer_class = TicketRequestSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        # Tickets may be retrieved by their owners, all other operations are only
        # permitted to admins.
        if self.action == "retrieve" or self.action == "my_lan_ticket":
            self.permission_classes = [IsOwner]
        else:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()

    def get_object(self):
        if self.action == "my_lan_ticket":
            queryset = self.filter_queryset(self.get_queryset())
            filter_kwargs = {"user": self.kwargs["user"], "lan": self.kwargs["lan"]}
            obj = get_object_or_404(queryset, **filter_kwargs)
            self.check_object_permissions(self.request, obj)
            return obj
        return super().get_object()

    def perform_create(self, serializer):
        serializer.save(lan=get_current_lan())

    # Return the LAN ticket for the requesting user.
    # FIXME: Should return negative if get_current_lan() throws Event.DoesNotExist
    @action(detail=False)
    def my_lan_ticket(self, request):
        self.kwargs["user"] = request.user
        self.kwargs["lan"] = get_current_lan()
        ticket_request = self.get_object()
        serializer = self.get_serializer(ticket_request)
        return Response(serializer.data)


class SeatBookingViewSet(viewsets.ModelViewSet):
    queryset = SeatBookingGroup.objects.all()
    serializer_class = SeatBookingGroupSerializer

    def get_permissions(self):
        if self.action == "create":
            # FIXME: Create permission class for HasTicket
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(lan=get_current_lan(), user=self.request.user)


class VanBookingViewSet(viewsets.ModelViewSet):
    queryset = VanBooking.objects.all()
    serializer_class = VanBookingSerializer

    def get_permissions(self):
        if self.action == "create":
            # FIXME: Create permission class for HasTicket
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(lan=get_current_lan(), requester=self.request.user)


class FoodOrderShopViewSet(viewsets.ModelViewSet):
    queryset = FoodOrderShop.objects.all()
    serializer_class = FoodOrderShopSerializer


class FoodOrderMenuItemViewSet(viewsets.ModelViewSet):
    queryset = FoodOrderMenuItem.objects.all()
    serializer_class = FoodOrderMenuItemSerializer


class FoodOrderViewSet(viewsets.ModelViewSet):
    queryset = FoodOrder.objects.all()
    serializer_class = FoodOrderSerializer

    def get_permissions(self):
        if self.action == "create":
            # FIXME: Create permission class for HasTicket
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(lan=get_current_lan(), orderer=self.request.user)
