from django.urls import path
from .views import OrderList, create_order_view, OrderDetail

urlpatterns = [
    path("create/", create_order_view, name='orders_create'),
    path("list/", OrderList.as_view(), name='orders_list'),
    path("<uuid:uuid>/", OrderDetail.as_view(), name='orders_detail'),
]