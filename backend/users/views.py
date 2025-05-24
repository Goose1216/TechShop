import json
import datetime

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.yandex.views import YandexAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from dj_rest_auth.views import LoginView, LogoutView
from drf_spectacular.utils import extend_schema
from dj_rest_auth.views import (
    PasswordChangeView, PasswordResetConfirmView,
    PasswordResetView, UserDetailsView,
)
from dj_rest_auth.registration.views import RegisterView, VerifyEmailView, ResendEmailVerificationView

from cart.models import Cart, CartItem
from .serializers import CustomUserSerializer

@extend_schema(tags=['Users'], summary="Авторизация пользователей через Google")
class GoogleLoginView(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = 'http://localhost:3000/login/google'
    client_class = OAuth2Client

@extend_schema(tags=['Users'], summary="Авторизация пользователей через Yandex")
class YandexLoginView(SocialLoginView):
    adapter_class = YandexAuth2Adapter
    callback_url = 'http://localhost:3000/login/yandex'
    client_class = OAuth2Client

    def post(self, request, *args, **kwargs):
        cart_uuid = self.request.COOKIES.get('cart')

        response = super().post(request, *args, **kwargs)

        user = request.user

        if cart_uuid:
            try:
                cart = json.loads(cart_uuid)
                anonymous_cart = Cart.objects.get(id=cart)
                new_cart_id = sync_carts_logged_in(anonymous_cart, user)

                week = datetime.datetime.now() + datetime.timedelta(days=7)
                response.set_cookie('cart', json.dumps(str(new_cart_id)), max_age=week.timestamp(), secure=True, samesite='None')
            except BaseException as e:
                pass
        else:
            try:
                cart = Cart.objects.get(user=user)
                week = datetime.datetime.now() + datetime.timedelta(days=7)
                response.set_cookie('cart', json.dumps(str(cart.id)), max_age=week.timestamp(), secure=True, samesite='None')
            except:
                pass
        return response


def sync_carts_logged_out(user_cart):
    """
    Синхронизация корзины при выходе из аккаунта
    :param user_cart:
    :return:
    """
    new_cart = Cart.objects.create()

    for item in user_cart.cart_items.all():
        CartItem.objects.create(
            cart=new_cart,
            product=item.product,
            quantity=item.quantity
        )

    return new_cart.id


def sync_carts_logged_in(anonymous_cart, user):
    """
    Синхронизация корзины при авторизации
    :param anonymous_cart:
    :param user:
    :return:
    """
    user_cart, created = Cart.objects.get_or_create(user=user)
    if (user_cart != anonymous_cart):
        for item in anonymous_cart.cart_items.all():

            user_item, created = CartItem.objects.get_or_create(
                cart=user_cart,
                product=item.product,
                defaults={'quantity': item.quantity}
            )

            if not created:
                user_item.quantity += item.quantity
                user_item.save()

        anonymous_cart.delete()
    return user_cart.id


@extend_schema(tags=['Users'], summary="Авторизация")
class CustomLoginView(LoginView):
    def post(self, request, *args, **kwargs):
        cart_uuid = self.request.COOKIES.get('cart')

        response = super().post(request, *args, **kwargs)

        user = request.user

        if cart_uuid:
            try:
                cart = json.loads(cart_uuid)
                anonymous_cart = Cart.objects.get(id=cart)
                new_cart_id = sync_carts_logged_in(anonymous_cart, user)

                week = datetime.datetime.now() + datetime.timedelta(days=7)
                response.set_cookie('cart', json.dumps(str(new_cart_id)), max_age=week.timestamp(), secure=True, samesite='None')
            except BaseException as e:
                pass
        else:
            try:
                cart = Cart.objects.get(user=user)
                week = datetime.datetime.now() + datetime.timedelta(days=7)
                response.set_cookie('cart', json.dumps(str(cart.id)), max_age=week.timestamp(), secure=True, samesite='None')
            except:
                pass
        return response


@extend_schema(tags=['Users'], summary="Выход из аккаунта")
class CustomLogoutView(LogoutView):
    serializer_class = None
    def post(self, request, *args, **kwargs):
        cart_uuid = self.request.COOKIES.get('cart')

        response = super().post(request, *args, **kwargs)
        if cart_uuid:
            try:
                cart = json.loads(cart_uuid)
                user_cart = Cart.objects.get(id=cart)
                new_cart_id = sync_carts_logged_out(user_cart)
                week = datetime.datetime.now() + datetime.timedelta(days=7)
                response.set_cookie('cart', json.dumps(str(new_cart_id)), max_age=week.timestamp())
            except BaseException as e:
                print(e)
                pass

        return response

@extend_schema(tags=['Users'], summary='Получение и обновление информации о пользователе')
class UserDetailsView(UserDetailsView):
    serializer_class = CustomUserSerializer
    pass

@extend_schema(tags=['Users'], summary='Изменение пароля')
class PasswordChangeView(PasswordChangeView):
    pass

@extend_schema(tags=['Users'], summary='Подтверждение о изменении пароля')
class PasswordResetConfirmView(PasswordResetConfirmView):
    pass

@extend_schema(tags=['Users'], summary='Сброс пароля')
class PasswordResetView(PasswordResetView):
    pass

@extend_schema(tags=['Users'], summary='Регистрация')
class RegisterView(RegisterView):
    pass

@extend_schema(tags=['Users'], summary='Подтверждение почты')
class VerifyEmailView(VerifyEmailView):
    pass

@extend_schema(tags=['Users'], summary='Повторная отправка подтверждения почты')
class ResendEmailVerificationView(ResendEmailVerificationView):
    pass
