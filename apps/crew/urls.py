# apps/crew/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, PositionViewSet, CrewMemberViewSet,
    CrewAssignmentViewSet, CallSheetViewSet, CharacterViewSet
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'positions', PositionViewSet)
router.register(r'members', CrewMemberViewSet)
router.register(r'assignments', CrewAssignmentViewSet)
router.register(r'call-sheets', CallSheetViewSet)
router.register(r'characters', CharacterViewSet)

urlpatterns = [
    path('', include(router.urls)),
]