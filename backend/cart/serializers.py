from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductSerializerList


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializerList(read_only=True, many=False)

    class Meta:
        fields = ('product', 'quantity')
        model = CartItem


class CartSerializer(serializers.ModelSerializer):
    cart_items = CartItemSerializer(read_only=True,many=True)

    class Meta:
        fields = ('cart_items',)
        model = Cart
