from datetime import timedelta

from lsuves_website.settings import TEST_HOST
from lsuves_website.utils import LongDocMixin
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from .models import Post


class PostModelTests(LongDocMixin, TestCase):
    """
    Tests for the Post model.
    """

    # TODO: Test images, events, and published date once schema finalised.
    @classmethod
    def setUpTestData(cls):
        cls.TITLE = "Test title"
        cls.BODY = "Test body."
        cls.DATE = timezone.now()

    def test_create_post_with_valid_params(self):
        """
        create() returns a matching blog post when called with valid parameters.
        """
        post = Post.objects.create(title=self.TITLE, body=self.BODY, date=self.DATE)
        self.assertEqual(post.title, self.TITLE)
        self.assertEqual(post.body, self.BODY)
        self.assertEqual(post.date, self.DATE)

    # def test_create_post_with_invalid_params(self):
    #     """
    #     create() raises a TypeError when required parameters are missing.
    #     """
    #     with self.assertRaises(TypeError):
    #         Post.objects.create(body=self.BODY, date=self.DATE)

    #     with self.assertRaises(TypeError):
    #         Post.objects.create(title=self.TITLE, body=self.BODY)


class BlogViewTests(LongDocMixin, TestCase):
    """
    Tests for the blog views.
    """

    @classmethod
    def setUpTestData(cls):
        cls.URL_PREFIX = "/api/blog/"

        # TODO: In the future, posts with a date in the future should probably count as unpublished/invalid.
        cls.post3 = Post.objects.create(
            title="Post 3 title",
            body="Post 3 body",
            date=timezone.now() + timedelta(hours=1),
        )
        cls.post2 = Post.objects.create(
            title="Post 2 title", body="Post 2 body", date=timezone.now()
        )
        cls.post1 = Post.objects.create(
            title="Post 1 title",
            body="Post 1 body",
            date=timezone.now() - timedelta(hours=1),
        )

        cls.USER = get_user_model()
        cls.USERNAME = "test"
        cls.PASSWORD = "testpass"
        cls.USER.objects.create_superuser(
            username=cls.USERNAME, email="test@example.com", password=cls.PASSWORD
        )

    def setUp(self):
        self.client = APIClient()

    def test_get_posts(self):
        """
        Unauthenticated users can see all published blog posts.
        """

        # An unauthenticated user can get the list of all published blog posts
        # ordered by most recent date of publication.
        get_posts = self.client.get(
            "{}".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            [(post["id"], post["title"]) for post in get_posts.data],
            [(post.id, post.title) for post in [self.post3, self.post2, self.post1]],
        )

        # An unauthenticated user can get a specific published blog post.
        get_post = self.client.get(
            "{}{}/".format(self.URL_PREFIX, self.post2.id),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            (get_post.data["id"], get_post.data["title"]),
            (self.post2.id, self.post2.title),
        )

    def test_create_edit_delete_posts(self):
        """
        Only staff can create/edit/delete blog posts.
        """
        # TODO: Add tests for an authed non-admin user as well.
        #       Test put as well?
        # Attempt to delete post as unauthenticated user.
        unauthed_delete = self.client.delete(
            "{}{}/".format(self.URL_PREFIX, self.post2.id),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(unauthed_delete.status_code, status.HTTP_403_FORBIDDEN)

        # Attempt to update post as unauthenticated user.
        unauthed_update = self.client.patch(
            "{}{}/".format(self.URL_PREFIX, self.post1.id),
            {"date": timezone.now() + timedelta(hours=2)},
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(unauthed_update.status_code, status.HTTP_403_FORBIDDEN)

        # Attempt to create post as unauthenticated user.
        unauthed_create = self.client.post(
            "{}".format(self.URL_PREFIX),
            {"title": "Post 4 title", "body": "Post 4 body", "date": timezone.now()},
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(unauthed_create.status_code, status.HTTP_403_FORBIDDEN)

        # Login as staff.
        self.client.login(username=self.USERNAME, password=self.PASSWORD)

        # Delete post as staff.
        admin_delete = self.client.delete(
            "{}{}/".format(self.URL_PREFIX, self.post2.id),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(admin_delete.status_code, status.HTTP_204_NO_CONTENT)

        # Update post as staff
        new_date = timezone.now() + timedelta(hours=2)
        admin_update = self.client.patch(
            "{}{}/".format(self.URL_PREFIX, self.post1.id),
            {"date": new_date},
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(admin_update.status_code, status.HTTP_200_OK)

        # Create post as staff
        admin_create = self.client.post(
            "{}".format(self.URL_PREFIX),
            {"title": "Post 4 title", "body": "Post 4 body", "date": timezone.now()},
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(admin_create.status_code, status.HTTP_201_CREATED)
        post_4 = (admin_create.data["id"], admin_create.data["title"])

        # Confirm post 2 has been removed, post 1 made the most recent, and post 4 created.
        edited_posts = self.client.get(
            "{}".format(self.URL_PREFIX),
            HTTP_HOST=TEST_HOST,
        )
        self.assertEqual(
            [(post["id"], post["title"]) for post in edited_posts.data],
            [(post.id, post.title) for post in [self.post1, self.post3]] + [(post_4)],
        )
