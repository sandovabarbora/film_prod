# apps/realtime/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WebSocketConnectionViewSet, RealtimeEventViewSet,
    ChatRoomViewSet, ChatMessageViewSet, RealtimeDashboardViewSet
)

router = DefaultRouter()
router.register(r'connections', WebSocketConnectionViewSet)
router.register(r'events', RealtimeEventViewSet)
router.register(r'chat-rooms', ChatRoomViewSet)
router.register(r'messages', ChatMessageViewSet)
router.register(r'dashboard', RealtimeDashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]