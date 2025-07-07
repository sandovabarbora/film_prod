from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductionMetricsViewSet, CrewPerformanceViewSet, BudgetTrackingViewSet,
    ProgressReportViewSet, VelocityTrendViewSet, AnalyticsDashboardViewSet
)

router = DefaultRouter()
router.register(r'metrics', ProductionMetricsViewSet)
router.register(r'crew-performance', CrewPerformanceViewSet)
router.register(r'budget', BudgetTrackingViewSet)
router.register(r'reports', ProgressReportViewSet)
router.register(r'velocity', VelocityTrendViewSet)
router.register(r'dashboard', AnalyticsDashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]