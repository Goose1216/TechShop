from django.contrib import admin
from .models import Order, OrderItem


class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['product', 'order', 'quantity', 'total_price']


class OrderItemInline(admin.TabularInline):
    model = OrderItem


class OrderAdmin(admin.ModelAdmin):
    model = Order
    inlines = [
        OrderItemInline,
    ]
    list_filter = ["client"]
    list_display = ['uuid', 'client', 'status', 'total_price', 'created_at']


admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem, OrderItemAdmin)