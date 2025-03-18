from django.contrib import admin
from .models import Product, Review, Brand, Category


class ReviewAdmin(admin.ModelAdmin):
    list_display = ["product", "author", "date", "rate"]


class ReviewInline(admin.TabularInline):
    model = Review


class ProductAdmin(admin.ModelAdmin):
    inlines = [
        ReviewInline,
    ]
    list_filter = ["brand", ]
    list_display = ["name", "price_standart", "discount", "price", "brand", 'slug', 'total_rate']


admin.site.register(Product, ProductAdmin)
admin.site.register(Review, ReviewAdmin)
admin.site.register(Brand)
admin.site.register(Category)