from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserProfile, ProductionAccess, LoginSession

class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'is_active']
        read_only_fields = ['id']

class UserProfileSerializer(serializers.ModelSerializer):
    """User profile with extended info"""
    user = UserSerializer(read_only=True)
    production_count = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'role', 'phone', 'emergency_contact', 'emergency_phone',
            'timezone', 'notification_email', 'notification_sms', 'notification_push',
            'is_active', 'verified_at', 'last_active', 'production_count'
        ]
        read_only_fields = ['id', 'verified_at', 'last_active']
    
    def get_production_count(self, obj):
        return obj.production_accesses.filter(is_active=True).count()

class ProductionAccessSerializer(serializers.ModelSerializer):
    """Production access permissions"""
    user_name = serializers.CharField(source='user_profile.display_name', read_only=True)
    production_title = serializers.CharField(source='production.title', read_only=True)
    granted_by_name = serializers.CharField(source='granted_by.get_full_name', read_only=True)
    
    class Meta:
        model = ProductionAccess
        fields = [
            'id', 'user_name', 'production_title', 'can_view_schedule', 'can_edit_schedule',
            'can_view_script', 'can_view_budget', 'can_view_contacts', 'can_manage_crew',
            'can_send_notifications', 'is_active', 'granted_by_name', 'granted_at', 'notes'
        ]
        read_only_fields = ['id', 'granted_at', 'granted_by_name']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token with user profile data"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        profile = getattr(user, 'profile', None)
        if profile:
            token['role'] = profile.role
            token['display_name'] = profile.display_name
            token['timezone'] = profile.timezone
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user profile data to response
        profile = getattr(self.user, 'profile', None)
        if profile:
            data['user'] = {
                'id': self.user.id,
                'username': self.user.username,
                'email': self.user.email,
                'full_name': self.user.get_full_name(),
                'role': profile.role,
                'display_name': profile.display_name,
                'timezone': profile.timezone,
            }
        
        return data

class RegisterSerializer(serializers.ModelSerializer):
    """User registration"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    role = serializers.CharField(required=False)
    phone = serializers.CharField(required=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm', 'role', 'phone']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        password_confirm = validated_data.pop('password_confirm')
        role = validated_data.pop('role', 'crew')
        phone = validated_data.pop('phone', '')
        
        user = User.objects.create_user(**validated_data)
        
        # Create profile
        UserProfile.objects.create(
            user=user,
            role=role,
            phone=phone
        )
        
        return user

class PasswordChangeSerializer(serializers.Serializer):
    """Change password"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect')
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user