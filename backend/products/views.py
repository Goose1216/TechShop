from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.validators import ValidationError

from .models import Product, Review, Category
from .serializers import ProductSerializerList, ProductSerializerDetail, ReviewSerializerCreate, ReviewSerializerList, CategorySerializer
from drf_spectacular.utils import extend_schema
from django.db.models import F, Func, Q
from django.contrib.auth.models import AnonymousUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ProductImportSerializer
from .models import Product
from django.core.files import File


@extend_schema(tags=['Products'], summary="Отображает список всех товаров")
class ProductList(generics.ListAPIView):
    serializer_class = ProductSerializerList

    def get_queryset(self):
        queryset = Product.objects.all()

        query = self.request.query_params.get("q")
        if query:
            queryset = self.search_products(queryset, query)

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
    def search_products(queryset, query):
        # Несмотря на icontains запрос регистрочувствительный
        query_list = query.split(' ')
        for query in query_list:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(brand__name__icontains=query) |
                Q(category__name__icontains=query)
            ).distinct()
        return queryset

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


@extend_schema(tags=['Products'], summary="Отображает один конкретный товар")
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


@extend_schema(tags=['Products'], summary="Отображает список товаров с категорией 'новинка' или с скидкой")
class ProductMain(generics.ListAPIView):
    pagination_class = None
    serializer_class = ProductSerializerList

    def get_queryset(self):
        queryset = Product.objects.filter(Q(category__name='Новинка') | Q(category__name='Выгодно')).order_by("-total_rate", "-discount")
        return queryset

@extend_schema(tags=['Reviews'], summary="Создание корзины")
class ReviewCreate(generics.CreateAPIView):
    permission_classes = (IsAuthenticated,)
    model = Review
    serializer_class = ReviewSerializerCreate

    def perform_create(self, serializer):
        queryset = Review.objects.filter(author=self.request.user, product=serializer.validated_data.get('product'))
        if queryset.exists():
            raise ValidationError("Пользователь уже оставил свой отзыв")
        serializer.save(author=self.request.user)


@extend_schema(tags=['Reviews'], summary="Список отзывов")
class ReviewList(generics.ListAPIView):
    serializer_class = ReviewSerializerList
    pagination_class = None

    def get_queryset(self):
        slug = self.request.query_params.get("slug")
        product = Product.objects.get(slug=slug)
        queryset = Review.objects.filter(product=product)
        return queryset

@extend_schema(tags=['Other'], summary="Возвращает список категорий")
class CategoryList(generics.ListAPIView):
    serializer_class = CategorySerializer
    pagination_class = None
    queryset = Category.objects.all()

@extend_schema(tags=['Other'], summary="Запуск импорта")
class ProductImportAPIView(APIView):
    serializer_class = None
    def post(self, request, format=None):
        serializer = ProductImportSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            products_data = serializer.process_file(
                serializer.validated_data['data_file'],
                serializer.validated_data['images_dir']
            )

            results = self.import_products(products_data, serializer.validated_data['images_dir'])

            return Response({
                'status': 'success',
                'created': results['created'],
                'updated': results['updated'],
                'total': len(products_data)
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def import_products(self, products_data, images_dir):
        created = 0
        updated = 0

        for product_data in products_data:
            image_path = product_data.pop('image_path', '')
            categories = product_data.pop('categories', [])
            brand = product_data.pop('brand', None)

            product, is_created = Product.objects.update_or_create(
                name=product_data['name'],
                defaults=product_data
            )

            if brand:
                product.brand = brand
                product.save()

            if categories:
                product.category.set(categories)

            if image_path:
                image_full_path = images_dir / image_path
                if image_full_path.exists():
                    with open(image_full_path, 'rb') as img_file:
                        product.image.save(
                            image_path,
                            File(img_file),
                            save=True
                        )

            if is_created:
                created += 1
            else:
                updated += 1

        return {'created': created, 'updated': updated}