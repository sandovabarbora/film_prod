# apps/realtime/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(
        r'ws/production/(?P<production_id>[0-9a-f-]+)/$',
        consumers.ProductionConsumer.as_asgi()
    ),
    re_path(
        r'ws/chat/(?P<room_id>[0-9a-f-]+)/$',
        consumers.ChatConsumer.as_asgi()
    ),
]
