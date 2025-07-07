from rest_framework import permissions
from django.contrib.auth.models import User

class IsAdminOrSelf(permissions.BasePermission):
    """Allow access to admins or the user themselves"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Admin can access everything
        if request.user.is_staff:
            return True
        
        # Admin role can access everything
        if hasattr(request.user, 'profile') and request.user.profile.role == 'admin':
            return True
        
        # User can access their own profile
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # If obj is User model directly
        if isinstance(obj, User):
            return obj == request.user
        
        return False

class CanManageUsers(permissions.BasePermission):
    """Permission for user management (admin, producer roles)"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Django superuser
        if request.user.is_superuser:
            return True
        
        # Admin role
        if hasattr(request.user, 'profile'):
            return request.user.profile.role in ['admin', 'producer']
        
        return False

class CanManageProduction(permissions.BasePermission):
    """Permission for production management"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        if hasattr(request.user, 'profile'):
            return request.user.profile.role in ['admin', 'producer', 'director', 'pm']
        
        return False
    
    def has_object_permission(self, request, view, obj):
        # Check if user has access to this specific production
        if hasattr(obj, 'production'):
            production = obj.production
        elif hasattr(obj, 'id'):  # Assuming obj is Production
            production = obj
        else:
            return False
        
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return False
        
        # Admin roles have full access
        if profile.role in ['admin', 'producer']:
            return True
        
        # Check specific production access
        return profile.has_production_access(production)

class CanEditSchedule(permissions.BasePermission):
    """Permission for schedule editing"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if request.user.is_superuser:
            return True
        
        if hasattr(request.user, 'profile'):
            return request.user.profile.role in ['admin', 'producer', 'director', 'pm', 'ad']
        
        return False
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Get production from object
        production = None
        if hasattr(obj, 'production'):
            production = obj.production
        elif hasattr(obj, 'shooting_day') and hasattr(obj.shooting_day, 'production'):
            production = obj.shooting_day.production
        
        if not production:
            return False
        
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return False
        
        # Check if user can edit schedule for this production
        return profile.can_edit_schedule(production)

class CanViewScript(permissions.BasePermission):
    """Permission for script viewing"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Get production
        production = getattr(obj, 'production', obj)
        
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return False
        
        # Admin roles can always view
        if profile.role in ['admin', 'producer', 'director']:
            return True
        
        # Check specific access permission
        access = profile.production_accesses.filter(
            production=production,
            is_active=True
        ).first()
        
        return access and access.can_view_script if access else False