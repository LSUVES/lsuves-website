from avgs_website.permissions import IsAdminUserOrReadOnly
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import SAFE_METHODS, AllowAny, IsAdminUser
from rest_framework.serializers import Serializer

from .models import Post
from .serializers import PostSerializer


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    queryset = Post.objects.all()
    permission_classes = [IsAdminUserOrReadOnly]
