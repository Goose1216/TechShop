from rest_framework import pagination
from rest_framework.response import Response
from math import ceil
from .models import Product
from django.db.models import Min, Max


class CustomPagination(pagination.PageNumberPagination):
    def get_paginated_response(self, data):
        return Response({
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'count_products': self.page.paginator.count,
            "count_pages": ceil(self.page.paginator.count / self.page_size),
            "min_price": Product.objects.all().aggregate(Min('price'))['price__min'],
            "max_price": Product.objects.all().aggregate(Max('price'))["price__max"],
            "brands": set(x["brand__name"] for x in Product.objects.values('brand__name')), # distinct почему-то не работал(
            'results': data,
        })