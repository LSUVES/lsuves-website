from rest_framework import permissions

from .models import Ticket
from .utils import get_current_lan


class HasLanTicket(permissions.BasePermission):
    """
    Only accepts requests from users with a ticket for the current LAN.
    """

    # TODO: Move preliminary auth check into this permission.

    def has_permission(self, request, view):
        return request.user and (
            len(Ticket.objects.all().filter(lan=get_current_lan(), user=request.user))
            > 0
        )


class LanTicketIsOwner(permissions.BasePermission):
    """
    Only accepts requests from users with the LAN ticket that owns the object.
    """

    # TODO: Move preliminary HasLanTicket check into this permission.

    def has_object_permission(self, request, view, obj):
        if hasattr(view, "owner_field"):
            owner_field = view.owner_field
        else:
            owner_field = "user"

        ticket = Ticket.objects.all().get(lan=get_current_lan(), user=request.user)
        return bool(ticket and ticket == getattr(obj, owner_field))
