from django.db import models
from django.conf import settings
from django.db.models import Sum
import uuid
from django.core.validators import RegexValidator

from products.models import Product


statuses = (
    ('1', 'В обработке'),
    ('2', 'В пути'),
    ('3', 'Готов'),
    ('4', 'Отменён'),
)


class Order(models.Model):
    uuid = models.UUIDField(primary_key=True, db_index=True, verbose_name="UUID", default=uuid.uuid4, blank=True)
    client = models.ForeignKey(settings.AUTH_USER_MODEL, db_index=True, null=True, blank=False, on_delete=models.SET_NULL, verbose_name="Зазачик")
    status = models.CharField(choices=statuses, verbose_name="Статус заказа", default="1", max_length=50)
    total_price = models.PositiveIntegerField(verbose_name="Сумма заказа", default=0)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания", editable=False)
    email = models.EmailField(verbose_name='Почта')
    phone = models.CharField(max_length=12,  validators=[
            RegexValidator(
                regex=r'^(?:\+7|8)\d{10}$',
                message="Телефонный номер должен быть представлен в виде +79999999999 (11 цифр)"
            )
        ])
    address = models.CharField(max_length=100, verbose_name='Адрес заказчика')
    name_client = models.CharField(max_length=100, verbose_name='ФИО заказчика')

    def save(self, *args, **kwargs):
        total = OrderItem.objects.filter(order=self).aggregate(Sum('total_price'))['total_price__sum']
        self.total_price = total if total is not None else 0
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        pass

    def __str__(self):
        return f'Заказ номер {self.uuid}'

    class Meta:
        default_related_name = 'orders'
        verbose_name = "Заказ"
        verbose_name_plural = "Заказы"


class OrderItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Товар", related_name="order_items")
    order = models.ForeignKey(Order, on_delete=models.CASCADE, verbose_name="Заказ", related_name="order_items")
    quantity = models.PositiveIntegerField(verbose_name="Количество товара", default=1)
    total_price = models.PositiveIntegerField(verbose_name="Конечная стоимость товаров", blank=True)
    price = models.PositiveIntegerField(verbose_name="Cтоимость товара", blank=True)

    def save(self, *args, **kwargs):
        self.price = self.product.price
        self.total_price = self.price * self.quantity
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        pass

    def __str__(self):
        return f'Товар {str(self.product)} {self.quantity} шт.'

    class Meta:
        verbose_name = "Товар заказа"
        verbose_name_plural = "Товары заказа"