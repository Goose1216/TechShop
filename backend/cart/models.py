from django.db import models
from products.models import Product
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Cart(models.Model):
    id = models.UUIDField(verbose_name='UUID', primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, verbose_name='Пользователь', unique=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания корзины')
    last_updated = models.DateTimeField(auto_now=True, verbose_name='Дата последнего обновления')

    def __str__(self):
        return f"cart for {self.user}, date - {self.created_at}"

    class Meta:
        verbose_name = "Корзина"
        verbose_name_plural = "Корзины"
        default_related_name = 'carts'


class CartItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, verbose_name='Товар')
    quantity = models.PositiveIntegerField(default=1, verbose_name='Количество')
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, verbose_name='Корзина')

    def __str__(self):
        return f'cart_item for {self.product.name}'

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'
        default_related_name = 'cart_items'