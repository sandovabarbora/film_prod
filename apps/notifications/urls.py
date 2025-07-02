# notifications/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
# TODO: Přidat viewsets až budou potřeba

urlpatterns = [
    path('', include(router.urls)),
]