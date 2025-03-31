from django.urls import path
from .views import CartView, DeleteCartView, CartCount


urlpatterns = [
    path("", CartView.as_view(), name="cart"),
    path("count/", CartCount.as_view(), name="cart_count"),
    path("delete/", DeleteCartView.as_view(), name="cart_delete"),
]

