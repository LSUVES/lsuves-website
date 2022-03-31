from datetime import timedelta

from avgs_website.settings import TEST_HOST
from avgs_website.utils import LongDocMixin
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.utils import IntegrityError
from django.test import TestCase
from django.utils import timezone
from events.models import Event
from rest_framework import status
from rest_framework.test import APIClient
from users.tests import create_test_user

from ..models import TicketRequest
from ..views import get_current_lan

# TODO: probably a good idea to avoid dependencies by using mock objects for
#       relations, see: https://docs.python.org/3/library/unittest.mock.html


class TicketRequestTests(LongDocMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.URL_PREFIX = "/api/lan-ticket-requests/"
        cls.USER1_USERNAME = "user1"
        cls.USER1_PASSWORD = "user1pass"
        cls.USER1 = create_test_user(cls.USER1_USERNAME, cls.USER1_PASSWORD)
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

    def test_ticket_request(self):
        """
        An authenticated user is able to request a ticket for the current LAN, but
        only one, which they can then retrieve. Admins can see a list of all ticket
        requests and delete them.
        """
        # Login as an authenticated user.
        self.client.login(username=self.USER1_USERNAME, password=self.USER1_PASSWORD)

        # Attempt request with no LAN events.
        with self.assertRaises(Event.DoesNotExist):
            self.client.post(
                "{}".format(self.URL_PREFIX),
                HTTP_HOST=TEST_HOST,
            )

        # Create events for LANs.
        lan1 = Event.objects.create(
            name="LAN 1",
            type=Event.LAN,
            location="Lanlanland",
            start_time=(timezone.now() + timedelta(weeks=4)),
            end_time=(timezone.now() + timedelta(weeks=4, days=3)),
        )
        lan2 = Event.objects.create(
            name="LAN 2",
            type=Event.LAN,
            location="Lanlanland",
            start_time=(timezone.now() + timedelta(weeks=5)),
            end_time=(timezone.now() + timedelta(weeks=5, days=3)),
        )
        self.assertEqual(lan1, get_current_lan())

        # Attempt to retrieve non-existent ticket request.
        authed1_get_response = self.client.get(
            "{}my_lan_ticket_request/".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(authed1_get_response.status_code, status.HTTP_404_NOT_FOUND)

        # Perform a successful request.
        authed1_post_response = self.client.post(
            "{}".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(authed1_post_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            TicketRequest.objects.get(user=self.USER1).lan, get_current_lan()
        )

        # Attempt request again within a nested transaction so that the test database
        # can be rolled back and allow further tests within this same method.
        with transaction.atomic():
            with self.assertRaises(IntegrityError):
                self.client.post(
                    "{}".format(self.URL_PREFIX),
                    HTTP_HOST=TEST_HOST,
                )

        # Attempt request as an unauthenticated user.
        self.client.logout()
        unauthed_post_response = self.client.post(
            "{}".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(unauthed_post_response.status_code, status.HTTP_403_FORBIDDEN)

        # Login as a different authenticated user.
        self.client.login(username=self.USER2_USERNAME, password=self.USER2_PASSWORD)

        # Perform a successful request as this new user.
        authed2_post_response = self.client.post(
            "{}".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(authed2_post_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            TicketRequest.objects.get(user=self.USER2).lan, get_current_lan()
        )

        # Retrieve this user's ticket request.
        authed2_get_own_response = self.client.get(
            "{}my_lan_ticket_request/".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        # Quickly verify that this ticket request's owner's id matches this user's.
        self.assertEqual(
            authed2_get_own_response.data["user"].split("/")[-2], str(self.USER2.id)
        )

        # Attempt to retrieve another user's ticket request.
        authed2_get_other_response = self.client.get(
            "/api/lan-ticket-requests/{}/".format(authed1_post_response.data["id"]),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            authed2_get_other_response.status_code, status.HTTP_403_FORBIDDEN
        )

        # Attempt to retrieve all users' ticket requests.
        authed2_get_all_response = self.client.get(
            "{}".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            authed2_get_all_response.status_code, status.HTTP_403_FORBIDDEN
        )

        # Attempt to delete this user's ticket request.
        authed2_delete_own_response = self.client.delete(
            "{}{}/".format(self.URL_PREFIX, authed2_post_response.data["id"]),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            authed2_delete_own_response.status_code, status.HTTP_403_FORBIDDEN
        )

        # Authenticate as admin.
        self.client.logout()
        self.client.login(
            username=self.SUPERUSER_USERNAME, password=self.SUPERUSER_PASSWORD
        )

        # Retrieve all users' ticket requests.
        admin_get_all_response = self.client.get(
            "{}".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            admin_get_all_response.data,
            [authed1_post_response.data, authed2_post_response.data],
        )

        # Delete a user's ticket request.
        admin_delete_response = self.client.delete(
            "{}{}/".format(self.URL_PREFIX, authed2_post_response.data["id"]),
            HTTP_HOST=TEST_HOST,
        )
        self.assertTrue(status.is_success(admin_delete_response.status_code))
        admin_get_all_again_response = self.client.get(
            "{}".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            admin_get_all_again_response.data, [authed1_post_response.data]
        )

        # Attempt to update a user's ticket request.
        admin_put_response = self.client.put(
            "/api/lan-ticket-requests/{}/".format(authed1_post_response.data["id"]),
            {"user": self.USER2, "lan": lan2},
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            admin_put_response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED
        )
