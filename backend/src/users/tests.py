from calendar import monthrange
from datetime import datetime, timedelta
from io import StringIO

from avgs_website.settings import TEST_HOST
from avgs_website.utils import LongDocMixin
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.http.cookie import SimpleCookie
from django.middleware.csrf import get_token
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APIRequestFactory


# TODO: Incorporate into tests below.
def create_test_user(username, password, email="test@example.com", deletion_date=(timezone.now() + timedelta(days=31)).date(), superuser=False):
    if superuser:
        return get_user_model().objects.create_superuser(username=username, email=email, password=password)
    return get_user_model().objects.create_user(
        username=username,
        email=email,
        deletion_date=deletion_date,
        password=password,
    )


# TODO: Consider using a faster password hashing algorithm as mentioned in the docs:
#       https://docs.djangoproject.com/en/4.0/topics/testing/overview/#password-hashing
#       Store username, email, password values in constants like valid_deletion_date (capitalise name)
#       Split into separate files.

class UserModelTests(LongDocMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.User = get_user_model()
        cls.valid_deletion_date = (timezone.now() + timedelta(days=31)).date()

    def test_create_user_with_valid_params(self):
        """
        create_user() returns a matching active normal user when called with
        valid parameters.
        """
        user = self.User.objects.create_user(
            username="test",
            email="test@example.com",
            deletion_date=self.valid_deletion_date,
            password="testpass",
        )
        self.assertEqual(user.username, "test")
        self.assertEqual(user.email, "test@example.com")
        self.assertEqual(user.deletion_date, self.valid_deletion_date)
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser_with_valid_params(self):
        """
        create_superuser() returns a macthing active superuser when called
        with valid parameters.
        """
        user = self.User.objects.create_superuser(
            username="test",
            email="test@example.com",
            password="testpass",
        )
        self.assertEqual(user.username, "test")
        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)

    def test_create_user_with_missing_params(self):
        """
        create_user() raises a TypeError when required parameters are missing.
        """
        with self.assertRaises(TypeError):
            self.User.objects.create_user()
        with self.assertRaises(TypeError):
            self.User.objects.create_user(
                username="test",
                email="test@example.com",
                deletion_date=self.valid_deletion_date,
            )
        with self.assertRaises(TypeError):
            self.User.objects.create_user(
                username="test",
                deletion_date=self.valid_deletion_date,
                password="testpass",
            )
        with self.assertRaises(TypeError):
            self.User.objects.create_user(
                username="test", email="test@example.com", password="testpass"
            )
        with self.assertRaises(TypeError):
            self.User.objects.create_user(
                username="test",
                email="test@example.com",
                deletion_date=self.valid_deletion_date,
            )

    def test_create_superuser_with_missing_params(self):
        """
        create_superuser() raises a TypeError when required parameters are missing.
        """
        with self.assertRaises(TypeError):
            self.User.objects.create_superuser()
        with self.assertRaises(TypeError):
            self.User.objects.create_superuser(
                username="test",
                email="test@example.com",
            )
        with self.assertRaises(TypeError):
            self.User.objects.create_superuser(
                username="test",
                password="testpass",
            )
        with self.assertRaises(TypeError):
            self.User.objects.create_superuser(
                username="test",
                email="test@example.com",
            )

    def test_create_user_with_invalid_params(self):
        """
        create_user() raises a ValueError when username, password, or email are blank
        or deletion_date is not between next month and 5 years in the future
        """
        with self.assertRaises(ValueError):
            self.User.objects.create_user(
                username="",
                email="test@example.com",
                password="testpass",
                deletion_date=self.valid_deletion_date,
            )
        with self.assertRaises(ValueError):
            self.User.objects.create_user(
                username="test",
                email="",
                password="testpass",
                deletion_date=self.valid_deletion_date,
            )
        with self.assertRaises(ValueError):
            self.User.objects.create_user(
                username="test",
                email="test@example.com",
                password="",
                deletion_date=self.valid_deletion_date,
            )
        with self.assertRaises(ValueError):
            self.User.objects.create_user(
                username="test",
                email="test@example.com",
                password="testpass",
                deletion_date=None,
            )
        current_date = timezone.now().date()
        with self.assertRaises(ValueError):
            self.User.objects.create_user(
                username="test",
                email="test@example.com",
                password="testpass",
                deletion_date=current_date.replace(
                    day=monthrange(current_date.year, current_date.month)[1]
                ),
            )
        with self.assertRaises(ValueError):
            self.User.objects.create_user(
                username="test",
                email="test@example.com",
                password="testpass",
                deletion_date=current_date.replace(
                    year=current_date.year + 6, month=8, day=1
                ),
            )


