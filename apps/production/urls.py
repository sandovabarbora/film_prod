from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductionViewSet, SceneViewSet, ShotViewSet, LocationViewSet, TakeViewSet

router = DefaultRouter()
router.register(r'productions', ProductionViewSet)
router.register(r'scenes', SceneViewSet, basename='scene')
router.register(r'shots', ShotViewSet, basename='shot')
router.register(r'locations', LocationViewSet, basename='location')
router.register(r'takes', TakeViewSet, basename='take')

urlpatterns = [
    path('', include(router.urls)),
]