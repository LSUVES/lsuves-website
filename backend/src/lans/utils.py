from django.http import Http404
from django.utils import timezone
from events.models import Event


def get_current_lan():
    """
    Returns the LAN object with the soonest future end date or raises
    a HTTP 404 error if there isn't one.
    """
    try:
        return Event.objects.filter(
            type=Event.LAN, end_time__gte=timezone.now()
        ).earliest("end_time")
    except Event.DoesNotExist:
        raise Http404("There are no upcoming LANs.")
