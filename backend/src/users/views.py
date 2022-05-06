from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.utils.http import urlsafe_base64_decode
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import User
from .serializers import (
    ChangeOwnPasswordSerializer,
    DeleteOwnAccountSerializer,
    PasswordResetEmailSerializer,
    ProfileSerializer,
    RegisterSerializer,
)


def _get_user(uidb64):
    """
    Django's PasswordResetConfirmView.get_user() method.
    Given a base 64 user ID, returns the matching user, if one exists.
    """
    # TODO: Move this to serializers.py?
    try:
        # urlsafe_base64_decode() decodes to bytestring
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User._default_manager.get(pk=uid)
    except (
        TypeError,
        ValueError,
        OverflowError,
        User.DoesNotExist,
        ValidationError,
    ):
        user = None
    return user


@ensure_csrf_cookie
def set_csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set"})


# FIXME: Enforce permissions so only staff/same users can edit
#        Add @sensitive_post_parameters("password", etc.) to methods
# TODO: Consider whether to add @static_method to methods that don't need self
#       Consider whether all the viewset methods are necessary
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()

    def get_serializer_class(self):
        if self.action == "register":
            self.serializer_class = RegisterSerializer
        elif self.action == "email_password_reset_token":
            self.serializer_class = PasswordResetEmailSerializer
        elif self.action == "change_own_password":
            self.serializer_class = ChangeOwnPasswordSerializer
        elif self.action == "delete_own_account":
            self.serializer_class = DeleteOwnAccountSerializer
        else:
            self.serializer_class = ProfileSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        # TODO: Pull is_admin into is_authenticated and set profile's permissions to IsAuthenticated
        #       Should login be IsUnauthenticated? Test what happens if already authed.
        if self.action in (
            "is_authenticated",
            "profile",
            "login",
            "register",
            "email_password_reset_token",
            "check_password_reset_token",
            "reset_password",
        ):
            self.permission_classes = [AllowAny]
        elif self.action in (
            "logout",
            "request_membership",
            "change_own_password",
            "delete_own_account",
        ):
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()

    @action(detail=False)
    def is_authenticated(self, request):
        # TODO: Use a serializer instead of returning a JsonResponse
        if not isinstance(request.user, AnonymousUser):
            return JsonResponse({"isAuthenticated": True})
        else:
            return JsonResponse({"isAuthenticated": False})

    @action(methods=["GET", "PATCH"], detail=False)
    def profile(self, request):
        """
        Custom action for displaying an updating the information associated with
        the requesting user.
        """
        if request.method == "PATCH":
            serializer = self.get_serializer(
                request.user, data=request.data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)

    @method_decorator(csrf_protect)
    @action(methods=["POST"], detail=False)
    def register(self, request):
        # FIXME: !! Ensure password cannot be the same as username !!
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # FIXME: Validate data with serializer and use:
    #        if serializer.is_valid():
    #           return Response(serializer.data)
    #        return Response(serializer.errors, status=status.etc)
    @method_decorator(csrf_protect)
    @action(methods=["POST"], detail=False)
    def login(self, request):
        try:
            user = authenticate(
                username=request.data["username"], password=request.data["password"]
            )
        except KeyError:
            return JsonResponse(
                {"detail": "Please provide username and password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user is None:
            return JsonResponse(
                {"detail": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST
            )

        login(request, user)
        return JsonResponse({"detail": "Successfully logged in."})

    @action(methods=["POST"], detail=False)
    def logout(self, request):
        """
        Calls Django's logout method and then returns a successful response.
        """
        logout(request)
        # TODO: Use Response with a status code (if 200 not default) instead.
        return JsonResponse({"detail": "Successfully logged out."})

    @action(methods=["PATCH"], detail=False)
    def request_membership(self, request):
        """
        For the current user, if is_member=False, sets is_requesting_membership to True.
        """
        user = request.user
        if user.is_member == False:
            user.is_requesting_membership = True
            user.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(
            {"detail": "Account already has membership"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    @action(methods=["PATCH"], detail=False)
    def change_own_password(self, request):
        """
        For the current user, given their old password, sets it to the new one provided.
        """
        # FIXME: Apply password validation to new_password probably via the serializer.
        user = request.user
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            if user.check_password(serializer.validated_data["old_password"]):
                user.set_password(serializer.validated_data["new_password"])
                user.save()
                # Ensure the user doesn't lose their session.
                update_session_auth_hash(request, user)
                return Response(status=status.HTTP_200_OK)
            else:
                return Response(
                    {"detail": "Wrong password provided."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["DELETE"], detail=False)
    def delete_own_account(self, request):
        """
        For the current user, given their password, delete their account.
        """
        user = request.user
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            if user.check_password(serializer.validated_data["password"]):
                user.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response(
                    {"detail": "Wrong password provided."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["PATCH"], detail=True)
    def admin_reset_password(self, request, pk=None):
        """
        Generates a new password for the specified user and returns it in the response.
        """
        password = User.objects.make_random_password()
        user = self.get_object()
        user.set_password(password)
        print(user)
        user.save()
        return JsonResponse({"password": password})

    @action(methods=["POST"], detail=False)
    def email_password_reset_token(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            # TODO: Use HTTP_200_OK instead?
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def check_password_reset_token(self, request):
        """
        Checks whether password reset token and UID pair are valid.
        """
        # TODO: Rename to uidb64 for clarity.
        user = _get_user(request.data["uid"])
        if user is not None and default_token_generator.check_token(
            user, request.data["token"]
        ):
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def reset_password(self, request):
        """
        Given a valid password reset token and UID pair, sets the user's
        password to the one provided.
        """
        user = _get_user(request.data["uid"])
        if user is not None and default_token_generator.check_token(
            user, request.data["token"]
        ):
            user.set_password(request.data["password"])
            user.save()
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
