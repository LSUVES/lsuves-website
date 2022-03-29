from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import status, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import UserSerializer


@ensure_csrf_cookie
def set_csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set"})


# FIXME: Validate data with serializer and use:
#        if serializer.is_valid():
#           return Response(serializer.data)
#        return Response(serializer.errors, status=status.etc)
@api_view(["POST"])
@csrf_protect
def login_view(request, format=None):
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


# FIXME: Should this have a concrete method?
#        Add decorators from above
def logout_view(request, format=None):
    if not request.user.is_authenticated:
        return JsonResponse(
            {"detail": "User not logged in."}, status=status.HTTP_400_BAD_REQUEST
        )

    logout(request)
    return JsonResponse({"detail": "Successfully logged out."})


# FIXME: Add CSRF protection
class RegisterView(APIView):
    def post(self, request, format=None):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# FIXME: Enforce permissions so only staff/same users can edit and consider
#        whether all the viewset methods are necessary
# TODO: Merge above into this class
class UserViewSet(viewsets.ModelViewSet):
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
