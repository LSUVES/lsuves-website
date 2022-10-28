from datetime import timedelta

from lsuves_website.settings import TEST_HOST
from lsuves_website.utils import LongDocMixin
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from .models import Event


class EventModelTests(LongDocMixin, TestCase):
    """
    Tests for the Event model.
    """

    @classmethod
    def setUpTestData(cls):
        cls.NAME = "Test name"
        cls.TYPE = Event.GAMES
        cls.LOCATION = "Test location"
        cls.START_TIME = timezone.now()
        cls.END_TIME = timezone.now() + timedelta(days=2)

    def test_create_event_with_valid_params(self):
        """
        create() returns a matching event when called with valid parameters.
        """
        # TODO: Test other fields.
        event = Event.objects.create(
            name=self.NAME,
            type=self.TYPE,
            location=self.LOCATION,
            start_time=self.START_TIME,
            end_time=self.END_TIME,
        )
        self.assertEqual(event.name, self.NAME)
        self.assertEqual(event.type, self.TYPE)
        self.assertEqual(event.location, self.LOCATION)
        self.assertEqual(event.start_time, self.START_TIME)
        self.assertEqual(event.end_time, self.END_TIME)


# TODO: def test_event_starts_after_it_ends(self):


class EventViewTests(LongDocMixin, TestCase):
    """
    Tests for the event views.
    """

    @classmethod
    def setUpTestData(cls):
        cls.URL_PREFIX = "/api/events/"

        cls.event3 = Event.objects.create(
            name="Event 3 name",
            type=Event.GAMES,
            location="Event 3 location",
            start_time=timezone.now() + timedelta(hours=1),
            end_time=timezone.now() + timedelta(hours=11),
        )
        cls.event2 = Event.objects.create(
            name="Event 2 name",
            type=Event.GAMES,
            location="Event 2 location",
            start_time=timezone.now(),
            end_time=timezone.now() + timedelta(hours=10),
        )

        cls.event1 = Event.objects.create(
            name="Event 1 name",
            type=Event.GAMES,
            location="Event 1 location",
            start_time=timezone.now() - timedelta(hours=1),
            end_time=timezone.now() + timedelta(hours=9),
        )

        cls.USER = get_user_model()
        cls.USERNAME = "test"
        cls.PASSWORD = "testpass"
        cls.USER.objects.create_superuser(
            username=cls.USERNAME, email="test@example.com", password=cls.PASSWORD
        )

    def setUp(self):
        self.client = APIClient()

    def test_get_events(self):
        """
        Unauthenticated users can see all events.
        """

        # An unauthenticated user can get the list of all events ordered by
        # start date from past to future.
        get_events = self.client.get(
            "{}".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            [(event["id"], event["name"]) for event in get_events.data],
            [
                (event.id, event.name)
                for event in [self.event1, self.event2, self.event3]
            ],
        )

        # An unauthenticated user can get a specific event.
        get_event = self.client.get(
            "{}{}/".format(self.URL_PREFIX, self.event2.id),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            (get_event.data["id"], get_event.data["name"]),
            (self.event2.id, self.event2.name),
        )

    def test_create_edit_delete_events(self):
        """
        Only staff can create/edit/delete events.
        """
        # TODO: Add tests for an authed non-admin user as well.
        #       Test put as well?
        # Attempt to delete event as unauthenticated user.
        unauthed_delete = self.client.delete(
            "{}{}/".format(self.URL_PREFIX, self.event2.id),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(unauthed_delete.status_code, status.HTTP_403_FORBIDDEN)

        # Attempt to update event as unauthenticated user.
        unauthed_update = self.client.patch(
            "{}{}/".format(self.URL_PREFIX, self.event1.id),
            {"start_date": timezone.now() + timedelta(hours=2)},
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(unauthed_update.status_code, status.HTTP_403_FORBIDDEN)

        # Attempt to create event as unauthenticated user.
        unauthed_create = self.client.post(
            "{}".format(self.URL_PREFIX),
            {
                "name": "Event 4 name",
                "type": Event.GAMES,
                "location": "Event 4 location",
                "start_time": timezone.now(),
                "end_time": timezone.now() + timedelta(hours=10),
            },
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(unauthed_create.status_code, status.HTTP_403_FORBIDDEN)

        # Login as staff.
        self.client.login(username=self.USERNAME, password=self.PASSWORD)

        # Delete event as staff.
        admin_delete = self.client.delete(
            "{}{}/".format(self.URL_PREFIX, self.event2.id),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(admin_delete.status_code, status.HTTP_204_NO_CONTENT)

        # Update event as staff
        new_start_time = timezone.now() + timedelta(hours=2)
        admin_update = self.client.patch(
            "{}{}/".format(self.URL_PREFIX, self.event1.id),
            {"start_time": new_start_time},
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(admin_update.status_code, status.HTTP_200_OK)

        # Create event as staff
        admin_create = self.client.post(
            "{}".format(self.URL_PREFIX),
            {
                "name": "Event 4 name",
                "type": Event.GAMES,
                "location": "Event 4 location",
                "start_time": timezone.now(),
                "end_time": timezone.now() + timedelta(hours=10),
            },
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(admin_create.status_code, status.HTTP_201_CREATED)
        event_4 = (admin_create.data["id"], admin_create.data["name"])

        # Confirm event 2 has been removed, event 1 made the most recent, and event 4 created.
        edited_events = self.client.get(
            "{}".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            [(event["id"], event["name"]) for event in edited_events.data],
            [(event_4)]
            + [(event.id, event.name) for event in [self.event3, self.event1]],
        )