class LoginViewTests(LongDocMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.URL_PREFIX = "/api/users/login/"
        cls.User = get_user_model()
        cls.username = "test"
        cls.password = "testpass"
        cls.User.objects.create_superuser(
            username=cls.username, email="test@example.com", password=cls.password
        )

    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)

    def test_csrf_unset(self):
        """
        posting valid login credentials to /api/users/login/ with CSRF token and cookie not set
        returns a HTTP 403 Forbidden response
        """
        response = self.client.post(
            self.URL_PREFIX,
            {"username": self.username, "password": self.password},
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_csrf_set(self):
        """
        posting valid login credentials to /api/users/login/ with CSRF token and cookie set
        successfully returns the associated user's session
        """
        # Use APIRequestFactory to create a bogus request object that can be passed into get_token()
        # so as to get a valid CSRF token. At the time of writing (2022), using the underlying
        # private functions as in: csrf_token = _mask_cipher_secret(_get_new_csrf_string())
        # also works, but seeing how they're used in the other functions suggests using them directly
        # might be a bad ieea.
        # TODO: Add a view, e.g. getcsrf, that sets the csrftoken cookie and then just use
        #       self.client.get("/api/getcsrf/", HTTP_HOST=TEST_HOST) to set the csrf
        #       cookie and then grab it from response.cookies["csrftoken"]
        csrf_token = get_token(APIRequestFactory().get(""))
        # Note that a matching CSRF token must be provided in both cookies and credentials as per the
        # double submit cookie technique.
        self.client.credentials(HTTP_X_CSRFTOKEN=csrf_token)
        self.client.cookies = SimpleCookie({"csrftoken": csrf_token})
        self.assertFalse("sessionid" in self.client.cookies.keys())
        # TODO: add format="json"?
        response = self.client.post(
            self.URL_PREFIX,
            {"username": "test", "password": "testpass"},
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("sessionid" in self.client.cookies.keys())


class DestroyexpiredusersTests(LongDocMixin, TestCase):
    """
    Tests for the destroyexpiredusers custom command under users/management/commands.
    """
    @classmethod
    def setUpTestData(cls):
        cls.User = get_user_model()
        cls.username = "test"
        cls.password = "testpass"
    
    def test_ignores_superuser(self):
        """
        destroyexpiredusers should ignore superusers.
        """
        superuser = create_test_user(self.username, self.password, superuser=True)
        out = StringIO()
        call_command("destroyexpiredusers", stdout=out)
        self.assertIn("Found 0 expired user accounts.\nFinished in", out.getvalue())
        self.assertIn(superuser, get_user_model().objects.all())

    def test_ignores_unexpired_user(self):
        """
        destroyexpiredusers should ignore users with a date of deletion in the future.
        """
        unexpired_user = create_test_user(self.username, self.password)
        out = StringIO()
        call_command("destroyexpiredusers", stdout=out)
        self.assertIn("Found 0 expired user accounts.\nFinished in", out.getvalue())
        self.assertIn(unexpired_user, get_user_model().objects.all())

    def test_delete_expired_user(self):
        """
        destroyexpiredusers should delete users with a date of deletion in the past.
        """
        expired_user = create_test_user(self.username, self.password)
        expired_user.deletion_date = (timezone.now() - timedelta(days=1)).date()
        expired_user.save()
        out = StringIO()
        call_command("destroyexpiredusers", stdout=out)
        self.assertIn("Found 1 expired user accounts.\nDestroying user: {}\nUser destroyed.\nFinished in".format(self.username), out.getvalue())
        self.assertNotIn(expired_user, get_user_model().objects.all())

    def test_delete_expired_users(self):
        """
        destroyexpiredusers should be able to delete multiple users in a single run.
        """
        expired_user_1 = create_test_user(self.username, self.password)
        expired_user_1.deletion_date = (timezone.now() - timedelta(days=1)).date()
        expired_user_1.save()
        expired_user_2 = create_test_user("test2", "test2pass")
        expired_user_2.deletion_date = (timezone.now() - timedelta(days=1)).date()
        expired_user_2.save()
        out = StringIO()
        call_command("destroyexpiredusers", stdout=out)
        self.assertIn("Found 2 expired user accounts.\nDestroying user: {}\nUser destroyed.\nDestroying user: {}\nUser destroyed.\nFinished in".format(self.username, "test2"), out.getvalue())
        self.assertNotIn(expired_user_1, get_user_model().objects.all())
        self.assertNotIn(expired_user_2, get_user_model().objects.all())
