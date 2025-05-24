from allauth.account.adapter import DefaultAccountAdapter
from urllib.parse import quote

class CustomAccountAdapter(DefaultAccountAdapter):
    def get_email_confirmation_url(self, request, emailconfirmation):
        frontend_url = 'http://localhost:3000'
        key = emailconfirmation.key
        return f"{frontend_url}/email_verification/{key}/"

    def send_mail(self, template_prefix, email, context):
        if 'password_reset_url' in context:
            password_reset_url_list = context['password_reset_url'].split('/')
            key = password_reset_url_list[-2]
            uid =  password_reset_url_list[-3]
            context['password_reset_url'] = f'http://localhost:3000/password_reset_confirm/{uid}/{key}/'
        super().send_mail(template_prefix, email, context)