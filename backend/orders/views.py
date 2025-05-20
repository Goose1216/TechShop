import json
import datetime


from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.decorators import permission_classes, api_view
#from drf_spectacular.utils import extend_schema
from django.db import transaction
from rest_framework.response import Response
from .serializers import OrderListSerializer, OrderDetailSerializer
from rest_framework.permissions import IsAuthenticated
from .models import Order, OrderItem
from cart.models import Cart, CartItem
from cart.views import get_or_create_cart
from products.models import Product


#@extend_schema(summary="Конечная точка создания заказов")
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order_view(request):
    try:
        cart_cookie = request.COOKIES.get('cart')
        if cart_cookie is None:
            return Response({'message': 'Корзина пуста'}, status=400)

        cart_id = json.loads(cart_cookie)
        is_create_order = create_order(request, cart_id)
        if is_create_order:
            cart = get_or_create_cart(user=request.user)
            cart_id = str(cart.id)
            response = Response({'message': 'OK'}, status=201)
            week = datetime.datetime.now() + datetime.timedelta(days=7)
            response.set_cookie('cart', json.dumps(cart_id), max_age=week.timestamp())
        else:
            response =  Response({'message': 'Oшибка'}, status=400)
    except Exception as e:
        print(e)
        response = Response({'message': 'Oшибка'}, status=400)
    return response

@transaction.atomic
def create_order(request, cart_id):
    try:
        data = request.data
        phone = data['phone']
        email = data['email']
        name_client = data['name_client']
        address = data['address']

        cart = Cart.objects.get(id=cart_id)
        cart_items = CartItem.objects.filter(cart=cart)
        order = Order(client=request.user, phone=phone, email=email, name_client=name_client, address=address)
        order.save()

        for item in cart_items:
            product = item.product
            quantity = item.quantity

            if product is None:
                raise ValueError("Товар отсутсвует")
            if quantity is None:
                quantity = 1

            order_item = OrderItem(product=product, quantity=quantity, order=order, price=product.price)
            order_item.save()

        order.save()
        cart.delete()

        return True
    except Exception as e:
        print(e)
        return False

#@extend_schema(summary="Конечная точка показа списка заказов")
class OrderList(ListAPIView):
    permission_classes = (IsAuthenticated,)
    pagination_class = None
    serializer_class = OrderListSerializer

    def get_queryset(self):
        queryset = Order.objects.filter(client=self.request.user)
        query = self.request.query_params.get("sort")
        queryset = queryset.order_by(query)
        return queryset


#@extend_schema(summary="Конечная точка показа деталей заказа")
class OrderDetail(RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    pagination_class = None
    serializer_class = OrderDetailSerializer
    queryset = Order.objects.all()
    lookup_field = 'uuid'

    def get_queryset(self):
        return Order.objects.filter(client=self.request.user)