import json
import datetime
import logging

from drf_spectacular.utils import extend_schema
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.decorators import permission_classes, api_view
from django.db import transaction
from rest_framework.response import Response
from .serializers import OrderListSerializer, OrderDetailSerializer, OrderCreateSerializer
from rest_framework.permissions import IsAuthenticated


from .models import Order, OrderItem
from cart.models import Cart, CartItem
from cart.views import get_or_create_cart
from products.models import Product

logger = logging.getLogger('backend')

@extend_schema(tags=['Orders'], summary="Создание Заказа")
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order_view(request):
    try:
        cart_cookie = request.COOKIES.get('cart')
        if cart_cookie is None:
            logger.error(f'Cart is empty')
            return Response({'message': 'Корзина пуста'}, status=400)

        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f'Wrong data')
            return Response(serializer.errors, status=400)

        cart_id = json.loads(cart_cookie)
        is_create_order = create_order(request, cart_id, serializer.validated_data)
        if is_create_order:
            cart = get_or_create_cart(user=request.user)
            cart_id = str(cart.id)
            response = Response({'message': 'OK'}, status=201)
            week = datetime.datetime.now() + datetime.timedelta(days=7)
            response.set_cookie('cart', json.dumps(cart_id), max_age=week.timestamp())
            logger.info(f'Cart delete')
        else:
            logger.error(f'Cart doesnt create')
            response = Response({'message': 'Ошибка'}, status=400)
    except Exception as e:
        logger.error(f'Error: {e}')
        response = Response({'message': 'Ошибка'}, status=400)
    return response


@transaction.atomic
def create_order(request, cart_id, validated_data):
    try:
        logger.debug("Start create order")
        phone = validated_data['phone']
        email = validated_data['email']
        name_client = validated_data['name_client']
        address = validated_data['address']

        cart = Cart.objects.get(id=cart_id)
        cart_items = CartItem.objects.filter(cart=cart)
        order = Order(client=request.user, phone=phone, email=email, name_client=name_client, address=address)
        order.save()

        for item in cart_items:
            product = item.product
            quantity = item.quantity

            if product is None:
                logger.error("Product from cart doesnt real")
                raise ValueError("Товар отсутствует")
            if quantity is None:
                quantity = 1

            order_item = OrderItem(product=product, quantity=quantity, order=order, price=product.price)
            order_item.save()

        order.save()
        cart.delete()

        logger.debug("Succesfull create order")
        return True
    except Exception as e:
        logger.error(f'Error: {e}')
        return False


@extend_schema(tags=['Orders'], summary="Конечная точка показа списка заказов")
class OrderList(ListAPIView):
    permission_classes = (IsAuthenticated,)
    pagination_class = None
    serializer_class = OrderListSerializer

    def get_queryset(self):
        queryset = Order.objects.filter(client=self.request.user)
        query = self.request.query_params.get("sort")
        queryset = queryset.order_by(query)
        return queryset


@extend_schema(tags=['Orders'], summary="Конечная точка показа деталей заказа")
class OrderDetail(RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    pagination_class = None
    serializer_class = OrderDetailSerializer
    queryset = Order.objects.all()
    lookup_field = 'uuid'

    def get_queryset(self):
        return Order.objects.filter(client=self.request.user)