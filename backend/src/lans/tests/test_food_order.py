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

from ..models import FoodOrder, FoodOrderMenuItem, FoodOrderShop, Ticket
from ..utils import get_current_lan

# TODO: Probably a good idea to avoid dependencies by using mock objects for
#       relations, see: https://docs.python.org/3/library/unittest.mock.html
#       Figure out what's causing this to print "FoodOrder object ([id])" during testing.


class FoodOrderTests(LongDocMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.URL_PREFIX = "/api/lan-food-order/"
        cls.URL_PREFIX_SHOP = "/api/lan-food-order-shop/"
        cls.URL_PREFIX_MENU = "/api/lan-food-order-menu-item/"
        # Since users should only be able to place an order if they have a LAN
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

    def test_food_order(self):
        """
        Admins can create, update, and delete shops and menu items.
        An authenticated user with a LAN ticket is able to see and order items
        from the menus of open shops and delete their orders unless they have
        been marked paid. Admins can see a list of all food orders.
        """

        # TODO: Test non-admins can't add shops/menu items.

        # Authenticate as admin.
        self.client.login(
            username=self.SUPERUSER_USERNAME, password=self.SUPERUSER_PASSWORD
        )

        # Add new shop.
        shop_name = "Test shop"
        create_shop = self.client.post(
            "{}".format(self.URL_PREFIX_SHOP),
            {
                "name": shop_name,
                "order_by": "Test order by",
                "arrives_at": "Test arrives at",
                "is_open": True,
            },
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(create_shop.status_code, status.HTTP_201_CREATED)
        shop = FoodOrderShop.objects.get(name=shop_name)

        # Add new menu item.
        item_name = "Test item"
        create_item = self.client.post(
            "{}".format(self.URL_PREFIX_MENU),
            {
                "shop": shop.id,
                "name": item_name,
                "info": "Test info",
                "price": 12.34,
            },
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(create_item.status_code, status.HTTP_201_CREATED)
        item = FoodOrderMenuItem.objects.get(name=item_name)

        # Login as an authenticated user with a LAN ticket.
        self.client.logout()
        self.client.login(username=self.USER1_USERNAME, password=self.USER1_PASSWORD)

        # Attempt to retrieve non-existent food orders.
        authed1_get_no_response = self.client.get(
            "{}my_food_orders/".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(authed1_get_no_response.status_code, status.HTTP_404_NOT_FOUND)

        # Perform a successful request.
        authed1_order1 = self.client.post(
            "{}".format(self.URL_PREFIX),
            {
                "option": item.id,
            },
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(authed1_order1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            [
                order.option
                for order in FoodOrder.objects.filter(orderer=self.USER1_TICKET)
            ],
            [item],
        )

        # Perform another successful request.
        authed1_order2 = self.client.post(
            "{}".format(self.URL_PREFIX),
            {
                "option": item.id,
            },
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(authed1_order2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            [
                order.option
                for order in FoodOrder.objects.filter(orderer=self.USER1_TICKET)
            ],
            [item, item],
        )

        # Update food order.
        # new_contact_phone_number = "New test phone number"
        # new_address = "New test address"
        # authed1_patch_response = self.client.patch(
        #     "{}{}/".format(self.URL_PREFIX, authed1_post_response.data["id"]),
        #     {"contact_phone_number": new_contact_phone_number, "address": new_address},
        #     HTTP_HOST=TEST_HOST,
        # )
        # self.assertEqual(authed1_patch_response.status_code, status.HTTP_200_OK)
        # self.assertEqual(
        #     VanBooking.objects.get(orderer=self.USER1_TICKET).contact_phone_number,
        #     new_contact_phone_number,
        # )

        # Retrieve food orders.
        authed1_get_response = self.client.get(
            "{}my_food_orders/".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(authed1_get_response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            (len(authed1_get_response.data) == 2)
            and (authed1_get_response.data[0]["id"] == authed1_order1.data["id"])
            and (authed1_get_response.data[1]["id"] == authed1_order2.data["id"])
        )

        # Delete unpaid food order.
        delete_own_unpaid_response = self.client.delete(
            "{}{}/".format(self.URL_PREFIX, authed1_order1.data["id"]),
            HTTP_HOST=TEST_HOST,
        )
        self.assertTrue(status.is_success(delete_own_unpaid_response.status_code))
        with self.assertRaises(FoodOrder.DoesNotExist):
            FoodOrder.objects.get(id=authed1_order1.data["id"])

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
                "option": item.id,
            },
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(authed2_post_response.status_code, status.HTTP_403_FORBIDDEN)

        # Attempt to retrieve another user's food order.
        authed2_get_other_response = self.client.get(
            "{}{}/".format(self.URL_PREFIX, authed1_order1.data["id"]),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            authed2_get_other_response.status_code, status.HTTP_403_FORBIDDEN
        )

        # TODO: Attempt to update/delete another user's food order.

        # Attempt to retrieve all users' food orders.
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

        # Retrieve all users' food orders.
        admin_get_all_response = self.client.get(
            "{}".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertTrue(
            (len(admin_get_all_response.data) == 1)
            and (admin_get_all_response.data[0]["id"] == authed1_order2.data["id"])
        )

        # Delete a user's food order.
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

        # Update a user's food order to be paid.
        # TODO: Admin shouldn't be able to update other values.
        admin_patch_response = self.client.patch(
            "{}{}/".format(self.URL_PREFIX, authed1_order2.data["id"]),
            {"paid": True},
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(admin_patch_response.status_code, status.HTTP_200_OK)

        self.client.logout()
        self.client.login(username=self.USER1_USERNAME, password=self.USER1_PASSWORD)

        # Attempt to delete paid food order.
        delete_own_paid_response = self.client.delete(
            "{}{}/".format(self.URL_PREFIX, authed1_order2.data["id"]),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            delete_own_paid_response.status_code, status.HTTP_400_BAD_REQUEST
        )
