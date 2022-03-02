from calendar import monthrange
from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from django.http.cookie import SimpleCookie
from django.middleware.csrf import get_token
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient, APIRequestFactory


class LongDocMixin:
    def shortDescription(self):
        try:
            return "\n".join(
                [line.strip() for line in self._testMethodDoc.strip().splitlines()]
            )
        except AttributeError:
            return


# TODO: Consider using a faster password hashing algorithm as mentioned in the docs:
#       https://docs.djangoproject.com/en/4.0/topics/testing/overview/#password-hashing
class UserModelTests(LongDocMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.User = get_user_model()
        cls.valid_deletion_date = timezone.now() + timedelta(days=31)

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
        current_date = timezone.now()
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
        posting valid login credentials to /api/login/ with CSRF token and cookie not set
        returns a HTTP 403 Forbidden response
        """
        # FIXME: replace HTTP_HOST with address of frontend server for production testing
        response = self.client.post(
            "/api/login/",
            {"username": self.username, "password": self.password},
            HTTP_HOST="host.docker.internal",
        )
        self.assertEqual(response.status_code, 403)

    def test_csrf_set(self):
        """
        posting valid login credentials to /api/login/ with CSRF token and cookie set
        successfully returns the associated user's session
        """
        # Use APIRequestFactory to create a bogus request object that can be passed into get_token()
        # so as to get a valid CSRF token. At the time of writing (2022), using the underlying
        # private functions as in: csrf_token = _mask_cipher_secret(_get_new_csrf_string())
        # also works, but seeing how they're used in the other functions suggests using them directly
        # might be a bad ieea.
        csrf_token = get_token(APIRequestFactory().get(""))
        # Note that a matching CSRF token must be provided in both cookies and credentials
        self.client.credentials(HTTP_X_CSRFTOKEN=csrf_token)
        self.client.cookies = SimpleCookie({"csrftoken": csrf_token})
        self.assertFalse("sessionid" in self.client.cookies.keys())
        # FIXME: replace HTTP_HOST with address of frontend server for production testing
        response = self.client.post(
            "/api/login/",
            {"username": "test", "password": "testpass"},
            HTTP_HOST="host.docker.internal",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue("sessionid" in self.client.cookies.keys())
