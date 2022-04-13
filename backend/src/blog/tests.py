from avgs_website.utils import LongDocMixin
from django.test import TestCase
from django.utils import timezone

from .models import Post


class PostModelTests(LongDocMixin, TestCase):
    """
    Tests for the Post model.
    """

    # TODO: Test images and published date one schema finalised.
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


# TODO: Test views.
