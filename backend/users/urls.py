from django.urls import path

from .views import GoogleLoginView, YandexLoginView, CustomLoginView, CustomLogoutView

urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='account_login'),
    path('logout/', CustomLogoutView.as_view(), name='account_logout'),
    path("google/login/", GoogleLoginView.as_view(), name="google_login"),
    path("yandex/login/", YandexLoginView.as_view(), name="yandex_login"),
]

