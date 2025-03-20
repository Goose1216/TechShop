from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.yandex.views import YandexAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client

from dj_rest_auth.registration.views import SocialLoginView


class GoogleLoginView(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = 'http://localhost:3000/login/google'
    client_class = OAuth2Client


class YandexLoginView(SocialLoginView):
    adapter_class = YandexAuth2Adapter
    callback_url = 'http://localhost:3000/login/yandex'
    client_class = OAuth2Client