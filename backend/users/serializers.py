from allauth.account.models import EmailAddress
from rest_framework import serializers
from django.contrib.auth import get_user_model


class CustomUserSerializer(serializers.ModelSerializer):
    email_verified = serializers.SerializerMethodField()

    class Meta:
        model = get_user_model()
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'email_verified')

    def get_email_verified(self, obj):
        return EmailAddress.objects.filter(user=obj, email=obj.email, verified=True).exists()
