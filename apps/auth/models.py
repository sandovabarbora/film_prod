from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
import uuid

class UserProfile(models.Model):
    """Extended user profile for production access and roles"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    ROLE_CHOICES = [
        ('admin', 'System Administrator'),
        ('producer', 'Producer'),
        ('director', 'Director'),
        ('pm', 'Production Manager'), 
        ('ad', 'Assistant Director'),
        ('crew', 'Crew Member'),
        ('talent', 'Talent'),
        ('client', 'Client/Executive'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='crew')
    phone = models.CharField(max_length=20, blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)
    
    # Preferences
    timezone = models.CharField(max_length=50, default='UTC')
    notification_email = models.BooleanField(default=True)
    notification_sms = models.BooleanField(default=False)
    notification_push = models.BooleanField(default=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    last_active = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['user__last_name', 'user__first_name']
    
    def __str__(self):
        return f"{self.user.get_full_name()} ({self.role})"
    
    @property
    def display_name(self):
        name = self.user.get_full_name()
        return name if name else self.user.username
    
    def has_production_access(self, production):
        """Check if user has access to specific production"""
        return self.production_accesses.filter(production=production, is_active=True).exists()
    
    def can_edit_schedule(self, production):
        """Check if user can edit schedule for production"""
        if self.role in ['admin', 'producer', 'director', 'pm']:
            return True
        access = self.production_accesses.filter(production=production).first()
        return access and access.can_edit_schedule if access else False

class ProductionAccess(models.Model):
    """User access permissions for specific productions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='production_accesses')
    production = models.ForeignKey('production.Production', on_delete=models.CASCADE, related_name='user_accesses')
    
    # Access levels
    can_view_schedule = models.BooleanField(default=True)
    can_edit_schedule = models.BooleanField(default=False)
    can_view_script = models.BooleanField(default=False)
    can_view_budget = models.BooleanField(default=False)
    can_view_contacts = models.BooleanField(default=True)
    can_manage_crew = models.BooleanField(default=False)
    can_send_notifications = models.BooleanField(default=False)
    
    # Status
    is_active = models.BooleanField(default=True)
    granted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='granted_accesses')
    granted_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['user_profile', 'production']
        ordering = ['-granted_at']
    
    def __str__(self):
        return f"{self.user_profile.display_name} -> {self.production.title}"

class LoginSession(models.Model):
    """Track user login sessions for security"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_sessions')
    
    # Session info
    session_key = models.CharField(max_length=40, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    # Timestamps
    login_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    logout_at = models.DateTimeField(null=True, blank=True)
    
    # Security
    is_suspicious = models.BooleanField(default=False)
    location_country = models.CharField(max_length=2, blank=True)
    location_city = models.CharField(max_length=100, blank=True)
    
    class Meta:
        ordering = ['-login_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.login_at}"
    
    @property
    def is_active(self):
        return self.logout_at is None