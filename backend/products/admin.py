from django.contrib import admin
from .models import Product, Review, Brand, Category
from django.urls import path
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.contrib import messages
from django.core.management import call_command
from io import StringIO
import sys
from .models import Product



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


    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'import-products/',
                self.admin_site.admin_view(self.import_products),
                name='import_products'
            ),
        ]
        return custom_urls + urls

    def import_products(self, request):
        if request.method == 'POST':

            try:
                call_command('import_products')
                messages.success(
                    request,
                    f"Товары импортированы успешно!"
                )
            except Exception as e:
                messages.error(
                    request,
                    f"Ошибка во время импорта: {str(e)}"
                )

            return HttpResponseRedirect('../')

        return render(
            request,
            'admin/products/products_import.html',
            context={'opts': self.model._meta}
        )


admin.site.register(Product, ProductAdmin)
admin.site.register(Review, ReviewAdmin)
admin.site.register(Brand)
admin.site.register(Category)

