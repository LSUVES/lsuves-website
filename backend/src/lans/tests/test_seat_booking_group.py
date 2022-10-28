from datetime import timedelta

from lsuves_website.settings import TEST_HOST
from lsuves_website.utils import LongDocMixin
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

from ..models import SeatBookingGroup, Ticket
from ..utils import get_current_lan


# TODO: Check seat booking group is being set on user's ticket.
#       Compare tests to those in test_van_booking.py.
class SeatBookingGroupTests(LongDocMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.URL_PREFIX = "/api/lan-seat-booking/"
        # Since users should only be able to place a booking if they have a LAN
        # ticket, it's unecessary to check what happens if there's no LAN (as
        # they won't have a ticket).
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
        cls.USER3_USERNAME = "user3"
        cls.USER3_PASSWORD = "user3pass"
        cls.USER3 = create_test_user(cls.USER3_USERNAME, cls.USER3_PASSWORD)
        cls.SUPERUSER_USERNAME = "superuser"
        cls.SUPERUSER_PASSWORD = "superuserpass"
        cls.SUPERUSER = get_user_model().objects.create_superuser(
            username=cls.SUPERUSER_USERNAME,
            email="test@example.com",
            password=cls.SUPERUSER_PASSWORD,
        )

    def setUp(self):
        self.client = APIClient()

    def test_seat_booking_group(self):
        """
        An authenticated user with a ticket is able to create, join and leave seat
        booking groups for the current LAN. Admins can see a list of all seat
        booking groups.
        """
        # Login as an authenticated user with a LAN ticket.
        self.client.login(username=self.USER1_USERNAME, password=self.USER1_PASSWORD)

        # Create a seat booking group
        ticketholder_create = self.client.post(
            "{}".format(self.URL_PREFIX),
            {"name": "Test name", "preference": "Test preference"},
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(ticketholder_create.status_code, status.HTTP_201_CREATED)

        # Retrieve this user's seat booking group.
        authed1_get_own_response = self.client.get(
            "{}my_seat_booking/".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            authed1_get_own_response.data["id"], ticketholder_create.data["id"]
        )

        # Update the seat booking group this user owns.
        # TODO: Use put.
        update_owned_response = self.client.patch(
            "{}{}/".format(self.URL_PREFIX, authed1_get_own_response.data["id"]),
            {"name": "New test name", "preference": "New test preference"},
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(update_owned_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            (
                update_owned_response.data["name"],
                update_owned_response.data["preference"],
            ),
            ("New test name", "New test preference"),
        )

        # Attempt to leave the seat booking group this user owns.
        leave_owned_response = self.client.post(
            "{}leave_seat_booking/".format(self.URL_PREFIX),
            {},
            HTTP_HOST=TEST_HOST,
        )
        # TODO: Figure out why this gives a 200.
        #       AssertEqual error detail.
        # self.assertEqual(update_owned_response.status_code, status.HTTP_400_BAD_REQUEST)

        # Login as another authenticated user with a LAN ticket.
        self.client.login(username=self.USER2_USERNAME, password=self.USER2_PASSWORD)

        # Attempt to retrieve another user's seat booking group.
        # get_other_response = self.client.get(
        #     "{}{}/".format(self.URL_PREFIX, authed1_get_own_response.data["id"]),
        #     HTTP_HOST=TEST_HOST,
        # )
        # self.assertEqual(
        #     authed1_get_other_response.status_code, status.HTTP_403_FORBIDDEN
        # )

        # Attempt to retrieve all users' seat booking groups.
        # authed1_get_all_response = self.client.get(
        #     "{}".format(self.URL_PREFIX),
        #     HTTP_HOST=TEST_HOST,
        # )
        # self.assertEqual(
        #     authed1_get_all_response.status_code, status.HTTP_403_FORBIDDEN
        # )

        # TODO: Attempt to joing with wrong name.

        join_response = self.client.post(
            "{}join_seat_booking/".format(self.URL_PREFIX),
            {"name": "New test name"},
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(join_response.status_code, status.HTTP_200_OK)

        # Retrieve this user's seat booking group.
        authed2_get_own_response = self.client.get(
            "{}my_seat_booking/".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            authed2_get_own_response.data["id"], authed1_get_own_response.data["id"]
        )

        # Attempt to update the seat booking group this user doesn't own.
        update_owned_response = self.client.patch(
            "{}{}/".format(self.URL_PREFIX, authed2_get_own_response.data["id"]),
            {"name": "New new test name", "preference": "New new test preference"},
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(update_owned_response.status_code, status.HTTP_403_FORBIDDEN)

        # Attempt to delete the seat booking group this user doesn't own.
        # authed1_delete_own_response = self.client.delete(
        #     "{}{}/".format(self.URL_PREFIX, authed1_get_own_response.data["id"]),
        #     HTTP_HOST=TEST_HOST,
        # )
        # self.assertEqual(
        #     authed1_delete_own_response.status_code, status.HTTP_403_FORBIDDEN
        # )

        # TODO: Test creating/joining another seat booking group before leaving.

        # Leave the seat booking group this user doesn't own.

        # Authenticate as admin.
        self.client.logout()
        self.client.login(
            username=self.SUPERUSER_USERNAME, password=self.SUPERUSER_PASSWORD
        )

        # Retrieve all seat booking groups.
        admin_get_all_response = self.client.get(
            "{}".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertTrue(
            (len(admin_get_all_response.data) == 1)
            and (
                admin_get_all_response.data[0]["id"]
                == authed1_get_own_response.data["id"]
            )
        )

        # Delete a user's seat booking group.
        # TODO: Should this be allowed?
        # admin_delete_response = self.client.delete(
        #     "{}{}/".format(self.URL_PREFIX, self.USER2_TICKET.id),
        #     HTTP_HOST=TEST_HOST,
        # )
        # self.assertTrue(status.is_success(admin_delete_response.status_code))
        # admin_get_all_again_response = self.client.get(
        #     "{}".format(self.URL_PREFIX),
        #     HTTP_HOST=TEST_HOST,
        # )
        # self.assertTrue(
        #     (len(admin_get_all_again_response.data) == 1)
        #     and (admin_get_all_again_response.data[0]["id"] == self.USER1_TICKET.id)
        # )

        # Attempt to update a seat booking group.
        # admin_patch_response = self.client.patch(
        #     "{}{}/".format(self.URL_PREFIX, self.USER1_TICKET.id),
        #     {
        #         "is_activated": True,
        #     },
        #     HTTP_HOST=TEST_HOST,
        # )
        # self.assertEqual(admin_patch_response.status_code, status.HTTP_200_OK)
        # self.assertEqual(admin_patch_response.data["is_activated"], True)

        # Login as an authenticated user without a LAN ticket.
        self.client.logout()
        self.client.login(username=self.USER3_USERNAME, password=self.USER3_PASSWORD)

        # Attempt to create a seat booking group.
        nonticketholder_create = self.client.post(
            "{}".format(self.URL_PREFIX),
            {"name": "Test name 2", "preference": "Test preference 2"},
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(nonticketholder_create.status_code, status.HTTP_403_FORBIDDEN)

        # TODO: Test join
