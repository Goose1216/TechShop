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
        product = representation['product']
        quantity = representation['quantity']
        representation['total_price'] = product['price'] * quantity
        return representation

class CartSerializer(serializers.ModelSerializer):
    cart_items = CartItemSerializer(read_only=True, many=True)

    class Meta:
        fields = ('cart_items',)
        model = Cart

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        items = representation['cart_items']
        total_price = 0
        for item in items:
            total_price += item['total_price']
        representation['total_price'] = total_price
        return representation

class PkSerializer(serializers.Serializer):
    product = serializers.IntegerField()

class DummySerializer(serializers.Serializer):
    message = serializers.Field()

class DummyWithCountSerializer(serializers.Serializer):
    message = serializers.Field()
    count = serializers.IntegerField()
