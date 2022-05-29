from datetime import timedelta

from avgs_website.settings import TEST_HOST
from avgs_website.utils import LongDocMixin
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.utils import IntegrityError
from django.http import Http404
from django.test import TestCase
from django.utils import timezone
from events.models import Event
from rest_framework import status
from rest_framework.test import APIClient
from users.tests import create_test_user

from ..models import Ticket
from ..utils import get_current_lan


class TicketTests(LongDocMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.URL_PREFIX = "/api/lan-tickets/"
        cls.LAN = Event.objects.create(
            name="LAN",
            type=Event.LAN,
            location="Lanlanland",
            start_time=(timezone.now() + timedelta(weeks=4)),
            end_time=(timezone.now() + timedelta(weeks=4, days=3)),
        )
        cls.USER1_USERNAME = "user1"
        cls.USER1_PASSWORD = "user1pass"
        cls.USER1 = create_test_user(cls.USER1_USERNAME, cls.USER1_PASSWORD)
        cls.USER1_TICKET = Ticket.objects.create(lan=get_current_lan(), user=cls.USER1)
        cls.USER2_USERNAME = "user2"
        cls.USER2_PASSWORD = "user2pass"
        cls.USER2 = create_test_user(cls.USER2_USERNAME, cls.USER2_PASSWORD)
        cls.USER2_TICKET = Ticket.objects.create(lan=get_current_lan(), user=cls.USER2)
        cls.SUPERUSER_USERNAME = "superuser"
        cls.SUPERUSER_PASSWORD = "superuserpass"
        cls.SUPERUSER = get_user_model().objects.create_superuser(
            username=cls.SUPERUSER_USERNAME,
            email="test@example.com",
            password=cls.SUPERUSER_PASSWORD,
        )

    def setUp(self):
        self.client = APIClient()

    def test_ticket(self):
        """
        An authenticated user is able to retrieve their ticket for the current LAN.
        Admins can see a list of all tickets and activate them.
        """
        # Login as an authenticated user.
        self.client.login(username=self.USER1_USERNAME, password=self.USER1_PASSWORD)

        # Retrieve this user's ticket.
        authed1_get_own_response = self.client.get(
            "{}my_lan_ticket/".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(authed1_get_own_response.data["id"], self.USER1_TICKET.id)

        # Attempt to retrieve another user's ticket.
        authed1_get_other_response = self.client.get(
            "{}{}/".format(self.URL_PREFIX, self.USER2_TICKET.id),
            HTTP_HOST=TEST_HOST,
        )
        # FIXME: Apparently users can see other users' tickets?
        # self.assertEqual(
        #     authed1_get_other_response.status_code, status.HTTP_403_FORBIDDEN
        # )

        # Attempt to retrieve all users' tickets.
        authed1_get_all_response = self.client.get(
            "{}".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            authed1_get_all_response.status_code, status.HTTP_403_FORBIDDEN
        )

        # Attempt to update this user's ticket.
        authed1_update_own_response = self.client.patch(
            "{}{}/".format(self.URL_PREFIX, authed1_get_own_response.data["id"]),
            {"is_activated": True},
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            authed1_update_own_response.status_code, status.HTTP_403_FORBIDDEN
        )

        # Attempt to delete this user's ticket.
        authed1_delete_own_response = self.client.delete(
            "{}{}/".format(self.URL_PREFIX, authed1_get_own_response.data["id"]),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            authed1_delete_own_response.status_code, status.HTTP_403_FORBIDDEN
        )

        # Authenticate as admin.
        self.client.logout()
        self.client.login(
            username=self.SUPERUSER_USERNAME, password=self.SUPERUSER_PASSWORD
        )

        # Retrieve all users' tickets.
        admin_get_all_response = self.client.get(
            "{}".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertTrue(
            (len(admin_get_all_response.data) == 2)
            and (admin_get_all_response.data[0]["id"] == self.USER1_TICKET.id)
            and (admin_get_all_response.data[1]["id"] == self.USER2_TICKET.id)
        )

        # Delete a user's ticket.
        # TODO: Should this be allowed?
        admin_delete_response = self.client.delete(
            "{}{}/".format(self.URL_PREFIX, self.USER2_TICKET.id),
            HTTP_HOST=TEST_HOST,
        )
        self.assertTrue(status.is_success(admin_delete_response.status_code))
        admin_get_all_again_response = self.client.get(
            "{}".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertTrue(
            (len(admin_get_all_again_response.data) == 1)
            and (admin_get_all_again_response.data[0]["id"] == self.USER1_TICKET.id)
        )

        # Update a user's ticket.
        admin_patch_response = self.client.patch(
            "{}{}/".format(self.URL_PREFIX, self.USER1_TICKET.id),
            {
                "is_activated": True,
            },
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(admin_patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(admin_patch_response.data["is_activated"], True)
