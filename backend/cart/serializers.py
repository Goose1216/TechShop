from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductSerializerList


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializerList(read_only=True, many=False)

    class Meta:
        fields = ('product', 'quantity')
        model = CartItem

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        """
        ДЛЯ ПРОДАКШЕНА ПОМЕНЯТЬ СТРОКУ НИЖЕ!!!
        Для Image почему-то пришлось явно указывать полный адрес, иначе фотка пыталась скачать с фронтенда
        """
        return representation


class CartSerializer(serializers.ModelSerializer):
    cart_items = CartItemSerializer(read_only=True, many=True)

    class Meta:
        fields = ('cart_items',)
        model = Cart
