from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.serializers import Serializer

from .models import Post
from .serializers import PostSerializer


class PostView(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    queryset = Post.objects.all()
