# Generated by Django 4.2.20 on 2025-03-20 08:31

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Brand',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True, verbose_name='Название бренда')),
            ],
            options={
                'verbose_name': 'Бренд',
                'verbose_name_plural': 'Бренды',
                'default_related_name': 'brands',
            },
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True, verbose_name='Человеко-читаемое название')),
                ('name_latinica', models.CharField(max_length=100, verbose_name='название на латинице')),
            ],
            options={
                'verbose_name': 'Категория',
                'verbose_name_plural': 'Категории',
                'default_related_name': 'categories',
            },
        ),
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_index=True, max_length=100, unique=True, verbose_name='Название товара')),
                ('slug', models.SlugField(editable=False)),
                ('discount', models.PositiveIntegerField(default=0, verbose_name='Скидка в процентах')),
                ('price_standart', models.PositiveIntegerField(verbose_name='Цена стандартная')),
                ('price', models.PositiveIntegerField(db_index=True, editable=False, verbose_name='Цена конечная')),
                ('image', models.ImageField(blank=True, null=True, upload_to='covers', verbose_name='Изображение')),
                ('height', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('depth', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('width', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('total_rate', models.FloatField(default=0.0, editable=False, verbose_name='Средний рейтинг')),
            ],
            options={
                'verbose_name': 'Товар',
                'verbose_name_plural': 'Товары',
                'ordering': ['name'],
                'default_related_name': 'products',
            },
        ),
        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('review', models.TextField(blank=True, null=True, verbose_name='Отзыв')),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('rate', models.CharField(choices=[('1', 'Ужасно'), ('2', 'Плохо'), ('3', 'Удовлетворительно'), ('4', 'Хорошо'), ('5', 'Отлично')], default='5', max_length=50, verbose_name='Рейтинг')),
            ],
            options={
                'verbose_name': 'Отзыв',
                'verbose_name_plural': 'Отзывы',
                'ordering': ['-rate'],
                'default_related_name': 'reviews',
            },
        ),
    ]
