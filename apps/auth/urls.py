from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, AuthViewSet, UserViewSet, 
    UserProfileViewSet, ProductionAccessViewSet
)

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='users')
router.register(r'profiles', UserProfileViewSet, basename='profiles')
router.register(r'production-access', ProductionAccessViewSet, basename='production-access')

urlpatterns = [
    # JWT Token endpoints
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Auth action endpoints
    path('register/', AuthViewSet.as_view({'post': 'register'}), name='register'),
    path('logout/', AuthViewSet.as_view({'post': 'logout'}), name='logout'),
    path('me/', AuthViewSet.as_view({'get': 'me'}), name='me'),
    path('me/update/', AuthViewSet.as_view({'put': 'update_profile', 'patch': 'update_profile'}), name='update_profile'),
    path('change-password/', AuthViewSet.as_view({'post': 'change_password'}), name='change_password'),
    path('sessions/', AuthViewSet.as_view({'get': 'sessions'}), name='sessions'),
    path('terminate-session/', AuthViewSet.as_view({'post': 'terminate_session'}), name='terminate_session'),
    
    # Include router URLs
    path('', include(router.urls)),
]