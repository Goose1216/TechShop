import json
import datetime

from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from .models import Cart, CartItem
from django.http import HttpResponse


def sync_carts_logged_out(user_cart):
    new_cart = Cart.objects.create()

    for item in user_cart.cart_items.all():
        CartItem.objects.create(
            cart=new_cart,
            product=item.product,
            defaults={'quantity': item.quantity}
        )

    return new_cart.id


def sync_carts_logged_in(anonymous_cart, user):
    user_cart, created = Cart.objects.get_or_create(user=user)

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


def sync_carts_on_login(sender, request, user, **kwargs):
    pass


@receiver(user_logged_out)
def sync_cart_on_logout(sender, request, user, **kwargs):
    cart_uuid = request.COOKIES.get('cart')
    response = None

    if cart_uuid:
        try:
            cart = json.loads(cart_uuid)
            cart = Cart.objects.get(id=cart, user=user)
            new_cart_id = sync_carts_logged_out(cart)

            response = HttpResponse()
            week = datetime.datetime.now() + datetime.timedelta(days=7)
            response.set_cookie('cart', json.dumps(str(new_cart_id)), max_age=week.timestamp())
        except:
            pass

    return response
