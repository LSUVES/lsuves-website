from datetime import timedelta

from avgs_website.utils import LongDocMixin
from django.http import Http404
from django.test import TestCase
from django.utils import timezone
from events.models import Event

from ..views import get_current_lan


class GetCurrentLanTests(LongDocMixin, TestCase):
    def test_no_future_lan(self):
        """
        get_current_lan() raises a Http404 if there are no ongoing/future LAN
        events.
        """
        with self.assertRaises(Http404):
            get_current_lan()

    def test_ongoing_lan(self):
        """
        get_current_lan() returns an ongoing LAN.
        """
        ongoing_lan = Event.objects.create(
            name="LAN 1",
            type=Event.LAN,
            location="Lanlanland",
            start_time=(timezone.now() - timedelta(days=2)),
            end_time=(timezone.now() + timedelta(hours=1)),
        )
        self.assertEqual(ongoing_lan, get_current_lan())

    def test_future_and_past_lan(self):
        """
        get_current_lan() returns only LANs with a future end date.
        """
        future_lan = Event.objects.create(
            name="LAN 2",
            type=Event.LAN,
            location="Lanlanland",
            start_time=(timezone.now() + timedelta(days=1)),
            end_time=(timezone.now() + timedelta(days=3)),
        )
        Event.objects.create(
            name="LAN 1",
            type=Event.LAN,
            location="Lanlanland",
            start_time=(timezone.now() - timedelta(days=3)),
            end_time=(timezone.now() - timedelta(hours=1)),
        )
        self.assertEqual(future_lan, get_current_lan())

    def test_two_future_lans(self):
        """
        get_current_lan() returns the LAN with the nearest future end date.
        """
        Event.objects.create(
            name="LAN 2",
            type=Event.LAN,
            location="Lanlanland",
            start_time=(timezone.now() + timedelta(days=5)),
            end_time=(timezone.now() + timedelta(days=8)),
        )
        nearer_future_lan = Event.objects.create(
            name="LAN 1",
            type=Event.LAN,
            location="Lanlanland",
            start_time=(timezone.now() + timedelta(days=1)),
            end_time=(timezone.now() + timedelta(days=4)),
        )
        self.assertEqual(nearer_future_lan, get_current_lan())
