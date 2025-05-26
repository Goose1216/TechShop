from rest_framework import serializers
from .models import Order, OrderItem

statuses = [
    ('1', 'В обработке'),
    ('2', 'В пути'),
    ('3', 'Готов'),
    ('4', 'Отменён'),
]

class OrderCreateSerializer(serializers.Serializer):
    phone = serializers.RegexField(
        regex=r'^(?:\+7|8)\d{10}$',
        error_messages={"invalid": "Телефонный номер должен быть в формате +79999999999 или 89999999999"}
    )
    email = serializers.EmailField()
    name_client = serializers.CharField(min_length=1)
    address = serializers.CharField(min_length=1)


class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = OrderItem
        fields = ('product', 'quantity', 'total_price', 'price')


class OrderListSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField(source="get_status")

    class Meta:
        fields = ("uuid", 'status', 'total_price', 'created_at')
        model = Order

    def get_status(self, obj) -> str:
        return dict(statuses).get(obj.status)


class OrderDetailSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(read_only=True, many=True)
    status = serializers.SerializerMethodField(source="get_status")

    class Meta:
        fields = "__all__"
        model = Order

    def get_status(self, obj)-> str:
        return dict(statuses).get(obj.status)