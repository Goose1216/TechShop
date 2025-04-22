import os
from pathlib import Path
import csv
import json

from rest_framework import serializers
from .models import Product, Category, Brand, Review


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        fields = ("name", "name_latinica")
        model = Category


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ("name",)
        model = Brand


class ProductSerializerList(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True, many=True)
    brand = serializers.StringRelatedField(many=False)

    class Meta:
        fields = ('name', 'slug', 'price_standart', "discount", "price", 'brand', 'category', 'image', 'pk', 'total_rate')
        model = Product


class ProductSerializerDetail(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True, many=True)
    brand = serializers.StringRelatedField(many=False)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['is_authorized'] = self.context['is_user_authorized']
        representation['is_reviewed'] = self.context['is_reviewed']
        return representation

    class Meta:
        fields = '__all__'
        lookup_field = 'slug'
        model = Product


class ReviewSerializerCreate(serializers.ModelSerializer):
    author = serializers.StringRelatedField(many=False)

    class Meta:
        fields = ('product', 'review', 'date', 'author', "rate")
        model = Review


class ReviewSerializerList(serializers.ModelSerializer):
    author = serializers.StringRelatedField(many=False)

    class Meta:
        fields = ('product', 'review', 'date', 'author', "rate")
        model = Review


class ProductImportSerializer(serializers.Serializer):
    data_file = serializers.FileField(required=True)
    images_dir = serializers.CharField(required=True)

    def validate_images_dir(self, value):
        path = Path(value)
        if not path.exists():
            raise serializers.ValidationError("Directory does not exist")
        return path

    def process_file(self, file, images_dir):
        ext = os.path.splitext(file.name)[1].lower()

        if ext == '.csv':
            return self.process_csv(file, images_dir)
        elif ext == '.json':
            return self.process_json(file, images_dir)
        else:
            raise serializers.ValidationError("Unsupported file format")

    def process_csv(self, file, images_dir):
        products = []
        decoded_file = file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)

        for row in reader:
            products.append(self.prepare_product_data(row, images_dir))

        return products

    def process_json(self, file, images_dir):
        data = json.loads(file.read().decode('utf-8'))
        return [self.prepare_product_data(item, images_dir) for item in data]

    def prepare_product_data(self, data, images_dir):
        product_data = {
            'name': data.get('name', '').strip(),
            'price_standart': int(data.get('price', 0)),
            'discount': int(data.get('discount', 0)),
            'height': int(data.get('height', 0)) if data.get('height') else None,
            'width': int(data.get('width', 0)) if data.get('width') else None,
            'depth': int(data.get('depth', 0)) if data.get('depth') else None,
            'image_path': data.get('image', '').strip(),
        }

        if data.get('brand'):
            brand, _ = Brand.objects.get_or_create(name=data['brand'].strip())
            product_data['brand'] = brand

        if data.get('categories'):
            categories = []
            categories_list = data['categories'].split(',') if isinstance(data['categories'], str) else data[
                'categories']
            for cat_name in categories_list:
                cat_name = cat_name.strip()
                if cat_name:
                    category, _ = Category.objects.get_or_create(
                        name=cat_name)
                    categories.append(category)
                    product_data['categories'] = categories

        return product_data