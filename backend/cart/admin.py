from django.contrib import admin
from .models import Cart, CartItem


class CartItemAdmin(admin.ModelAdmin):
    list_display = ['product', 'quantity', 'cart']


class CartItemInline(admin.TabularInline):
    model = CartItem


class CartAdmin(admin.ModelAdmin):
    inlines = [
        CartItemInline,
    ]
    list_filter = ["user", ]
    list_display = ['id', 'user', 'created_at']


admin.site.register(Cart, CartAdmin)
admin.site.register(CartItem, CartItemAdmin)
