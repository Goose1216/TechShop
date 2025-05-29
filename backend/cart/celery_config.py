from celery.schedules import crontab

from techshop.celery import app

app.conf.beat_schedule = {
    "cleanup-old-tasks-daily": {
        "task": "cart.tasks.delete_all_old_cart",
        "schedule": crontab(hour="0", minute="0"),
    },
}
