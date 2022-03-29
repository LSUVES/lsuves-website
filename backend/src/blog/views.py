from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.serializers import Serializer

from .models import Post
from .serializers import PostSerializer


# FIXME: Enforce permissions so only staff can edit and consider whether all
#        the viewset methods are necessary
class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    queryset = Post.objects.all()
