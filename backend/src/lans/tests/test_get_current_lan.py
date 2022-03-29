from datetime import timedelta

from avgs_website.utils import LongDocMixin
from django.test import TestCase
from django.utils import timezone
from events.models import Event

from ..models import Lan
from ..views import get_current_lan


class GetCurrentLanTests(LongDocMixin, TestCase):
    def test_no_future_lan(self):
        """
        get_current_lan() raises Lan.DoesNotExist if there are no ongoing/future LAN
        events.
        """
        with self.assertRaises(Lan.DoesNotExist):
            get_current_lan()

        Lan.objects.create(number=1)
        with self.assertRaises(Lan.DoesNotExist):
            get_current_lan()

    def test_ongoing_lan(self):
        """
        get_current_lan() returns an ongoing LAN.
        """
        ongoing_lan = Lan.objects.create(number=1)
        Event.objects.create(
            name="LAN 1",
            type=Event.LAN,
            location="Lanlanland",
            start_time=(timezone.now() - timedelta(days=2)),
            end_time=(timezone.now() + timedelta(hours=1)),
            lan=ongoing_lan,
        )
        self.assertEqual(ongoing_lan, get_current_lan())

    def test_future_and_past_lan(self):
        """
        get_current_lan() returns only LANs with a future end date.
        """
        future_lan = Lan.objects.create(number=2)
        Event.objects.create(
            name="LAN 2",
            type=Event.LAN,
            location="Lanlanland",
            start_time=(timezone.now() + timedelta(days=1)),
            end_time=(timezone.now() + timedelta(days=3)),
            lan=future_lan,
        )
        past_lan = Lan.objects.create(number=1)
        Event.objects.create(
            name="LAN 1",
            type=Event.LAN,
            location="Lanlanland",
            start_time=(timezone.now() - timedelta(days=3)),
            end_time=(timezone.now() - timedelta(hours=1)),
            lan=past_lan,
        )
        self.assertEqual(future_lan, get_current_lan())

    def test_two_future_lans(self):
        """
        get_current_lan() returns the LAN with the nearest future end date.
        """
        later_future_lan = Lan.objects.create(number=2)
        Event.objects.create(
            name="LAN 2",
            type=Event.LAN,
            location="Lanlanland",
            start_time=(timezone.now() + timedelta(days=5)),
            end_time=(timezone.now() + timedelta(days=8)),
            lan=later_future_lan,
        )
        nearer_future_lan = Lan.objects.create(number=1)
        Event.objects.create(
            name="LAN 1",
            type=Event.LAN,
            location="Lanlanland",
            start_time=(timezone.now() + timedelta(days=1)),
            end_time=(timezone.now() + timedelta(days=4)),
            lan=nearer_future_lan,
        )
        self.assertEqual(nearer_future_lan, get_current_lan())
