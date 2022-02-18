from rest_framework import serializers

from .models import User


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ("username", "password", "email", "deletion_date")


# TODO: Should I have a serializer for the login view?
# class LoginSerializer()
