from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from users.views import GoogleLoginView, YandexLoginView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/products/', include('products.urls')),
    path('api-auth/', include('rest_framework.urls'), name="api_auth"),
    path('api/v1/dj-rest-auth/', include('dj_rest_auth.urls')),
    path('api/v1/dj-allauth/', include('allauth.urls'), name='socialaccount_signup'),
    path('api/v1/dj-rest-auth/registration/', include('dj_rest_auth.registration.urls'),
         name='rest_registration'),
    #path('v1/dj-rest-auth/password/reset/confirm/<uidb64>/<token>/',
    #     PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    # re_path(r'^v1/dj-rest-auth/account-confirm-email/(?P<key>[-:\w]+)/$', confirm_email,
    #       name='account_confirm_email'),
    path("api/v1/dj-rest-auth/google/login/", GoogleLoginView.as_view(), name="google_login"),
    path("api/v1/dj-rest-auth/yandex/login/", YandexLoginView.as_view(), name="yandex_login"),
    #path('schema/', SpectacularAPIView.as_view(), name='schema'),
    #path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

