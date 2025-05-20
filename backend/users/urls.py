from django.urls import path, re_path
from .views import (
    GoogleLoginView, YandexLoginView, CustomLoginView, CustomLogoutView,
    UserDetailsView, PasswordChangeView, PasswordResetView, PasswordResetConfirmView,
    RegisterView, VerifyEmailView, ResendEmailVerificationView)

urlpatterns = [
    path('registration/', RegisterView.as_view(), name='rest_register'),
    path(r'registration/verify-email/', VerifyEmailView.as_view(), name='rest_verify_email'),
    path(r'registration/resend-email/', ResendEmailVerificationView.as_view(), name="rest_resend_email"),
    path("password/change/", PasswordChangeView.as_view(), name='rest_password_change'),
    path("password/reset/", PasswordResetView.as_view(), name='rest_password_reset'),
    path("password/reset/confirm/", PasswordResetConfirmView.as_view(), name='rest_password_reset_confirm'),
    path("user/", UserDetailsView.as_view(), name='rest_user_details'),
    path('login/', CustomLoginView.as_view(), name='account_login'),
    path('logout/', CustomLogoutView.as_view(), name='account_logout'),
    path("google/login/", GoogleLoginView.as_view(), name="google_login"),
    path("yandex/login/", YandexLoginView.as_view(), name="yandex_login"),
]

