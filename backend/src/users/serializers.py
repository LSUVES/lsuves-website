from datetime import datetime

from rest_framework import serializers

from .models import User


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ("username", "email", "deletion_date", "password")

    def create(self, validated_data):
        print(
            type(validated_data["deletion_date"]),
            isinstance(validated_data["deletion_date"], datetime),
        )
        user = User.objects.create_user(**validated_data)
        return user


# TODO: Should I have a serializer for the login view?
# class LoginSerializer()
