from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ShootingDayViewSet, SceneScheduleViewSet, DayBreakViewSet,
    StatusUpdateViewSet, ProductionCalendarViewSet, ScheduleChangeViewSet
)

router = DefaultRouter()
router.register(r'shooting-days', ShootingDayViewSet)
router.register(r'scene-schedules', SceneScheduleViewSet)
router.register(r'breaks', DayBreakViewSet)
router.register(r'status-updates', StatusUpdateViewSet)
router.register(r'calendars', ProductionCalendarViewSet)
router.register(r'changes', ScheduleChangeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]