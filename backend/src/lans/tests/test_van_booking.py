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

from ..models import Ticket, VanBooking
from ..utils import get_current_lan

# TODO: Probably a good idea to avoid dependencies by using mock objects for
#       relations, see: https://docs.python.org/3/library/unittest.mock.html
#       Figure out what's causing this to print "{}"" during testing.


class VanBookingTests(LongDocMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.URL_PREFIX = "/api/lan-van-booking/"
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
        cls.SUPERUSER_USERNAME = "superuser"
        cls.SUPERUSER_PASSWORD = "superuserpass"
        cls.SUPERUSER = get_user_model().objects.create_superuser(
            username=cls.SUPERUSER_USERNAME,
            email="test@example.com",
            password=cls.SUPERUSER_PASSWORD,
        )

    def setUp(self):
        self.client = APIClient()

    def test_van_booking(self):
        """
        An authenticated user with a LAN ticket is able to create, update and
        delete a van booking for the current LAN. Admins can see a list of all
        van bookings.
        """
        # Login as an authenticated user with a LAN ticket.
        self.client.login(username=self.USER1_USERNAME, password=self.USER1_PASSWORD)

        # Attempt to retrieve non-existent van booking.
        authed1_get_no_response = self.client.get(
            "{}my_van_booking/".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(authed1_get_no_response.status_code, status.HTTP_404_NOT_FOUND)

        # Perform a successful request.
        authed1_post_response = self.client.post(
            "{}".format(self.URL_PREFIX),
            {
                "contact_phone_number": "Test phone number",
                "address": "Test address",
                "postcode": "TE5 7PC",
                "collection_required": True,
                "dropoff_required": True,
                "availability": "Test availability",
            },
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(authed1_post_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            VanBooking.objects.get(requester=self.USER1_TICKET).lan, get_current_lan()
        )

        # Update van booking.
        new_contact_phone_number = "New test phone number"
        new_address = "New test address"
        authed1_patch_response = self.client.patch(
            "{}{}/".format(self.URL_PREFIX, authed1_post_response.data["id"]),
            {"contact_phone_number": new_contact_phone_number, "address": new_address},
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(authed1_patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            VanBooking.objects.get(requester=self.USER1_TICKET).contact_phone_number,
            new_contact_phone_number,
        )

        # Retrieve van booking.
        authed1_get_response = self.client.get(
            "{}my_van_booking/".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(authed1_get_response.status_code, status.HTTP_200_OK)
        self.assertEqual(authed1_get_response.data["address"], new_address)

        # Attempt request again within a nested transaction so that the test database
        # can be rolled back and allow further tests within this same method.
        # with transaction.atomic():
        #     with self.assertRaises(IntegrityError):
        #         self.client.post(
        #             "{}".format(self.URL_PREFIX),
        #             HTTP_HOST=TEST_HOST,
        #         )

        # Attempt request as an unauthenticated user.
        # self.client.logout()
        # unauthed_post_response = self.client.post(
        #     "{}".format(self.URL_PREFIX),
        #     HTTP_HOST=TEST_HOST,
        # )
        # self.assertEqual(unauthed_post_response.status_code, status.HTTP_403_FORBIDDEN)

        # Login as an authenticated user without a LAN ticket.
        self.client.logout()
        self.client.login(username=self.USER2_USERNAME, password=self.USER2_PASSWORD)

        # Attempt request without a LAN ticket.
        authed2_post_response = self.client.post(
            "{}".format(self.URL_PREFIX),
            {
                "contact_phone_number": "Test phone number",
                "address": "Test address",
                "postcode": "TE5 7PC",
                "collection_required": True,
                "dropoff_required": True,
                "availability": "Test availability",
            },
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(authed2_post_response.status_code, status.HTTP_403_FORBIDDEN)

        # Attempt to retrieve another user's van booking.
        authed2_get_other_response = self.client.get(
            "{}{}/".format(self.URL_PREFIX, authed1_post_response.data["id"]),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            authed2_get_other_response.status_code, status.HTTP_403_FORBIDDEN
        )

        # TODO: Attempt to update/delete another user's van booking.

        # Attempt to retrieve all users' van bookings.
        authed2_get_all_response = self.client.get(
            "{}".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            authed2_get_all_response.status_code, status.HTTP_403_FORBIDDEN
        )

        # Authenticate as admin.
        self.client.logout()
        self.client.login(
            username=self.SUPERUSER_USERNAME, password=self.SUPERUSER_PASSWORD
        )

        # Retrieve all users' van bookings.
        admin_get_all_response = self.client.get(
            "{}".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertTrue(
            (len(admin_get_all_response.data) == 1)
            and (
                admin_get_all_response.data[0]["id"] == authed1_post_response.data["id"]
            )
        )

        # Delete a user's van booking.
        # admin_delete_response = self.client.delete(
        #     "{}{}/".format(self.URL_PREFIX, authed2_post_response.data["id"]),
        #     HTTP_HOST=TEST_HOST,
        # )
        # self.assertTrue(status.is_success(admin_delete_response.status_code))
        # admin_get_all_again_response = self.client.get(
        #     "{}".format(self.URL_PREFIX),
        #     HTTP_HOST=TEST_HOST,
        # )
        # self.assertTrue(
        #     (len(admin_get_all_again_response.data) == 1)
        #     and (
        #         admin_get_all_again_response.data[0]["id"]
        #         == authed1_post_response.data["id"]
        #     )
        # )

        # Attempt to update a user's van booking.
        # admin_put_response = self.client.put(
        #     "{}{}/".format(self.URL_PREFIX, authed1_post_response.data["id"]),
        #     {"user": self.USER2, "lan": lan2},
        #     HTTP_HOST=TEST_HOST,
        # )
        # self.assertEqual(
        #     admin_put_response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED
        # )

        self.client.logout()
        self.client.login(username=self.USER1_USERNAME, password=self.USER1_PASSWORD)
        delete_own_response = self.client.delete(
            "{}{}/".format(self.URL_PREFIX, authed1_post_response.data["id"]),
            HTTP_HOST=TEST_HOST,
        )
        self.assertTrue(status.is_success(delete_own_response.status_code))
        with self.assertRaises(VanBooking.DoesNotExist):
            VanBooking.objects.get(requester=self.USER1_TICKET)
