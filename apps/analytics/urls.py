from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.dashboard_views import AnalyticsDashboardViewSet, MetricsCalculationViewSet

router = DefaultRouter()
router.register(r'dashboard', AnalyticsDashboardViewSet, basename='analytics-dashboard')
router.register(r'metrics', MetricsCalculationViewSet, basename='analytics-metrics')

urlpatterns = [
    path('', include(router.urls)),
]