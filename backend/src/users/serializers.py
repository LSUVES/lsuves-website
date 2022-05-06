import unicodedata
from datetime import datetime

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMultiAlternatives
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import serializers

from .models import User

# TODO: Consider using regular model serializers


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for validating and creating a new user.
    """

    class Meta:
        model = User
        # FIXME: Declare password field separately so it doesn't take the character limit of
        #        the hash model field (max_length=128).
        fields = (
            "username",
            "email",
            "deletion_date",
            "password",
            "is_staff",
        )

    def create(self, validated_data):
        # FIXME: Either add manager validators to serializer or wrap in:
        # try:
        user = User.objects.create_user(**validated_data)
        # except ValidationError [?] as e [?]:
        #   raise serializers.ValidationError(e[/some error string/dictionary keyed by field if implemented in validate() method])
        return user


# TODO: Should there be a serializer for the login view?
# class LoginSerializer()


# TODO: Should snake_case fields be declared separately as camelCase?
class ProfileSerializer(serializers.HyperlinkedModelSerializer):
    isAdmin = serializers.BooleanField(source="is_staff")

    class Meta:
        model = User
        fields = (
            "url",
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "student_id",
            "deletion_date",
            "is_member",
            "is_requesting_membership",
            "isAdmin",
            "is_superuser",
        )


class ChangeOwnPasswordSerializer(serializers.Serializer):
    """
    Serializer for changing a user's own password.
    """

    old_password = serializers.CharField()
    new_password = serializers.CharField()


class DeleteOwnAccountSerializer(serializers.Serializer):
    """
    Serializer for deleting a user's own account.
    """

    password = serializers.CharField()


class PasswordResetEmailSerializer(serializers.Serializer):
    """
    Serializer adaption of Django's own PasswordResetForm:
    https://github.com/django/django/blob/main/django/contrib/auth/forms.py#L255
    """

    email = serializers.EmailField()  # max_length?

    UserModel = get_user_model()

    @staticmethod
    def _unicode_ci_compare(s1, s2):
        """
        Perform case-insensitive comparison of two identifiers, using the
        recommended algorithm from Unicode Technical Report 36, section
        2.11.2(B)(2).
        """
        return (
            unicodedata.normalize("NFKC", s1).casefold()
            == unicodedata.normalize("NFKC", s2).casefold()
        )

    def send_mail(self, username, uid, token, from_email, to_email):
        subject = "AVGS password reset link"
        # TODO: Use template and populate with context for url as in Django's implementation
        body = "Hello {},\nVisit the link below to reset your password:\nhttp://localhost:3000/reset-password/?uid={}&token={}\nKind regards,\nAVGS".format(
            username, uid, token
        )
        # TODO: Either add an HTML email template or just use EmailMessage
        email_message = EmailMultiAlternatives(subject, body, from_email, [to_email])
        email_message.send()

    def get_users(self, email):
        """
        Given an email, return matching user(s) who should receive a reset.
        This allows subclasses to more easily customize the default policies
        that prevent inactive users and users with unusable passwords from
        resetting their password.
        """
        email_field_name = self.UserModel.get_email_field_name()
        active_users = self.UserModel._default_manager.filter(
            **{
                "%s__iexact" % email_field_name: email,
                "is_active": True,
            }
        )
        return (
            u
            for u in active_users
            if u.has_usable_password()
            and self._unicode_ci_compare(email, getattr(u, email_field_name))
        )

    def save(self):
        email = self.validated_data["email"]
        # Unnecessary as the values are known, but better practice.
        # print(get_current_site(self.request)) # Try in views
        email_field_name = self.UserModel.get_email_field_name()
        # print(email_field_name)
        for user in self.get_users(email):
            # TODO: Seems unnecessary
            user_email = getattr(user, "email")  # email_field_name
            # print(email, user_email, email == user_email)
            # print(
            #     user,
            #     user.username,
            #     user == user.username,
            #     repr(user),
            #     str(user) == user.username,
            # )
            # FIXME: Get from_email from settings.
            self.send_mail(
                user.username,
                urlsafe_base64_encode(force_bytes(user.pk)),
                default_token_generator.make_token(user),
                "changeme@avgs.com",
                user_email,
            )
