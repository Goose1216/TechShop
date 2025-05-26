from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Product, Brand, Category, Review

User = get_user_model()

class ProductsAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.brand = Brand.objects.create(name='TestBrand')
        self.category1 = Category.objects.create(name='Новинка', name_latinica='novinka')
        self.category2 = Category.objects.create(name='Выгодно', name_latinica='vygodno')

        self.product = Product.objects.create(
            name='Test Product',
            price_standart=1000,
            discount=10,
            brand=self.brand,
        )
        self.product.category.set([self.category1, self.category2])
        self.product.save()

    def test_product_list(self):
        url = reverse('product_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data['results']) >= 1)
        self.assertIn('name', response.data['results'][0])
        self.assertIn('price', response.data['results'][0])

    def test_product_detail(self):
        url = reverse('product_detail', args=[self.product.slug])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.product.name)
        self.assertIn('brand', response.data)
        self.assertIn('category', response.data)

    def test_product_main(self):
        url = reverse('products-main')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for item in response.data:
            categories = [cat['name'] for cat in item['category']]
            self.assertTrue('Новинка' in categories or 'Выгодно' in categories)

    def test_review_create_and_duplicate(self):
        url = reverse('review_create')
        data = {
            'product': self.product.id,
            'review': 'Отличный товар!',
            'rate': '5'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response2 = self.client.post(url, data, format='json')
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Пользователь уже оставил свой отзыв', str(response2.data))

    def test_review_list(self):
        Review.objects.create(product=self.product, author=self.user, review='Тестовый отзыв', rate='4')

        url = reverse('review_list') + f'?slug={self.product.slug}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)
        self.assertEqual(response.data[0]['review'], 'Тестовый отзыв')

    def test_category_list(self):
        url = reverse('category_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(cat['name'] == 'Новинка' for cat in response.data))

    def test_product_import_invalid_file(self):
        url = reverse('import-products')
        data = {
            'data_file': 'not_a_file.txt',
            'images_dir': '/tmp'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
