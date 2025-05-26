import json
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from cart.models import Cart, CartItem
from products.models import Product
from .models import Order, OrderItem

User = get_user_model()

class OrdersAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.product = Product.objects.create(
            name='Test product',
            price_standart=100,
        )

        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)

        self.cart_cookie = json.dumps(str(self.cart.id))

    def test_create_order_success(self):
        url = reverse('orders_create')
        data = {
            "phone": "+79999999999",
            "email": "test@example.com",
            "name_client": "Иван Иванов",
            "address": "Москва, ул. Пушкина, 10"
        }
        self.client.cookies['cart'] = self.cart_cookie

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'OK')

        order = Order.objects.filter(client=self.user).first()
        self.assertIsNotNone(order)
        self.assertEqual(order.phone, data['phone'])
        self.assertEqual(order.email, data['email'])
        self.assertEqual(order.name_client, data['name_client'])
        self.assertEqual(order.address, data['address'])

        order_item = order.order_items.first()
        self.assertIsNotNone(order_item)
        self.assertEqual(order_item.product, self.product)
        self.assertEqual(order_item.quantity, 2)
        self.assertEqual(order_item.price, self.product.price)

        self.assertFalse(Cart.objects.filter(id=self.cart.id).exists())

    def test_create_order_no_cart_cookie(self):
        url = reverse('orders_create')
        data = {
            "phone": "+79999999999",
            "email": "test@example.com",
            "name_client": "Иван Иванов",
            "address": "Москва, ул. Пушкина, 10"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Корзина пуста')

    def test_create_order_invalid_data(self):
        url = reverse('orders_create')
        data = {
            "phone": "invalid_phone",
            "email": "not-an-email",
            "name_client": "",
            "address": ""
        }
        self.client.cookies['cart'] = self.cart_cookie
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_order_list(self):
        order = Order.objects.create(
            client=self.user,
            phone="+79999999999",
            email="test@example.com",
            name_client="Иван Иванов",
            address="Москва",
        )
        OrderItem.objects.create(
            order=order,
            product=self.product,
            quantity=1,
            price=self.product.price,
            total_price=self.product.price,
        )

        url = reverse('orders_list') + '?sort=-created_at'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_order_list_sorting(self):
        import time
        order1 = Order.objects.create(client=self.user, phone="+79999999999", email="a@test.com", name_client="A", address="Addr1")
        time.sleep(1)
        order2 = Order.objects.create(client=self.user, phone="+79999999999", email="b@test.com", name_client="B", address="Addr2")

        url = reverse('orders_list') + '?sort=-created_at'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(str(response.data[0]['uuid']), str(order2.uuid))

    def test_order_detail(self):
        order = Order.objects.create(
            client=self.user,
            phone="+79999999999",
            email="test@example.com",
            name_client="Иван Иванов",
            address="Москва",
        )
        url = reverse('orders_detail', args=[order.uuid])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(str(response.data['uuid']), str(order.uuid))

    def test_order_detail_other_user_forbidden(self):
        other_user = User.objects.create_user(username='otheruser', password='pass')
        order = Order.objects.create(
            client=other_user,
            phone="+79999999999",
            email="other@example.com",
            name_client="Другой пользователь",
            address="Москва",
        )
        url = reverse('orders_detail', args=[order.uuid])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)

        url = reverse('orders_create')
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
