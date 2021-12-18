from django.db.models.query_utils import Q
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.serializers import Serializer

from .models import Event
from .serializers import EventSerializer


class EventView(viewsets.ModelViewSet):
    serializer_class = EventSerializer

    def get_queryset(self):
        year = self.request.query_params.get("year")
        month = self.request.query_params.get("month")

        # Return all events taking place over the requested month ordered by
        # start time.
        queryset = Event.objects.filter(
            (
                Q(start_time__year__lt=year)
                | (Q(start_time__year=year) & Q(start_time__month__lte=month))
            ),
            (
                Q(end_time__year__gt=year)
                | (Q(end_time__year=year) & Q(end_time__month__gte=month))
            ),
        ).order_by("start_time")

        return queryset
