from django.db.models.query_utils import Q
from django.shortcuts import render
from lans.views import get_current_lan
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.serializers import Serializer

from .models import Event
from .serializers import EventSerializer


# FIXME: Enforce permissions so only staff can edit and consider whether all
#        the viewset methods are necessary
class EventsViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer

    # TODO: Move this to a Manager method on the Events model?
    def get_queryset(self):
        year = self.request.query_params.get("year")
        month = self.request.query_params.get("month")

        queryset = Event.objects
        # Return all events taking place over the requested month ordered by
        # start time.
        if year and month:
            queryset = queryset.filter(
                (
                    Q(start_time__year__lt=year)
                    | (Q(start_time__year=year) & Q(start_time__month__lte=month))
                ),
                (
                    Q(end_time__year__gt=year)
                    | (Q(end_time__year=year) & Q(end_time__month__gte=month))
                ),
            )
        elif self.action == "current_lan_events":
            queryset = queryset.filter(parent=get_current_lan())

        queryset = queryset.order_by("start_time")

        return queryset

    @action(detail=False)
    def current_lan(self, request):
        current_lan = get_current_lan()
        serializer = self.get_serializer(current_lan)
        return Response(serializer.data)

    @action(detail=False)
    def current_lan_events(self, request):
        lan_events = self.get_queryset()
        serializer = self.get_serializer(lan_events, many=True)
        return Response(serializer.data)


# class EventView(viewsets.M)
