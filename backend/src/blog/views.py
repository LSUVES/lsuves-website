from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import SAFE_METHODS, AllowAny, IsAdminUser
from rest_framework.serializers import Serializer

from .models import Post
from .serializers import PostSerializer


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    queryset = Post.objects.all()

    def get_permissions(self):
        # All users can see blog posts but only admins can create, edit, or
        # delete them.
        if self.action in SAFE_METHODS + ("list",):
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()
