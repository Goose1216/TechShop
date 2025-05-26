import json
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from products.models import Product
from .models import Cart, CartItem

User = get_user_model()

class CartAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.product = Product.objects.create(
            name='Test Product',
            price_standart=100,
        )
        self.client = APIClient()
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=1)
        self.cart_cookie = json.dumps(str(self.cart.id))

    def test_cart_item_list_authenticated(self):
        self.client.force_authenticate(user=self.user)
        self.client.cookies['cart'] = self.cart_cookie
        url = reverse('cart_item_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('cart_items', response.data)
        self.assertIn('total_price', response.data)

    def test_cart_item_add(self):
        self.client.force_authenticate(user=self.user)
        self.client.cookies['cart'] = self.cart_cookie
        url = reverse('cart_item_add')
        data = {'product': self.product.id}
        response = self.client.post(url, data, format='json')
        self.assertIn(response.status_code, [200, 204])

    def test_cart_item_update(self):
        self.client.force_authenticate(user=self.user)
        self.client.cookies['cart'] = self.cart_cookie
        url = reverse('cart_item_update', args=[self.product.id])
        data = {'quantity': 5}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.cart_item.refresh_from_db()
        self.assertEqual(self.cart_item.quantity, 5)

    def test_cart_item_delete(self):
        self.client.force_authenticate(user=self.user)
        self.client.cookies['cart'] = self.cart_cookie
        url = reverse('cart_item_delete', args=[self.product.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(CartItem.objects.filter(cart=self.cart, product=self.product).exists())

    def test_delete_cart(self):
        self.client.force_authenticate(user=self.user)
        self.client.cookies['cart'] = self.cart_cookie
        url = reverse('cart_delete')
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Cart.objects.filter(id=self.cart.id).exists())

    def test_cart_count(self):
        self.client.force_authenticate(user=self.user)
        self.client.cookies['cart'] = self.cart_cookie
        url = reverse('cart_count')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('count', response.data)
        self.assertEqual(response.data['count'], 1)

    def test_cart_item_add_invalid_product(self):
        self.client.force_authenticate(user=self.user)
        self.client.cookies['cart'] = self.cart_cookie
        url = reverse('cart_item_add')
        data = {'product': 999999}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 404)

    def test_cart_item_update_invalid_quantity(self):
        self.client.force_authenticate(user=self.user)
        self.client.cookies['cart'] = self.cart_cookie
        url = reverse('cart_item_update', args=[self.product.id])
        data = {'quantity': 0}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(CartItem.objects.filter(cart=self.cart, product=self.product).exists())

    def test_cart_item_delete_not_found(self):
        self.client.force_authenticate(user=self.user)
        self.client.cookies['cart'] = self.cart_cookie
        url = reverse('cart_item_delete', args=[999999])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 404)

    def test_cart_item_list_unauthenticated(self):
        cart = Cart.objects.create()
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)
        cart_cookie = json.dumps(str(cart.id))
        self.client.cookies['cart'] = cart_cookie
        url = reverse('cart_item_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('cart_items', response.data)

