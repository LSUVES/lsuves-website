from datetime import datetime

from rest_framework import serializers

from .models import User


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ("username", "email", "deletion_date", "password")

    def create(self, validated_data):
        # FIXME: Either add manager validators to serializer or wrap in:
        # try:
        user = User.objects.create_user(**validated_data)
        # except ValidationError [?] as e [?]:
        #   raise serializers.ValidationError(e[/some error string/dictionary keyed by field if implemented in validate() method])
        return user


# TODO: Should I have a serializer for the login view?
# class LoginSerializer()
