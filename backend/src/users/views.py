from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_protect
from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .models import User
from .serializers import UserSerializer


# FIXME: Use DRF's built-in exceptions instead of writing them as JSON responses
@api_view(["POST"])
@csrf_protect
def login_view(request, format=None):
    try:
        user = authenticate(
            username=request.data["username"], password=request.data["password"]
        )
    except KeyError:
        return JsonResponse(
            {"detail": "Please provide username and password."}, status=400
        )

    if user is None:
        return JsonResponse({"detail": "Invalid credentials."}, status=400)

    login(request, user)
    return JsonResponse({"detail": "Successfully logged in."})


# FIXME: Should this have a concrete method?
def logout_view(request, format=None):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "User not logged in."}, status=400)

    logout(request)
    return JsonResponse({"detail": "Successfully logged out."})


class UserView(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()


# TODO: Is this really necessary?
class SessionView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    # @staticmethod # Is this useful?
    def get(self, request, format=None):
        return JsonResponse({"isAuthenticated": True})


class ProfileView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    # @staticmethod # Is this useful?
    def get(self, request, format=None):
        return JsonResponse(
            {
                "username": request.user.username,
                "email": request.user.email,
                "deletion_date": request.user.deletion_date,
                "isAdmin": request.user.is_staff,
            }
        )
