import json
import datetime

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.yandex.views import YandexAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client

from dj_rest_auth.registration.views import SocialLoginView
from dj_rest_auth.views import LoginView, LogoutView

from cart.models import Cart, CartItem


class GoogleLoginView(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = 'http://localhost:3000/login/google'
    client_class = OAuth2Client


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
    new_cart = Cart.objects.create()

    for item in user_cart.cart_items.all():
        CartItem.objects.create(
            cart=new_cart,
            product=item.product,
            quantity=item.quantity
        )

    return new_cart.id


def sync_carts_logged_in(anonymous_cart, user):
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


class CustomLogoutView(LogoutView):
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