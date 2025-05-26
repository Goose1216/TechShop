import math

from django.db import models
from django.conf import settings
from django.urls import reverse
from pytils.translit import slugify

Rate = (
    ('1', 'Ужасно'),
    ('2', 'Плохо'),
    ('3', 'Удовлетворительно'),
    ('4', 'Хорошо'),
    ('5', 'Отлично')
)


class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Название бренда")

    class Meta:
        default_related_name = "brands"
        verbose_name = "Бренд"
        verbose_name_plural = "Бренды"

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Человеко-читаемое название")
    name_latinica = models.CharField(max_length=100, verbose_name="название на латинице")

    class Meta:
        default_related_name = "categories"
        verbose_name = "Категория"
        verbose_name_plural = "Категории"

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=100, unique=True, db_index=True, verbose_name='Название товара')
    slug = models.SlugField(editable=False)
    discount = models.PositiveIntegerField(default=0, blank=True, verbose_name="Скидка в процентах")
    price_standart = models.PositiveIntegerField(verbose_name="Цена стандартная")
    price = models.PositiveIntegerField(db_index=True, editable=False, verbose_name="Цена конечная")
    image = models.ImageField(upload_to='covers', blank=True, null=True, verbose_name="Изображение")
    height = models.PositiveSmallIntegerField(blank=True, null=True)
    depth = models.PositiveSmallIntegerField(blank=True, null=True)
    width = models.PositiveSmallIntegerField(blank=True, null=True)
    brand = models.ForeignKey(Brand, null=True, on_delete=models.SET_NULL, verbose_name='Бренд')
    category = models.ManyToManyField(Category, verbose_name='Категория')
    total_rate = models.FloatField(editable=False, verbose_name="Средний рейтинг", default=0.0)

    class Meta:
        ordering = ['name', ]
        default_related_name = 'products'
        verbose_name = "Товар"
        verbose_name_plural = "Товары"

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('product_detail', args={'slug': self.slug})

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        self.price = math.ceil(self.price_standart * ((100 - self.discount) / 100))
        reviews = Review.objects.filter(product=self)
        if reviews:
            total_rate = reviews.aggregate(models.Avg('rate'))
        else:
            total_rate = {'rate__avg': 0}
        self.total_rate = round(total_rate['rate__avg'], 2)
        super().save(*args, **kwargs)


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews', verbose_name='Товар')
    review = models.TextField(blank=True, null=True, verbose_name='Отзыв')
    date = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=False, on_delete=models.SET_NULL, verbose_name='Автор')
    rate = models.CharField(max_length=50, choices=Rate, default="5", verbose_name='Рейтинг')

    class Meta:
        ordering = ['-rate', ]
        default_related_name = 'reviews'
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'

    def __str__(self):
        return "Комментарий для " + self.product.name

    def get_absolute_url(self):
        return Product.objects.get(pk=self.product.pk).get_absolute_url()

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        print(self.product.save(update_fields=["total_rate"]))