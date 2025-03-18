from django.urls import path
from .views import ProductMain

urlpatterns = [
    path('api/v1/products/main/', ProductMain.as_view(), name='products-main'),
]