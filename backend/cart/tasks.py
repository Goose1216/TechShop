from celery import shared_task
import datetime

from django.utils import timezone

from .models import Cart
from logging import getLogger

logger = getLogger("backend")

@shared_task
def delete_all_old_cart():
    """ Удаляет все корзины, которые не обновлялись более недели """
    logger.info("Start deleting old carts")
    week_ago = timezone.now() - datetime.timedelta(days=7)
    carts = Cart.objects.filter(last_updated__lte=week_ago)
    count = carts.count()
    if count > 0:
        for cart in carts:
            cart.delete()
        logger.info(f"Deleted {count} carts")
    else:
        logger.info('No cart for deleting')
