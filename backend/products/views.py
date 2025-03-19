from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.validators import ValidationError

from .models import Product, Review, Category
from .serializers import ProductSerializerList, ProductSerializerDetail, ReviewSerializerCreate, ReviewSerializerList, CategorySerializer
#from drf_spectacular.utils import extend_schema
from django.db.models import F, Func, Q
from django.contrib.auth.models import AnonymousUser


#@extend_schema(summary="Отображает список всех товаров")
class ProductList(generics.ListAPIView):
    serializer_class = ProductSerializerList

    def get_queryset(self):
        queryset = Product.objects.all()

        query = self.request.query_params.get("q")
        if query:
            queryset = self.search_products(query)

        brand = self.request.query_params.get("brand")
        if brand:
            queryset = self.filter_by_brand(queryset, brand)

        price = self.request.query_params.get("price")
        if price:
            queryset = self.filter_by_price(queryset, price)

        sort_by = self.request.query_params.get("sort")
        if sort_by:
            queryset = self.sort_results(queryset, sort_by)

        queryset = queryset.select_related("brand")
        return queryset

    @staticmethod
    def search_products(query):
        return query

    @staticmethod
    def filter_by_brand(queryset, brand):
        brands = map(lambda x: x.lower(), brand.split('-'))
        return queryset.annotate(brand_lower=Func(F("brand__name"), function="LOWER")).filter(brand_lower__in=brands)

    @staticmethod
    def filter_by_category(queryset, category):
        categories = category.split("-")
        return queryset.filter(category__name_latinica__in=categories).distinct()

    @staticmethod
    def filter_by_price(queryset, price):
        min_price, max_price = map(int, price.split('-'))
        return queryset.filter(price__range=(min_price, max_price))

    @staticmethod
    def sort_results(queryset, *args):
        return queryset.order_by(*args)


#@extend_schema(summary="Отображает один конкретный товар")
class ProductDetail(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializerDetail
    lookup_field = 'slug'

    def get_serializer_context(self):
        slug = self.kwargs.get('slug')
        context = super().get_serializer_context()
        is_user_authorized = False
        is_reviewed = False
        if not isinstance(self.request.user, AnonymousUser):
            is_user_authorized = True
            is_reviewed = Review.objects.filter(author=self.request.user, product__slug=slug).exists()
        context['is_user_authorized'] = is_user_authorized
        context['is_reviewed'] = is_reviewed
        return context


#@extend_schema(summary="Отображает список товаров с категорией 'новинка' или с скидкой")
class ProductMain(generics.ListAPIView):
    pagination_class = None
    serializer_class = ProductSerializerList

    def get_queryset(self):
        queryset = Product.objects.filter(Q(category__name='Новинка') | Q(category__name='Выгодно'))
        return queryset


class ReviewCreate(generics.CreateAPIView):
    permission_classes = (IsAuthenticated,)
    model = Review
    serializer_class = ReviewSerializerCreate

    def perform_create(self, serializer):
        queryset = Review.objects.filter(author=self.request.user, product=serializer.validated_data.get('product'))
        if queryset.exists():
            raise ValidationError("Пользователь уже оставил свой отзыв")
        serializer.save(author=self.request.user)


class ReviewList(generics.ListAPIView):
    serializer_class = ReviewSerializerList
    pagination_class = None

    def get_queryset(self):
        slug = self.request.query_params.get("slug")
        product = Product.objects.get(slug=slug)
        queryset = Review.objects.filter(product=product)
        return queryset


class CategoryList(generics.ListAPIView):
    serializer_class = CategorySerializer
    pagination_class = None
    queryset = Category.objects.all()