from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.serializers import Serializer

from .models import Event
from .serializers import EventSerializer


class EventView(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    queryset = Event.objects.order_by("start_time")
