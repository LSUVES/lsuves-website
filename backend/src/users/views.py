from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import status, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import UserProfileSerializer, UserSerializer


@ensure_csrf_cookie
def set_csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set"})


# FIXME: !! Ensure password cannot be the same as username !!
#        Add CSRF protection
class RegisterView(APIView):
    def post(self, request, format=None):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# FIXME: Enforce permissions so only staff/same users can edit
#        Consider whether all the viewset methods are necessary
# TODO: Consider whether to add @static_method to methods that don't need self
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()

    def get_serializer_class(self):
        if self.action == "profile":
            self.serializer_class = UserProfileSerializer
        else:
            self.serializer_class = UserSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        # TODO: Pull is_admin into is_authenticated and set profile's permissions to IsAuthenticated
        if self.action in ("is_authenticated", "profile", "login", "register"):
            self.permission_classes = [AllowAny]
        elif self.action == "logout":
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

    @action(detail=False)
    def profile(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @method_decorator(csrf_protect)
    @action(methods=["POST"], detail=False)
    def register(self, request):
        # FIXME: !! Ensure password cannot be the same as username !!
        serializer = UserSerializer(data=request.data)
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
        if not request.user.is_authenticated:
            return JsonResponse(
                {"detail": "User not logged in."}, status=status.HTTP_400_BAD_REQUEST
            )

        logout(request)
        return JsonResponse({"detail": "Successfully logged out."})
