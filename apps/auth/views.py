from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.utils import timezone
from django.db.models import Q
import logging

from .models import UserProfile, ProductionAccess, LoginSession
from .serializers import (
    UserSerializer, UserProfileSerializer, ProductionAccessSerializer,
    CustomTokenObtainPairSerializer, RegisterSerializer,
    PasswordChangeSerializer
)
from .permissions import IsAdminOrSelf, CanManageUsers

logger = logging.getLogger(__name__)

class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT login with session tracking"""
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Track login session
            user = User.objects.get(username=request.data.get('username'))
            self._create_login_session(request, user)
            
            # Update last login
            user.last_login = timezone.now()
            user.save()
            
            # Update profile last_active
            if hasattr(user, 'profile'):
                user.profile.last_active = timezone.now()
                user.profile.save()
        
        return response
    
    def _create_login_session(self, request, user):
        """Create login session record"""
        session_key = request.session.session_key
        if not session_key:
            request.session.save()
            session_key = request.session.session_key
        
        # Get client info
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        LoginSession.objects.create(
            user=user,
            session_key=session_key,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class AuthViewSet(viewsets.ViewSet):
    """Authentication endpoints"""
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        """User registration"""
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Auto-login after registration
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """Logout and blacklist refresh token"""
        try:
            refresh_token = request.data.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            # Mark session as logged out
            session_key = request.session.session_key
            if session_key:
                LoginSession.objects.filter(
                    user=request.user,
                    session_key=session_key,
                    logout_at__isnull=True
                ).update(logout_at=timezone.now())
            
            logout(request)
            return Response({'message': 'Successfully logged out'})
        
        except Exception as e:
            logger.error(f"Logout error for user {request.user}: {e}")
            return Response({'error': 'Logout failed'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user info"""
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        
        profile_data = None
        if hasattr(request.user, 'profile'):
            profile_data = UserProfileSerializer(request.user.profile).data
        
        return Response({
            'user': UserSerializer(request.user).data,
            'profile': profile_data
        })
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update user profile"""
        profile = getattr(request.user, 'profile', None)
        if not profile:
            # Create profile if doesn't exist
            profile = UserProfile.objects.create(user=request.user)
        
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change password"""
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Password changed successfully'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    """User management (admin only)"""
    queryset = User.objects.select_related('profile').prefetch_related('profile__production_accesses')
    serializer_class = UserSerializer
    permission_classes = [CanManageUsers]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )
        
        # Filter by role
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(profile__role=role)
        
        return queryset.order_by('-date_joined')

class UserProfileViewSet(viewsets.ModelViewSet):
    """User profile management"""
    queryset = UserProfile.objects.select_related('user').prefetch_related('production_accesses')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminOrSelf]

class ProductionAccessViewSet(viewsets.ModelViewSet):
    """Production access management"""
    queryset = ProductionAccess.objects.select_related('user_profile__user', 'production', 'granted_by')
    serializer_class = ProductionAccessSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by production
        production_id = self.request.query_params.get('production')
        if production_id:
            queryset = queryset.filter(production_id=production_id)
        
        return queryset.order_by('-granted_at')
    
    def perform_create(self, serializer):
        serializer.save(granted_by=self.request.user)