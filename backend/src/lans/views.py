from django.utils import timezone
from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated

from .models import *
from .permissions import IsOwner
from .serializers import *


# TODO: move this into a different file
def get_current_lan():
    """
    Returns the LAN object with the soonest future end date or throws Lan.DoesNotExist
    if there isn't one.
    """
    return Lan.objects.filter(event__end_time__gte=timezone.now()).earliest(
        "event__end_time"
    )


class LanViewSet(viewsets.ModelViewSet):
    queryset = Lan.objects.all()
    serializer_class = LanSerializer

    def get_permissions(self):
        if self.action == "retrieve":
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]


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
    serializer_class = TicketRequestSerializer

    def get_permissions(self):
        # All authenticated users must be able to create a LAN ticket; an individual
        # ticket must only be retrieved by its owner; listing and destroying tickets
        # must only be available to admins.
        if self.action == "retrieve":
            permission_classes = [IsOwner]  # |IsAdminUser]
        elif self.action == "create":
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    # TODO: Although this will override any values for user/lan in the request,
    #       is there a way to prevent these values from ever being accepted?
    def perform_create(self, serializer):
        serializer.save(lan=get_current_lan(), user=self.request.user)


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketRequestSerializer

    def get_permissions(self):
        # Tickets may be retrieved by their owners, all other operations are only
        # permitted to admins.
        if self.action == "retrieve":
            permission_classes = [IsOwner]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(lan=get_current_lan())
