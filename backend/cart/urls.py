from django.urls import path
from .views import CartItemList, CartItemAdd, CartItemDelete, CartItemUpdate, DeleteCartView, CartCount, run_task


urlpatterns = [
    path("", CartItemList.as_view(), name="cart_item_list"),
    path("add/", CartItemAdd.as_view(), name="cart_item_add"),
    path("remove/<int:product_id>/", CartItemDelete.as_view(), name="cart_item_delete"),
    path("update/<int:product_id>/", CartItemUpdate.as_view(), name="cart_item_update"),
    path("count/", CartCount.as_view(), name="cart_count"),
    path("delete/", DeleteCartView.as_view(), name="cart_delete"),
    path("task/", run_task, name='run_tasks'),

]

