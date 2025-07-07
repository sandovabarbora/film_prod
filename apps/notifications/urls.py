from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NotificationChannelViewSet, NotificationViewSet,
    LiveStatusUpdateViewSet, WeatherAlertViewSet
)

router = DefaultRouter()
router.register(r'channels', NotificationChannelViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'status-updates', LiveStatusUpdateViewSet)
router.register(r'weather-alerts', WeatherAlertViewSet)

urlpatterns = [
    path('', include(router.urls)),
]