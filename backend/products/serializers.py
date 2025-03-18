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
        fields = ('name', 'slug', 'price_standart', "discount", "price", 'brand', 'category', 'image', 'pk' , 'total_rate')
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